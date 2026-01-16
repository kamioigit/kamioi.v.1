#!/usr/bin/env python3
"""
LLM Training Module for Kamioi
Handles model training, data export, and model updates
"""

import json
import csv
import os
import time
from datetime import datetime
import sqlite3
from typing import List, Dict, Any
import hashlib

class LLMTrainer:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self.training_sessions = {}
        
    def export_approved_mappings(self) -> List[Dict[str, Any]]:
        """Export all approved mappings for training"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Get all approved mappings with their details
        query = '''
            SELECT 
                lm.id,
                lm.merchant_name,
                lm.ticker,
                lm.category,
                lm.confidence,
                lm.company_name,
                lm.created_at,
                lm.user_id,
                t.merchant,
                t.amount,
                t.description
            FROM llm_mappings lm
            LEFT JOIN transactions t ON lm.transaction_id = t.id
            WHERE lm.status = 'approved' 
            AND lm.admin_approved = 1
            ORDER BY lm.created_at DESC
        '''
        
        cursor.execute(query)
        mappings = cursor.fetchall()
        
        # Convert to list of dictionaries
        columns = [
            'id', 'merchant_name', 'ticker', 'category', 'confidence',
            'company_name', 'created_at', 'user_id', 'transaction_merchant',
            'amount', 'description'
        ]
        
        result = []
        for mapping in mappings:
            mapping_dict = dict(zip(columns, mapping))
            result.append(mapping_dict)
        
        conn.close()
        return result
    
    def create_training_dataset(self, mappings: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Create a structured training dataset from mappings"""
        dataset = {
            'metadata': {
                'total_mappings': len(mappings),
                'created_at': datetime.now().isoformat(),
                'version': '1.0'
            },
            'merchant_patterns': {},
            'category_patterns': {},
            'confidence_distribution': {},
            'training_samples': []
        }
        
        # Analyze patterns
        for mapping in mappings:
            merchant = mapping['merchant_name'].lower().strip()
            ticker = mapping['ticker'].upper().strip()
            category = mapping['category'].lower().strip()
            confidence = float(mapping['confidence']) if mapping['confidence'] else 0.0
            
            # Build merchant patterns
            if merchant not in dataset['merchant_patterns']:
                dataset['merchant_patterns'][merchant] = {
                    'ticker': ticker,
                    'category': category,
                    'confidence': confidence,
                    'count': 1
                }
            else:
                dataset['merchant_patterns'][merchant]['count'] += 1
                # Update confidence to average
                current_conf = dataset['merchant_patterns'][merchant]['confidence']
                current_count = dataset['merchant_patterns'][merchant]['count']
                dataset['merchant_patterns'][merchant]['confidence'] = (
                    (current_conf * (current_count - 1) + confidence) / current_count
                )
            
            # Build category patterns
            if category not in dataset['category_patterns']:
                dataset['category_patterns'][category] = {
                    'tickers': [ticker],
                    'merchants': [merchant],
                    'count': 1
                }
            else:
                if ticker not in dataset['category_patterns'][category]['tickers']:
                    dataset['category_patterns'][category]['tickers'].append(ticker)
                if merchant not in dataset['category_patterns'][category]['merchants']:
                    dataset['category_patterns'][category]['merchants'].append(merchant)
                dataset['category_patterns'][category]['count'] += 1
            
            # Confidence distribution
            conf_range = f"{int(confidence//10)*10}-{int(confidence//10)*10+9}"
            if conf_range not in dataset['confidence_distribution']:
                dataset['confidence_distribution'][conf_range] = 0
            dataset['confidence_distribution'][conf_range] += 1
            
            # Training samples
            dataset['training_samples'].append({
                'input': merchant,
                'expected_ticker': ticker,
                'expected_category': category,
                'confidence': confidence
            })
        
        return dataset
    
    def generate_model_insights(self, dataset: Dict[str, Any]) -> Dict[str, Any]:
        """Generate insights about the model and data"""
        insights = {
            'data_quality': {
                'total_unique_merchants': len(dataset['merchant_patterns']),
                'total_categories': len(dataset['category_patterns']),
                'average_confidence': 0.0,
                'high_confidence_mappings': 0,
                'low_confidence_mappings': 0
            },
            'patterns': {
                'most_common_categories': [],
                'most_common_tickers': [],
                'confidence_distribution': dataset['confidence_distribution']
            },
            'recommendations': []
        }
        
        # Calculate average confidence
        total_conf = sum(sample['confidence'] for sample in dataset['training_samples'])
        insights['data_quality']['average_confidence'] = (
            total_conf / len(dataset['training_samples']) if dataset['training_samples'] else 0
        )
        
        # Count high/low confidence mappings
        for sample in dataset['training_samples']:
            if sample['confidence'] >= 80:
                insights['data_quality']['high_confidence_mappings'] += 1
            elif sample['confidence'] < 50:
                insights['data_quality']['low_confidence_mappings'] += 1
        
        # Most common categories
        category_counts = [(cat, data['count']) for cat, data in dataset['category_patterns'].items()]
        category_counts.sort(key=lambda x: x[1], reverse=True)
        insights['patterns']['most_common_categories'] = category_counts[:10]
        
        # Most common tickers
        ticker_counts = {}
        for sample in dataset['training_samples']:
            ticker = sample['expected_ticker']
            ticker_counts[ticker] = ticker_counts.get(ticker, 0) + 1
        
        ticker_counts = [(ticker, count) for ticker, count in ticker_counts.items()]
        ticker_counts.sort(key=lambda x: x[1], reverse=True)
        insights['patterns']['most_common_tickers'] = ticker_counts[:10]
        
        # Generate recommendations
        if insights['data_quality']['low_confidence_mappings'] > insights['data_quality']['high_confidence_mappings']:
            insights['recommendations'].append("Consider reviewing low-confidence mappings for accuracy")
        
        if len(dataset['merchant_patterns']) < 100:
            insights['recommendations'].append("More training data needed for better model performance")
        
        if insights['data_quality']['average_confidence'] < 70:
            insights['recommendations'].append("Average confidence is low - review mapping quality")
        
        return insights
    
    def simulate_model_training(self, dataset: Dict[str, Any]) -> Dict[str, Any]:
        """Simulate the actual ML model training process"""
        training_results = {
            'training_id': f"train_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            'start_time': datetime.now().isoformat(),
            'status': 'training',
            'progress': 0,
            'epochs': 10,
            'current_epoch': 0,
            'loss': 1.0,
            'accuracy': 0.0,
            'validation_accuracy': 0.0
        }
        
        # Simulate training progress
        for epoch in range(training_results['epochs']):
            time.sleep(0.5)  # Simulate training time
            
            training_results['current_epoch'] = epoch + 1
            training_results['progress'] = int((epoch + 1) / training_results['epochs'] * 100)
            
            # Simulate improving metrics
            training_results['loss'] = max(0.1, 1.0 - (epoch + 1) * 0.08)
            training_results['accuracy'] = min(0.95, (epoch + 1) * 0.09)
            training_results['validation_accuracy'] = min(0.92, (epoch + 1) * 0.085)
            
            # Update training session
            self.training_sessions[training_results['training_id']] = training_results.copy()
        
        # Final results
        training_results['status'] = 'completed'
        training_results['end_time'] = datetime.now().isoformat()
        training_results['final_metrics'] = {
            'loss': training_results['loss'],
            'accuracy': training_results['accuracy'],
            'validation_accuracy': training_results['validation_accuracy'],
            'improvement': '+12.5%'  # Simulated improvement
        }
        
        return training_results
    
    def update_model_weights(self, training_results: Dict[str, Any]) -> Dict[str, Any]:
        """Update model weights and configuration"""
        model_update = {
            'model_version': f"v{datetime.now().strftime('%Y%m%d_%H%M')}",
            'updated_at': datetime.now().isoformat(),
            'training_id': training_results['training_id'],
            'weights_hash': hashlib.md5(
                f"{training_results['training_id']}{training_results['final_metrics']['accuracy']}".encode()
            ).hexdigest()[:16],
            'performance_metrics': training_results['final_metrics'],
            'deployment_status': 'ready'
        }
        
        # In a real implementation, this would:
        # 1. Save the new model weights
        # 2. Update the model configuration
        # 3. Deploy the new model
        # 4. Update the database with new model version
        
        return model_update
    
    def get_training_session(self, training_id: str) -> Dict[str, Any]:
        """Get training session details"""
        return self.training_sessions.get(training_id, {})
    
    def get_all_training_sessions(self) -> List[Dict[str, Any]]:
        """Get all training sessions"""
        return list(self.training_sessions.values())
    
    def export_training_data_to_csv(self, dataset: Dict[str, Any], filename: str = None) -> str:
        """Export training data to CSV file"""
        if not filename:
            filename = f"training_data_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
        
        filepath = os.path.join('training_exports', filename)
        os.makedirs('training_exports', exist_ok=True)
        
        with open(filepath, 'w', newline='', encoding='utf-8') as csvfile:
            fieldnames = ['merchant_name', 'ticker', 'category', 'confidence', 'company_name']
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
            
            writer.writeheader()
            for sample in dataset['training_samples']:
                writer.writerow({
                    'merchant_name': sample['input'],
                    'ticker': sample['expected_ticker'],
                    'category': sample['expected_category'],
                    'confidence': sample['confidence'],
                    'company_name': sample['input']  # Use merchant name as company name
                })
        
        return filepath


