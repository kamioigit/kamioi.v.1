"""
Route Blueprints for Kamioi Platform v10072025
"""

# Import all blueprints
from .admin import admin_bp
from .user import user_bp
# Use simple versions with mock data for now
from .family_simple import family_bp
from .business_simple import business_bp

__all__ = ['admin_bp', 'user_bp', 'family_bp', 'business_bp']


