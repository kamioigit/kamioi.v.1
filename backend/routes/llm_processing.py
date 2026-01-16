"""
LLM Processing Routes - API endpoints for AI processing
"""

from flask import Blueprint, request, jsonify
from services.ai_processor import AIProcessor
from services.learning_service import LearningService
from database_manager import db_manager
from datetime import datetime
import json

llm_processing_bp = Blueprint('llm_processing', __name__)
ai_processor = AIProcessor()
learning_service = LearningService()

@llm_processing_bp.route('/api/admin/llm-center/process-mapping/<int:mapping_id>', methods=['POST'])
def process_mapping(mapping_id):
    """Process a single mapping with AI and store response"""
    try:
        # Get mapping from database using db_manager
        conn = db_manager.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, merchant_name, ticker, category, user_id, status, 
                       confidence, company_name, transaction_id
                FROM llm_mappings
                WHERE id = ?
            """, (mapping_id,))
            
            row = cursor.fetchone()
            if not row:
                return jsonify({
                    'success': False,
                    'error': f'Mapping {mapping_id} not found'
                }), 404
            
            # Convert to dict
            mapping_dict = {
                'id': row[0],
                'merchant_name': row[1] or '',
                'ticker': row[2] or '',
                'category': row[3] or '',
                'user_id': row[4] or '',
                'status': row[5] or 'pending',
                'confidence': row[6] or 0.0,
                'company_name': row[7] or '',
                'transaction_id': row[8]
            }
            
            # Process with AI (this stores the response automatically)
            print(f"🔄 Processing mapping {mapping_id} with AI...")
            ai_result = ai_processor.process_mapping(mapping_dict)
            print(f"✅ AI processing complete. Result: {ai_result}")
            
            # Update mapping in database with AI results (using same connection)
            # Add AI columns if they don't exist
            try:
                cursor.execute("ALTER TABLE llm_mappings ADD COLUMN ai_attempted INTEGER DEFAULT 0")
                conn.commit()
            except:
                pass  # Column already exists
            try:
                cursor.execute("ALTER TABLE llm_mappings ADD COLUMN ai_status TEXT")
                conn.commit()
            except:
                pass
            try:
                cursor.execute("ALTER TABLE llm_mappings ADD COLUMN ai_confidence REAL")
                conn.commit()
            except:
                pass
            try:
                cursor.execute("ALTER TABLE llm_mappings ADD COLUMN ai_reasoning TEXT")
                conn.commit()
            except:
                pass
            try:
                cursor.execute("ALTER TABLE llm_mappings ADD COLUMN ai_model_version TEXT")
                conn.commit()
            except:
                pass
            try:
                cursor.execute("ALTER TABLE llm_mappings ADD COLUMN ai_processing_duration INTEGER")
                conn.commit()
            except:
                pass
            try:
                cursor.execute("ALTER TABLE llm_mappings ADD COLUMN ai_processing_time TEXT")
                conn.commit()
            except:
                pass
            try:
                cursor.execute("ALTER TABLE llm_mappings ADD COLUMN suggested_ticker TEXT")
                conn.commit()
            except:
                pass
            
            # Prepare update values
            ai_status = ai_result.get('ai_status', 'uncertain')
            ai_confidence = float(ai_result.get('ai_confidence', 0.0))
            ai_reasoning = str(ai_result.get('ai_reasoning', ''))
            ai_model_version = str(ai_result.get('ai_model_version', 'deepseek-chat'))
            ai_processing_duration = int(ai_result.get('ai_processing_duration', 0))
            ai_processing_time = datetime.now().isoformat()
            suggested_ticker = str(ai_result.get('suggested_ticker', '')) if ai_result.get('suggested_ticker') else None
            
            print(f"📝 Updating mapping with: status={ai_status}, confidence={ai_confidence}, reasoning={ai_reasoning[:50]}...")
            
            # Update mapping with AI results
            cursor.execute("""
                UPDATE llm_mappings
                SET ai_attempted = 1,
                    ai_status = ?,
                    ai_confidence = ?,
                    ai_reasoning = ?,
                    ai_model_version = ?,
                    ai_processing_duration = ?,
                    ai_processing_time = ?,
                    suggested_ticker = ?,
                    ai_processed = 1
                WHERE id = ?
            """, (
                ai_status,
                ai_confidence,
                ai_reasoning,
                ai_model_version,
                ai_processing_duration,
                ai_processing_time,
                suggested_ticker,
                mapping_id
            ))
            
            rows_updated = cursor.rowcount
            print(f"📊 UPDATE executed. Rows affected: {rows_updated}")
            
            if rows_updated == 0:
                print(f"⚠️ Warning: No rows updated for mapping {mapping_id}")
                # Try to verify the mapping exists
                cursor.execute("SELECT id FROM llm_mappings WHERE id = ?", (mapping_id,))
                exists = cursor.fetchone()
                print(f"🔍 Mapping exists check: {exists}")
            else:
                print(f"✅ Updated {rows_updated} row(s) for mapping {mapping_id}")
            
            conn.commit()
            print(f"💾 Changes committed to database")
            
            # Verify the update
            cursor.execute("SELECT ai_attempted, ai_status, ai_confidence FROM llm_mappings WHERE id = ?", (mapping_id,))
            verify_row = cursor.fetchone()
            print(f"✅ Verification: ai_attempted={verify_row[0]}, ai_status={verify_row[1]}, ai_confidence={verify_row[2]}")
            
        except Exception as e:
            print(f"❌ Error updating mapping: {e}")
            import traceback
            traceback.print_exc()
            conn.rollback()
        finally:
            db_manager.release_connection(conn)
        
        return jsonify({
            'success': True,
            'data': {
                'mapping_id': mapping_id,
                'ai_status': ai_result.get('ai_status', 'uncertain'),
                'ai_confidence': ai_result.get('ai_confidence', 0.0),
                'ai_reasoning': ai_result.get('ai_reasoning', ''),
                'suggested_ticker': ai_result.get('suggested_ticker', ''),
                'ai_processing_duration': ai_result.get('ai_processing_duration', 0),
                'ai_processing_time': ai_result.get('ai_processing_time', ''),
                'ai_model_version': ai_result.get('ai_model_version', 'deepseek-chat'),
                'ai_response_stored': True  # Confirms response was stored for learning
            }
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@llm_processing_bp.route('/api/admin/llm-center/process-batch', methods=['POST'])
def process_batch():
    """Process multiple mappings in batch"""
    try:
        data = request.json or {}
        mappings_data = data.get('mappings', [])  # Expect array of mapping objects
        
        if not mappings_data:
            return jsonify({
                'success': False,
                'error': 'mappings array is required'
            }), 400
        
        results = []
        
        for mapping_data in mappings_data:
            try:
                mapping_dict = {
                    'id': mapping_data.get('id', 0),
                    'merchant_name': mapping_data.get('merchant_name', ''),
                    'category': mapping_data.get('category', ''),
                    'ticker': mapping_data.get('ticker', ''),
                    'user_id': mapping_data.get('user_id', '')
                }
                
                ai_result = ai_processor.process_mapping(mapping_dict)
                
                results.append({
                    'mapping_id': mapping_dict['id'],
                    'success': True,
                    'ai_status': ai_result.get('ai_status', 'uncertain'),
                    'ai_response_stored': True
                })
                
            except Exception as e:
                results.append({
                    'mapping_id': mapping_data.get('id', 0),
                    'success': False,
                    'error': str(e)
                })
        
        return jsonify({
            'success': True,
            'processed': len(results),
            'results': results
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@llm_processing_bp.route('/api/admin/llm-center/learning/accuracy', methods=['GET'])
def get_accuracy():
    """Get AI accuracy metrics from stored responses"""
    try:
        days = request.args.get('days', 30, type=int)
        accuracy_data = learning_service.calculate_accuracy(days=days)
        
        return jsonify({
            'success': True,
            'data': accuracy_data
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@llm_processing_bp.route('/api/admin/llm-center/learning/knowledge-base', methods=['GET'])
def get_knowledge_base():
    """Get merchant knowledge base built from stored responses"""
    try:
        limit = request.args.get('limit', 100, type=int)
        knowledge_base = learning_service.get_merchant_knowledge_base(limit=limit)
        
        return jsonify({
            'success': True,
            'data': knowledge_base,
            'count': len(knowledge_base)
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@llm_processing_bp.route('/api/admin/llm-center/learning/feedback', methods=['POST'])
def record_feedback():
    """Record admin feedback on AI response for learning"""
    try:
        data = request.json
        ai_response_id = data.get('ai_response_id')
        admin_action = data.get('admin_action')  # 'approved', 'rejected', 'corrected'
        correct_ticker = data.get('correct_ticker')
        notes = data.get('notes')
        
        if not ai_response_id or not admin_action:
            return jsonify({
                'success': False,
                'error': 'ai_response_id and admin_action are required'
            }), 400
        
        ai_response = learning_service.record_feedback(
            ai_response_id=ai_response_id,
            admin_action=admin_action,
            correct_ticker=correct_ticker,
            notes=notes
        )
        
        return jsonify({
            'success': True,
            'message': 'Feedback recorded for learning',
            'data': {
                'ai_response_id': ai_response_id,
                'was_ai_correct': ai_response[12] if ai_response and len(ai_response) > 12 else None
            }
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@llm_processing_bp.route('/api/admin/llm-center/learning/insights', methods=['GET'])
def get_insights():
    """Get learning insights and recommendations"""
    try:
        insights = learning_service.get_learning_insights()
        
        return jsonify({
            'success': True,
            'data': insights
        })
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

