"""
Standalone script to train and save fraud detection models.
Can be run directly: python scripts/train_models.py
"""
import sys
import os
import logging

# Add backend root to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(message)s",
    datefmt="%H:%M:%S",
)

from anomaly_detection.train import train_models

if __name__ == "__main__":
    force = "--force" in sys.argv or "-f" in sys.argv
    print("SecurePay Vision – Model Training")
    print("=" * 40)
    success = train_models(force=force)
    sys.exit(0 if success else 1)
