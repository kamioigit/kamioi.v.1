"""
API Balance Model - Tracks current DeepSeek API balance
"""

from database import db
from datetime import datetime

class APIBalance(db.Model):
    """
    Tracks the current API balance for DeepSeek
    
    This is a singleton table (only one record)
    """
    __tablename__ = 'api_balance'
    
    id = db.Column(db.Integer, primary_key=True)
    balance = db.Column(db.Numeric(10, 2), nullable=False, default=20.0)  # Current balance in USD
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now, nullable=False)
    
    def to_dict(self):
        """Convert to dictionary for JSON responses"""
        return {
            'id': self.id,
            'balance': float(self.balance),
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<APIBalance ${float(self.balance)}>'

