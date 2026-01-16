"""
Configuration file for Kamioi Platform
Supports both SQLite (development) and PostgreSQL (production)
"""
import os
from typing import Optional

class DatabaseConfig:
    """Database configuration"""
    
    # Database type: 'sqlite' or 'postgresql'
    DB_TYPE = os.getenv('DB_TYPE', 'postgresql').lower()  # Default to PostgreSQL
    
    # SQLite configuration (default/fallback)
    SQLITE_DB_PATH = os.getenv('SQLITE_DB_PATH', 'kamioi.db')
    
    # PostgreSQL configuration
    POSTGRES_HOST = os.getenv('POSTGRES_HOST', 'localhost')  # Use localhost (Kamioi hostname doesn't resolve)
    POSTGRES_PORT = int(os.getenv('POSTGRES_PORT', '5432'))
    POSTGRES_DB = os.getenv('POSTGRES_DB', 'kamioi')  # Database name
    POSTGRES_USER = os.getenv('POSTGRES_USER', 'postgres')  # Default PostgreSQL user
    POSTGRES_PASSWORD = os.getenv('POSTGRES_PASSWORD', 'Seminole!1')
    
    # Connection pooling settings (PostgreSQL only)
    POOL_SIZE = int(os.getenv('DB_POOL_SIZE', '20'))
    MAX_OVERFLOW = int(os.getenv('DB_MAX_OVERFLOW', '40'))
    POOL_TIMEOUT = int(os.getenv('DB_POOL_TIMEOUT', '30'))
    POOL_RECYCLE = int(os.getenv('DB_POOL_RECYCLE', '3600'))  # 1 hour
    
    @classmethod
    def get_postgres_url(cls) -> str:
        """Get PostgreSQL connection URL"""
        return f"postgresql://{cls.POSTGRES_USER}:{cls.POSTGRES_PASSWORD}@{cls.POSTGRES_HOST}:{cls.POSTGRES_PORT}/{cls.POSTGRES_DB}"
    
    @classmethod
    def is_postgresql(cls) -> bool:
        """Check if using PostgreSQL"""
        return cls.DB_TYPE == 'postgresql'
    
    @classmethod
    def is_sqlite(cls) -> bool:
        """Check if using SQLite"""
        return cls.DB_TYPE == 'sqlite'

# Flask configuration
class FlaskConfig:
    """Flask application configuration"""
    SECRET_KEY = os.getenv('SECRET_KEY', 'kamioi-secret-key-2024')
    JSON_AS_ASCII = False

