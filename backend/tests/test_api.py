import json
import pytest

from importlib import import_module

# Import the Flask app without running as __main__
app_module = import_module('app')
app = app_module.app

@pytest.fixture
def client():
    app.testing = True
    with app.test_client() as client:
        yield client

def test_health(client):
    resp = client.get('/api/health')
    assert resp.status_code == 200
    data = resp.get_json()
    assert data.get('status') == 'healthy'


def test_transactions_validation(client):
    # Missing required fields
    resp = client.post('/api/transactions', json={})
    assert resp.status_code == 400
    data = resp.get_json()
    assert data['success'] is False
    assert 'user_id' in data['error'] or 'amount' in data['error']

    # Invalid amount
    resp = client.post('/api/transactions', json={'user_id': 1, 'amount': 0})
    assert resp.status_code == 400


def test_mappings_submit_validation(client):
    # Missing merchant_name
    resp = client.post('/api/mappings/submit', json={'ticker': 'AAPL'})
    assert resp.status_code == 400
    # Missing ticker
    resp = client.post('/api/mappings/submit', json={'merchant_name': 'Apple'})
    assert resp.status_code == 400


def test_admin_require_auth(client):
    # No auth token
    resp = client.get('/api/admin/transactions')
    assert resp.status_code in (401, 403)


def test_admin_with_token(client):
    # Admin seeded as id=4 in database_manager.seed_initial_data()
    headers = {'Authorization': 'Bearer token_4'}
    resp = client.get('/api/admin/transactions', headers=headers)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data['success'] is True
