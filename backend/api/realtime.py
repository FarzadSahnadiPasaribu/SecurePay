"""
WebSocket endpoint for real-time fraud alerts.
Clients subscribe with a valid JWT token and receive fraud event notifications.
"""
import json
import asyncio
import logging
from typing import Dict, Set
from datetime import datetime

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, status
from jose import JWTError, jwt

import os

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/realtime", tags=["Real-time Alerts"])

JWT_SECRET = os.getenv("JWT_SECRET", "securepay-vision-secret-key-2024")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


# ---------------------------------------------------------------------------
# Connection manager
# ---------------------------------------------------------------------------

class ConnectionManager:
    """Manages active WebSocket connections per user."""

    def __init__(self):
        # user_id -> set of websockets
        self._connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self._connections:
            self._connections[user_id] = set()
        self._connections[user_id].add(websocket)
        logger.info("WS connected: user=%s total=%d", user_id, self.total_connections)

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self._connections:
            self._connections[user_id].discard(websocket)
            if not self._connections[user_id]:
                del self._connections[user_id]
        logger.info("WS disconnected: user=%s", user_id)

    async def send_to_user(self, user_id: str, message: dict):
        """Send a JSON message to all connections for a given user."""
        sockets = self._connections.get(user_id, set())
        dead = set()
        for ws in sockets:
            try:
                await ws.send_json(message)
            except Exception:
                dead.add(ws)
        for ws in dead:
            sockets.discard(ws)

    async def broadcast(self, message: dict):
        """Broadcast to all connected users."""
        for user_id in list(self._connections.keys()):
            await self.send_to_user(user_id, message)

    @property
    def total_connections(self) -> int:
        return sum(len(v) for v in self._connections.values())

    @property
    def connected_users(self) -> list:
        return list(self._connections.keys())


manager = ConnectionManager()


# ---------------------------------------------------------------------------
# Token validation
# ---------------------------------------------------------------------------

def _validate_token(token: str) -> str | None:
    """Return user_id if token valid, else None."""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None


# ---------------------------------------------------------------------------
# WebSocket endpoint
# ---------------------------------------------------------------------------

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(..., description="JWT access token"),
):
    user_id = _validate_token(token)
    if not user_id:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await manager.connect(websocket, user_id)

    # Send welcome
    await websocket.send_json({
        "type": "connected",
        "message": "SecurePay Vision real-time alerts active",
        "user_id": user_id,
        "timestamp": datetime.utcnow().isoformat(),
    })

    try:
        while True:
            # Keep connection alive; wait for client pings
            try:
                data = await asyncio.wait_for(websocket.receive_json(), timeout=30.0)
                msg_type = data.get("type", "")

                if msg_type == "ping":
                    await websocket.send_json({
                        "type": "pong",
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                elif msg_type == "subscribe":
                    await websocket.send_json({
                        "type": "subscribed",
                        "channel": data.get("channel", "alerts"),
                        "timestamp": datetime.utcnow().isoformat(),
                    })
                else:
                    await websocket.send_json({
                        "type": "ack",
                        "received": msg_type,
                        "timestamp": datetime.utcnow().isoformat(),
                    })

            except asyncio.TimeoutError:
                # Send heartbeat
                await websocket.send_json({
                    "type": "heartbeat",
                    "timestamp": datetime.utcnow().isoformat(),
                    "connections": manager.total_connections,
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as exc:
        logger.error("WebSocket error for user %s: %s", user_id, exc)
        manager.disconnect(websocket, user_id)


# ---------------------------------------------------------------------------
# REST endpoint to push a fraud alert (for internal use / testing)
# ---------------------------------------------------------------------------

@router.post("/alert/{user_id}", include_in_schema=True, tags=["Real-time Alerts"])
async def send_fraud_alert(user_id: str, alert: dict):
    """
    Push a fraud alert to a specific user's WebSocket connections.
    This endpoint is typically called internally when fraud is detected.
    """
    message = {
        "type": "fraud_alert",
        "timestamp": datetime.utcnow().isoformat(),
        **alert,
    }
    await manager.send_to_user(user_id, message)
    return {"sent": True, "connections": len(manager._connections.get(user_id, set()))}


@router.get("/status", tags=["Real-time Alerts"])
async def ws_status():
    """Get current WebSocket connection status."""
    return {
        "total_connections": manager.total_connections,
        "connected_users": len(manager.connected_users),
        "timestamp": datetime.utcnow().isoformat(),
    }
