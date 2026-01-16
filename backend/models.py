"""
Database Models for Kamioi Platform v10072025
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

# This will be imported from app.py
db = None

def init_db(app_db):
    global db
    db = app_db

def create_models():
    """Create all model classes after db is initialized"""
    global db
    
    class User(db.Model):
        """User model for all dashboard types"""
        __tablename__ = 'users'
        
        id = db.Column(db.Integer, primary_key=True)
        email = db.Column(db.String(120), unique=True, nullable=False, index=True)
        password = db.Column(db.String(120), nullable=False)
        name = db.Column(db.String(100), nullable=False)
        role = db.Column(db.String(20), nullable=False)  # admin, user
        account_type = db.Column(db.String(20), nullable=False)  # admin, individual, family, business
        is_active = db.Column(db.Boolean, default=True)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'email': self.email,
                'name': self.name,
                'role': self.role,
                'account_type': self.account_type,
                'is_active': self.is_active,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
        
        def __repr__(self):
            return f'<User {self.email}>'

    class Portfolio(db.Model):
        """Portfolio model for investment holdings"""
        __tablename__ = 'portfolios'
        
        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        total_value = db.Column(db.Float, default=0.0)
        total_invested = db.Column(db.Float, default=0.0)
        total_gain_loss = db.Column(db.Float, default=0.0)
        gain_loss_percentage = db.Column(db.Float, default=0.0)
        holdings = db.Column(db.JSON)  # Store holdings as JSON
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'user_id': self.user_id,
                'total_value': self.total_value,
                'total_invested': self.total_invested,
                'total_gain_loss': self.total_gain_loss,
                'gain_loss_percentage': self.gain_loss_percentage,
                'holdings': self.holdings or [],
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
        
        def __repr__(self):
            return f'<Portfolio {self.id} - User {self.user_id}>'

    class Transaction(db.Model):
        """Transaction model for all financial transactions"""
        __tablename__ = 'transactions'
        
        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        type = db.Column(db.String(20), nullable=False)  # investment, roundup, withdrawal, deposit
        amount = db.Column(db.Float, nullable=False)
        ticker = db.Column(db.String(10))
        shares = db.Column(db.Float)
        price_per_share = db.Column(db.Float)
        merchant = db.Column(db.String(100))
        category = db.Column(db.String(50))
        description = db.Column(db.Text)
        status = db.Column(db.String(20), default='completed')  # pending, completed, failed
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'user_id': self.user_id,
                'type': self.type,
                'amount': self.amount,
                'ticker': self.ticker,
                'shares': self.shares,
                'price_per_share': self.price_per_share,
                'merchant': self.merchant,
                'category': self.category,
                'description': self.description,
                'status': self.status,
                'created_at': self.created_at.isoformat() if self.created_at else None
            }
        
        def __repr__(self):
            return f'<Transaction {self.id} - {self.type} - ${self.amount}>'

    class Goal(db.Model):
        """Goal model for financial goals"""
        __tablename__ = 'goals'
        
        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        title = db.Column(db.String(100), nullable=False)
        description = db.Column(db.Text)
        target_amount = db.Column(db.Float, nullable=False)
        current_amount = db.Column(db.Float, default=0.0)
        target_date = db.Column(db.Date)
        category = db.Column(db.String(50))  # emergency, vacation, house, car, etc.
        status = db.Column(db.String(20), default='active')  # active, completed, paused
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'user_id': self.user_id,
                'title': self.title,
                'description': self.description,
                'target_amount': self.target_amount,
                'current_amount': self.current_amount,
                'target_date': self.target_date.isoformat() if self.target_date else None,
                'category': self.category,
                'status': self.status,
                'progress_percentage': (self.current_amount / self.target_amount * 100) if self.target_amount > 0 else 0,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
        
        def __repr__(self):
            return f'<Goal {self.id} - {self.title}>'

    class Notification(db.Model):
        """Notification model for user notifications"""
        __tablename__ = 'notifications'
        
        id = db.Column(db.Integer, primary_key=True)
        user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
        title = db.Column(db.String(100), nullable=False)
        message = db.Column(db.Text, nullable=False)
        type = db.Column(db.String(20), nullable=False)  # info, warning, success, error
        category = db.Column(db.String(30))  # investment, goal, system, etc.
        is_read = db.Column(db.Boolean, default=False)
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'user_id': self.user_id,
                'title': self.title,
                'message': self.message,
                'type': self.type,
                'category': self.category,
                'is_read': self.is_read,
                'created_at': self.created_at.isoformat() if self.created_at else None
            }
        
        def __repr__(self):
            return f'<Notification {self.id} - {self.title}>'

    class LLMMapping(db.Model):
        """LLM Mapping model for merchant-to-stock mappings"""
        __tablename__ = 'llm_mappings'
        
        id = db.Column(db.Integer, primary_key=True)
        merchant_name = db.Column(db.String(100), nullable=False)
        ticker_symbol = db.Column(db.String(10), nullable=False)
        category = db.Column(db.String(50))
        confidence = db.Column(db.Float, default=0.0)
        notes = db.Column(db.Text)
        status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
        source = db.Column(db.String(20))  # csv_import, user_submission, admin_manual
        created_at = db.Column(db.DateTime, default=datetime.utcnow)
        updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
        
        def to_dict(self):
            return {
                'id': self.id,
                'merchant_name': self.merchant_name,
                'ticker_symbol': self.ticker_symbol,
                'category': self.category,
                'confidence': self.confidence,
                'notes': self.notes,
                'status': self.status,
                'source': self.source,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'updated_at': self.updated_at.isoformat() if self.updated_at else None
            }
        
        def __repr__(self):
            return f'<LLMMapping {self.id} - {self.merchant_name} -> {self.ticker_symbol}>'

    # Return the models for use in the app
    return {
        'User': User,
        'Portfolio': Portfolio,
        'Transaction': Transaction,
        'Goal': Goal,
        'Notification': Notification,
        'LLMMapping': LLMMapping
    }

# Global models dictionary
models = None

def get_models():
    global models
    if models is None:
        if db is None:
            raise RuntimeError("Database not initialized. Call init_db() first.")
        models = create_models()
    return models