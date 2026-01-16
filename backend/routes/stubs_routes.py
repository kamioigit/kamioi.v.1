from flask import Blueprint, jsonify
from utils.auth_utils import require_role

stubs_bp = Blueprint("stubs", __name__)
STUB_OK = {"ok": True, "data": [], "meta": {}}

def stub(fn):
    def wrapper():
        return jsonify(STUB_OK), 200
    return wrapper

@stubs_bp.get("/google-analytics")
@require_role("admin")
def google_analytics(): return jsonify(STUB_OK), 200

@stubs_bp.get("/database/connectivity-matrix")
@require_role("admin")
def connectivity_matrix(): return jsonify(STUB_OK), 200

@stubs_bp.get("/database/data-quality")
@require_role("admin")
def data_quality(): return jsonify(STUB_OK), 200

@stubs_bp.get("/database/migrations-drift")
@require_role("admin")
def migrations_drift(): return jsonify(STUB_OK), 200

@stubs_bp.get("/database/performance")
@require_role("admin")
def db_performance(): return jsonify(STUB_OK), 200

@stubs_bp.get("/ledger/consistency")
@require_role("admin")
def ledger_consistency(): return jsonify(STUB_OK), 200

@stubs_bp.get("/pipelines/events")
@require_role("admin")
def pipelines_events(): return jsonify(STUB_OK), 200

@stubs_bp.get("/security/access")
@require_role("admin")
def security_access(): return jsonify(STUB_OK), 200

@stubs_bp.get("/replication/backups")
@require_role("admin")
def replication_backups(): return jsonify(STUB_OK), 200

@stubs_bp.get("/performance/storage")
@require_role("admin")
def performance_storage(): return jsonify(STUB_OK), 200

@stubs_bp.get("/vector-store/health")
@require_role("admin")
def vector_health(): return jsonify(STUB_OK), 200

@stubs_bp.get("/vector-store/embeddings")
@require_role("admin")
def vector_embeddings(): return jsonify(STUB_OK), 200

@stubs_bp.get("/database/warehouse-sync")
@require_role("admin")
def warehouse_sync(): return jsonify(STUB_OK), 200

@stubs_bp.get("/database/test-sandbox")
@require_role("admin")
def test_sandbox(): return jsonify(STUB_OK), 200

@stubs_bp.get("/database/alerts-slos")
@require_role("admin")
def alerts_slos(): return jsonify(STUB_OK), 200
