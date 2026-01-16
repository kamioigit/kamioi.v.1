"""
API Usage Model - Tracks all API calls and charges
"""

from database import db
from datetime import datetime
from sqlalchemy import Index

class APIUsage(db.Model):
    """
    Tracks all API calls for billing and monitoring
    
    Every API call to DeepSeek is recorded here for:
    1. Cost tracking
    2. Usage monitoring
    3. Billing purposes
    4. Performance analysis
    """
    __tablename__ = 'api_usage'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # API call details
    endpoint = db.Column(db.String(255), nullable=False)
    model = db.Column(db.String(50), nullable=False)  # e.g., 'deepseek-chat'
    prompt_tokens = db.Column(db.Integer, default=0)  # Input tokens
    completion_tokens = db.Column(db.Integer, default=0)  # Output tokens
    total_tokens = db.Column(db.Integer, default=0)  # Total tokens
    processing_time_ms = db.Column(db.Integer, nullable=False)
    
    # Cost and status
    cost = db.Column(db.Numeric(10, 4), nullable=False, default=0.0)
    success = db.Column(db.Boolean, default=True, index=True)
    error_message = db.Column(db.Text, nullable=True)
    
    # Request/Response data (optional, for debugging)
    request_data = db.Column(db.Text, nullable=True)  # JSON
    response_data = db.Column(db.Text, nullable=True)  # JSON
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.now, nullable=False, index=True)
    
    # Indexes for fast queries
    __table_args__ = (
        Index('idx_model_created', 'model', 'created_at'),
        Index('idx_success_created', 'success', 'created_at'),
        Index('idx_date', 'created_at'),
    )
    
    def to_dict(self):
        """Convert to dictionary for JSON responses"""
        return {
            'id': self.id,
            'endpoint': self.endpoint,
            'model': self.model,
            'prompt_tokens': self.prompt_tokens,
            'completion_tokens': self.completion_tokens,
            'total_tokens': self.total_tokens,
            'processing_time_ms': self.processing_time_ms,
            'cost': float(self.cost),
            'success': self.success,
            'error_message': self.error_message,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
    
    def __repr__(self):
        return f'<APIUsage {self.id}: {self.model} - ${float(self.cost)}>'

