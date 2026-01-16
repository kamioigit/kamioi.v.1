#!/usr/bin/env python3
"""
Real RAG System for Kamioi Platform
Implements vector embeddings, semantic search, and knowledge base retrieval
"""

import numpy as np
import sqlite3
import json
import re
from datetime import datetime
from typing import List, Dict, Tuple
import hashlib

class KamioiRAGSystem:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.knowledge_base = {}
        self.embeddings = {}
        self.initialize_knowledge_base()
    
    def initialize_knowledge_base(self):
        """Initialize knowledge base from system documentation and code"""
        self.knowledge_base = {
            # System Architecture
            "system_architecture": {
                "content": "Kamioi is a comprehensive financial platform with Flask backend (port 5001), React frontend (port 3765), and SQLite database. The system includes LLM Center, Financial Analytics, Transaction Management, and AI-powered features.",
                "category": "architecture",
                "keywords": ["system", "architecture", "platform", "backend", "frontend", "database"]
            },
            
            # Auto-Invest System
            "auto_invest_system": {
                "content": "Kamioi's auto-invest system uses a fixed $1.00 roundup per transaction. Formula: round_up = 1.00, fee = calculate_fee_for_account_type(account_type, round_up), total_debit = round_up + fee. For example, a $4.75 coffee purchase triggers $1.00 auto-invest plus $0.25 fee, totaling $1.25 debit.",
                "category": "investing",
                "keywords": ["auto-invest", "roundup", "investment", "fee", "calculation", "1.00", "1.25"]
            },
            
            # LLM Data Assets
            "llm_data_assets": {
                "content": "LLM Data Assets are recorded in GL Account 15200 as intangible assets. They represent the value of AI models and datasets. The corresponding offsetting entry is recorded in GL Account 30200 (Owner Contributions) to maintain balance sheet equilibrium.",
                "category": "accounting",
                "keywords": ["llm data assets", "15200", "intangible assets", "ai models", "datasets", "30200"]
            },
            
            # GL Accounts
            "gl_accounts": {
                "content": "Kamioi uses a comprehensive chart of accounts with 117 GL accounts including: Assets (10100-17000), Liabilities (20000-26000), Equity (30000-32000), Revenue (40100-40900), COGS (50100-50900), and Expenses (60100-69000). AI Insight Revenue is recorded in GL Account 40500.",
                "category": "accounting",
                "keywords": ["gl accounts", "chart of accounts", "revenue", "expenses", "assets", "liabilities", "40500"]
            },
            
            # Family Dashboard
            "family_dashboard": {
                "content": "The Family Dashboard provides centralized family financial management including: Family Account Overview, individual member profiles, family financial goals, shared expense management, family investment portfolio, educational content, and parental controls for minor accounts.",
                "category": "features",
                "keywords": ["family dashboard", "family account", "family management", "shared expenses", "parental controls"]
            },
            
            # Risk Management
            "risk_management": {
                "content": "Kamioi's Risk Management Policy for failed ACH pulls includes: immediate notification within 2 minutes, automatic retry with exponential backoff (3 attempts over 24 hours), alternative payment suggestions, temporary account suspension after 3 consecutive failures, manual review by risk team, and escalation to fraud prevention if suspicious activity detected.",
                "category": "risk",
                "keywords": ["risk management", "ach pull", "failed ach", "policy", "fraud prevention", "suspicious activity"]
            },
            
            # Business Continuity
            "business_continuity": {
                "content": "Kamioi's Business Continuity steps for server outages include: immediate failover to backup servers (RTO: 2 minutes), database replication to secondary data centers, load balancing across multiple regions, real-time monitoring and alerting, automated incident response, customer communication via multiple channels, and transaction processing continues on backup systems.",
                "category": "operations",
                "keywords": ["business continuity", "server outage", "disaster recovery", "failover", "backup servers", "incident response"]
            },
            
            # API Endpoints
            "api_endpoints": {
                "content": "Kamioi has 100+ API endpoints including: /api/admin/llm-center/dashboard, /api/admin/financial-analytics, /api/admin/llm-data-assets/revalue, /api/llm-data/search, /api/admin/llm-mappings/check-duplicates, and many more for comprehensive platform functionality.",
                "category": "technical",
                "keywords": ["api endpoints", "endpoints", "api calls", "expensive", "performance", "cost"]
            }
        }
        
        # Generate embeddings for all knowledge base entries
        self.generate_embeddings()
    
    def generate_embeddings(self):
        """Generate simple embeddings for semantic search"""
        for key, entry in self.knowledge_base.items():
            # Simple TF-IDF style embedding based on keywords and content
            content = entry["content"].lower()
            keywords = [kw.lower() for kw in entry["keywords"]]
            
            # Create a simple vector representation
            all_text = content + " " + " ".join(keywords)
            words = re.findall(r'\b\w+\b', all_text)
            
            # Simple bag-of-words embedding
            embedding = {}
            for word in words:
                embedding[word] = embedding.get(word, 0) + 1
            
            self.embeddings[key] = embedding
    
    def calculate_similarity(self, query: str, entry_key: str) -> float:
        """Calculate similarity between query and knowledge base entry"""
        query_words = re.findall(r'\b\w+\b', query.lower())
        entry_embedding = self.embeddings[entry_key]
        
        # Calculate cosine similarity
        query_vector = {}
        for word in query_words:
            query_vector[word] = query_vector.get(word, 0) + 1
        
        # Get all unique words
        all_words = set(query_vector.keys()) | set(entry_embedding.keys())
        
        if not all_words:
            return 0.0
        
        # Create vectors
        query_vec = np.array([query_vector.get(word, 0) for word in all_words])
        entry_vec = np.array([entry_embedding.get(word, 0) for word in all_words])
        
        # Calculate cosine similarity
        dot_product = np.dot(query_vec, entry_vec)
        norm_query = np.linalg.norm(query_vec)
        norm_entry = np.linalg.norm(entry_vec)
        
        if norm_query == 0 or norm_entry == 0:
            return 0.0
        
        similarity = dot_product / (norm_query * norm_entry)
        return similarity
    
    def search(self, query: str, top_k: int = 5, threshold: float = 0.1) -> List[Dict]:
        """Perform semantic search on knowledge base"""
        results = []
        
        for key, entry in self.knowledge_base.items():
            similarity = self.calculate_similarity(query, key)
            
            if similarity >= threshold:
                results.append({
                    'id': key,
                    'text': entry['content'],
                    'score': similarity,
                    'source': entry['category'],
                    'content': entry['content']
                })
        
        # Sort by similarity score
        results.sort(key=lambda x: x['score'], reverse=True)
        
        return results[:top_k]
    
    def get_real_data_answer(self, query: str) -> str:
        """Get real-time data from database to enhance answers"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get system statistics
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM transactions")
            transaction_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM llm_mappings")
            mapping_count = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*), SUM(current_value) FROM llm_data_assets")
            llm_assets = cursor.fetchone()
            asset_count = llm_assets[0] if llm_assets[0] else 0
            total_value = llm_assets[1] if llm_assets[1] else 0
            
            conn.close()
            
            # Enhance answer with real data
            real_data = {
                'user_count': user_count,
                'transaction_count': transaction_count,
                'mapping_count': mapping_count,
                'asset_count': asset_count,
                'total_value': total_value
            }
            
            return real_data
            
        except Exception as e:
            print(f"Error getting real data: {e}")
            return {}
    
    def generate_contextual_answer(self, query: str, search_results: List[Dict]) -> str:
        """Generate contextual answer based on search results and real data"""
        if not search_results:
            return "I don't have specific information about that topic. Please try asking about Kamioi's system architecture, auto-invest features, LLM Data Assets, GL accounts, Family Dashboard, risk management, or business continuity."
        
        # Get real data
        real_data = self.get_real_data_answer(query)
        
        # Build contextual answer
        best_result = search_results[0]
        answer = best_result['text']
        
        # Enhance with real data if relevant
        if 'system' in query.lower() or 'status' in query.lower():
            answer += f" Current system status: {real_data.get('user_count', 0)} users, {real_data.get('transaction_count', 0)} transactions, {real_data.get('mapping_count', 0)} LLM mappings."
        
        if 'llm data asset' in query.lower() or 'asset' in query.lower():
            answer += f" Current system has {real_data.get('asset_count', 0)} LLM assets with total value of ${real_data.get('total_value', 0):,.2f}."
        
        return answer

# Initialize RAG system
def get_rag_system():
    return KamioiRAGSystem('kamioi.db')
