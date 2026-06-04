"""
Model training script for SecurePay Vision.
Trains Isolation Forest, LOF, and One-Class SVM on the synthetic dataset.
"""
import os
import logging
import numpy as np
import pandas as pd
import joblib
from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

MODELS_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "trained_models")
DATASET_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "dataset", "transactions.csv")


def load_or_generate_dataset() -> pd.DataFrame:
    """Load dataset CSV, generating it first if absent."""
    if not os.path.exists(DATASET_PATH):
        logger.info("Dataset not found – generating synthetic data …")
        from scripts.generate_dataset import generate_dataset
        generate_dataset()
    return pd.read_csv(DATASET_PATH)


def build_feature_matrix(df: pd.DataFrame) -> np.ndarray:
    """Convert raw CSV rows into feature matrix."""
    import sys
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
    from utils.preprocessing import preprocess_transaction
    from utils.feature_engineering import extract_features

    rows = []
    for _, row in df.iterrows():
        txn = row.to_dict()
        pre = preprocess_transaction(txn)
        feat = extract_features(pre)
        rows.append(feat)
    return np.array(rows, dtype=np.float32)


def train_models(force: bool = False) -> bool:
    """
    Train and persist all three anomaly detection models.

    Parameters
    ----------
    force : bool
        If True, re-train even when model files already exist.

    Returns
    -------
    bool
        True on success.
    """
    iso_path = os.path.join(MODELS_PATH, "isolation_forest.pkl")
    lof_path = os.path.join(MODELS_PATH, "lof.pkl")
    svm_path = os.path.join(MODELS_PATH, "one_class_svm.pkl")
    scaler_path = os.path.join(MODELS_PATH, "scaler.pkl")

    if not force and all(os.path.exists(p) for p in [iso_path, lof_path, svm_path, scaler_path]):
        logger.info("Models already exist – skipping training (use force=True to retrain)")
        return True

    os.makedirs(MODELS_PATH, exist_ok=True)

    try:
        logger.info("Loading dataset …")
        df = load_or_generate_dataset()

        logger.info("Building feature matrix from %d transactions …", len(df))
        X = build_feature_matrix(df)

        # Train only on NORMAL transactions for unsupervised anomaly detection
        if "is_fraud" in df.columns:
            normal_mask = df["is_fraud"].astype(int) == 0
            X_train = X[normal_mask.values]
            logger.info("Using %d normal transactions for training", len(X_train))
        else:
            X_train = X

        # Scale features
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X_train)

        # --- Isolation Forest ---
        logger.info("Training Isolation Forest …")
        iso = IsolationForest(
            n_estimators=200,
            contamination=0.05,
            max_features=1.0,
            random_state=42,
            n_jobs=-1,
        )
        iso.fit(X_scaled)

        # --- LOF ---
        logger.info("Training Local Outlier Factor …")
        lof = LocalOutlierFactor(
            n_neighbors=20,
            contamination=0.05,
            novelty=True,
            n_jobs=-1,
        )
        lof.fit(X_scaled)

        # --- One-Class SVM ---
        logger.info("Training One-Class SVM …")
        svm = OneClassSVM(
            kernel="rbf",
            nu=0.05,
            gamma="scale",
        )
        svm.fit(X_scaled)

        # Persist models
        joblib.dump(iso, iso_path, compress=3)
        joblib.dump(lof, lof_path, compress=3)
        joblib.dump(svm, svm_path, compress=3)
        joblib.dump(scaler, scaler_path, compress=3)

        logger.info("All models saved to %s", MODELS_PATH)
        return True

    except Exception as exc:
        logger.error("Model training failed: %s", exc)
        return False


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(levelname)s – %(message)s")
    success = train_models(force=True)
    print("Training", "succeeded" if success else "FAILED")
