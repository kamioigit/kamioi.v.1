"""
AI Response Model - Stores all AI responses for learning
This is the LEARNING DATABASE - critical for improving the system
"""

from database import db
from datetime import datetime
from sqlalchemy import Index

class AIResponse(db.Model):
    """
    Stores all AI responses for learning purposes
    
    This table is the foundation of the learning system.
    Every AI response is stored here to:
    1. Learn from patterns
    2. Improve accuracy over time
    3. Build merchant knowledge base
    4. Track model performance
    """
    __tablename__ = 'ai_responses'
    
    id = db.Column(db.Integer, primary_key=True)
    
    # Link to original mapping
    mapping_id = db.Column(db.Integer, db.ForeignKey('mappings.id'), nullable=True, index=True)
    
    # Merchant information (for learning patterns)
    merchant_name = db.Column(db.String(255), nullable=False, index=True)
    category = db.Column(db.String(100), nullable=True, index=True)
    
    # AI Request/Response data
    prompt = db.Column(db.Text, nullable=False)  # What we asked AI
    raw_response = db.Column(db.Text, nullable=False)  # Full AI response (JSON)
    parsed_response = db.Column(db.Text, nullable=False)  # Extracted data (JSON)
    
    # Performance metrics
    processing_time_ms = db.Column(db.Integer, nullable=False)
    model_version = db.Column(db.String(50), nullable=False)
    is_error = db.Column(db.Boolean, default=False, index=True)
    
    # Learning feedback (updated when admin approves/rejects)
    admin_feedback = db.Column(db.String(50), nullable=True)  # 'approved', 'rejected', 'corrected'
    admin_correct_ticker = db.Column(db.String(10), nullable=True)  # What admin says is correct
    was_ai_correct = db.Column(db.Boolean, nullable=True)  # True if AI was right
    feedback_notes = db.Column(db.Text, nullable=True)
    feedback_date = db.Column(db.DateTime, nullable=True)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.now, nullable=False, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    
    # Indexes for fast learning queries
    __table_args__ = (
        Index('idx_merchant_created', 'merchant_name', 'created_at'),
        Index('idx_feedback', 'was_ai_correct', 'created_at'),
        Index('idx_model_version', 'model_version', 'created_at'),
    )
    
    def to_dict(self):
        """Convert to dictionary for JSON responses"""
        return {
            'id': self.id,
            'mapping_id': self.mapping_id,
            'merchant_name': self.merchant_name,
            'category': self.category,
            'prompt': self.prompt,
            'raw_response': json.loads(self.raw_response) if self.raw_response else {},
            'parsed_response': json.loads(self.parsed_response) if self.parsed_response else {},
            'processing_time_ms': self.processing_time_ms,
            'model_version': self.model_version,
            'is_error': self.is_error,
            'admin_feedback': self.admin_feedback,
            'admin_correct_ticker': self.admin_correct_ticker,
            'was_ai_correct': self.was_ai_correct,
            'feedback_notes': self.feedback_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __repr__(self):
        return f'<AIResponse {self.id}: {self.merchant_name} - {self.model_version}>'

