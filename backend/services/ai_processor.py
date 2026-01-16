"""
AI Processor Service - DeepSeek v3 Integration
Processes merchant mappings and stores responses for learning
"""

import http.client
import json
import os
from typing import Dict, Optional, Tuple
from datetime import datetime
# Note: This service uses database_manager pattern, not SQLAlchemy
# from database import db
# from models.ai_response import AIResponse
# from models.mapping import Mapping
from services.api_usage_tracker import APIUsageTracker
from database_manager import db_manager

class AIProcessor:
    """Process mappings with DeepSeek v3 and store responses for learning"""
    
    def __init__(self):
        # Official DeepSeek API (not RapidAPI)
        self.api_key = os.getenv('DEEPSEEK_API_KEY', 'sk-20c74c5e5f2c425397645546b92d3ed2')
        self.api_base_url = "https://api.deepseek.com"
        self.model = "deepseek-chat"  # Using deepseek-chat model
        self.usage_tracker = APIUsageTracker()  # Track API calls and costs
        
    def process_mapping(self, mapping: Dict) -> Dict:
        """
        Process a merchant mapping with DeepSeek v3 AI
        
        Args:
            mapping: Dictionary with merchant_name, category, ticker, etc.
            
        Returns:
            Dictionary with ai_status, ai_confidence, ai_reasoning, etc.
        """
        start_time = datetime.now()
        mapping_id = mapping.get('id')
        
        try:
            # Build prompt for AI
            prompt = self._build_prompt(mapping)
            
            # Call DeepSeek API
            api_start_time = datetime.now()
            raw_response = self._call_deepseek_api(prompt)
            api_processing_time = int((datetime.now() - api_start_time).total_seconds() * 1000)
            
            # Track API usage with detailed token breakdown
            usage = raw_response.get('usage', {})
            prompt_tokens = usage.get('prompt_tokens', 0)
            completion_tokens = usage.get('completion_tokens', 0)
            total_tokens = usage.get('total_tokens', 0)
            
            # Prepare request data (the prompt)
            request_payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a financial analyst expert. Always respond in valid JSON format only. Do not include any text outside the JSON."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.3,
                "max_tokens": 500,
                "response_format": {"type": "json_object"}
            }
            
            # Get user_id from mapping
            user_id = mapping.get('user_id')
            if isinstance(user_id, str):
                try:
                    user_id = int(user_id)
                except:
                    user_id = None
            
            # Prepare JSON strings for storage
            request_data_str = json.dumps(request_payload)
            response_data_str = json.dumps(raw_response)
            
            print(f"📊 Recording API call with: user_id={user_id}, page_tab='LLM Center - Receipt Mappings'")
            print(f"📊 request_data length: {len(request_data_str)}, response_data length: {len(response_data_str)}")
            
            record_id = self.usage_tracker.record_api_call(
                endpoint='/api/admin/llm-center/process-mapping',
                model=self.model,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                processing_time_ms=api_processing_time,
                success=True,
                user_id=user_id,
                page_tab='LLM Center - Receipt Mappings',
                request_data=request_data_str,
                response_data=response_data_str
            )
            
            print(f"📊 API call recorded with ID: {record_id}")
            
            # Parse response
            parsed_response = self._parse_response(raw_response, mapping)
            
            # Calculate total processing time
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # Store response for learning
            self._store_ai_response(
                mapping_id=mapping_id,
                prompt=prompt,
                raw_response=raw_response,
                parsed_response=parsed_response,
                processing_time=processing_time,
                mapping_data=mapping
            )
            
            # Add metadata to result
            result = {
                'ai_attempted': True,
                'ai_status': parsed_response.get('status', 'uncertain'),
                'ai_confidence': parsed_response.get('confidence', 0.5),
                'ai_reasoning': parsed_response.get('reasoning', ''),
                'ai_model_version': self.model,
                'ai_processing_duration': processing_time,
                'ai_processing_time': datetime.now().isoformat(),
                'suggested_ticker': parsed_response.get('ticker', ''),
                'ai_response_id': None  # Will be set after storage
            }
            
            return result
            
        except Exception as e:
            error_msg = str(e)
            print(f"Error processing mapping with AI: {e}")
            
            # Track failed API call
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # Get user_id from mapping
            user_id = mapping.get('user_id') if 'mapping' in locals() else None
            if isinstance(user_id, str):
                try:
                    user_id = int(user_id)
                except:
                    user_id = None
            
            # Prepare request data if prompt exists
            request_data = None
            if 'prompt' in locals():
                request_payload = {
                    "model": self.model,
                    "messages": [
                        {
                            "role": "system",
                            "content": "You are a financial analyst expert. Always respond in valid JSON format only. Do not include any text outside the JSON."
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ],
                    "temperature": 0.3,
                    "max_tokens": 500,
                    "response_format": {"type": "json_object"}
                }
                request_data = json.dumps(request_payload)
            
            self.usage_tracker.record_api_call(
                endpoint='/api/admin/llm-center/process-mapping',
                model=self.model,
                prompt_tokens=0,
                completion_tokens=0,
                total_tokens=0,
                processing_time_ms=processing_time,
                success=False,
                error_message=error_msg,
                user_id=user_id,
                page_tab='LLM Center - Receipt Mappings',
                request_data=request_data,
                response_data=json.dumps({'error': error_msg})
            )
            
            # Store error response for learning too
            self._store_ai_response(
                mapping_id=mapping_id,
                prompt=prompt if 'prompt' in locals() else '',
                raw_response={'error': error_msg},
                parsed_response={'status': 'error', 'reasoning': error_msg},
                processing_time=int((datetime.now() - start_time).total_seconds() * 1000),
                mapping_data=mapping,
                is_error=True
            )
            
            return {
                'ai_attempted': True,
                'ai_status': 'error',
                'ai_confidence': 0.0,
                'ai_reasoning': f'Error: {error_msg}',
                'ai_model_version': self.model,
                'ai_processing_duration': int((datetime.now() - start_time).total_seconds() * 1000),
                'ai_processing_time': datetime.now().isoformat()
            }
    
    def _build_prompt(self, mapping: Dict) -> str:
        """Build the prompt for AI analysis"""
        merchant_name = mapping.get('merchant_name', 'Unknown')
        category = mapping.get('category', 'Unknown')
        ticker = mapping.get('ticker', '')
        user_id = mapping.get('user_id', '')
        
        # Get learning context from previous responses
        context = self._get_learning_context(merchant_name)
        
        prompt = f"""You are an expert financial analyst analyzing merchant transaction mappings for investment purposes.

MERCHANT MAPPING TO ANALYZE:
- Merchant Name: {merchant_name}
- Category: {category}
- Current Ticker: {ticker or 'Not assigned'}
- User ID: {user_id}

LEARNING CONTEXT FROM PREVIOUS ANALYSES:
{context}

YOUR TASK:
1. Determine the correct stock ticker for this merchant
2. Assess confidence level (0.0 to 1.0) - be honest about uncertainty
3. Provide clear, detailed reasoning for your decision
4. Recommend status: 'approved', 'rejected', 'review_required', or 'uncertain'

IMPORTANT: 
- Use status "review_required" if confidence < 0.7
- Use status "rejected" if merchant cannot be matched to any public company
- Always provide reasoning, even if uncertain

RESPOND IN JSON FORMAT ONLY:
{{
    "ticker": "AAPL",
    "confidence": 0.95,
    "status": "approved",
    "reasoning": "Clear explanation of decision with supporting evidence"
}}
"""
        return prompt
    
    def _get_learning_context(self, merchant_name: str) -> str:
        """Get context from previous AI responses for learning"""
        try:
            from database_manager import db_manager
            conn = db_manager.get_connection()
            try:
                cursor = conn.cursor()
                
                # Get similar merchant responses from ai_responses table
                cursor.execute("""
                    SELECT merchant_name, parsed_response, created_at
                    FROM ai_responses
                    WHERE merchant_name LIKE ?
                    AND is_error = 0
                    ORDER BY created_at DESC
                    LIMIT 5
                """, (f'%{merchant_name}%',))
                
                rows = cursor.fetchall()
                
                if not rows:
                    return "No previous analyses for similar merchants found."
                
                context_lines = ["Previous analyses for similar merchants:"]
                for row in rows:
                    try:
                        parsed = json.loads(row[1]) if row[1] else {}
                        context_lines.append(
                            f"- {row[0]}: {parsed.get('ticker', 'N/A')} "
                            f"(confidence: {parsed.get('confidence', 0):.2f}, "
                            f"status: {parsed.get('status', 'N/A')})"
                        )
                    except:
                        context_lines.append(f"- {row[0]}: Previous analysis available")
                
                return "\n".join(context_lines)
            finally:
                db_manager.release_connection(conn)
        except Exception as e:
            print(f"Error getting learning context: {e}")
            return "Unable to retrieve learning context."
    
    def _call_deepseek_api(self, prompt: str) -> Dict:
        """Call Official DeepSeek API"""
        import urllib.request
        import urllib.parse
        
        url = f"{self.api_base_url}/v1/chat/completions"
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a financial analyst expert. Always respond in valid JSON format only. Do not include any text outside the JSON."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.3,  # Lower temperature for more consistent results
            "max_tokens": 500,
            "response_format": {"type": "json_object"}  # Request JSON output
        }
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        try:
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
            with urllib.request.urlopen(req) as response:
                response_text = response.read().decode('utf-8')
                
                if response.status != 200:
                    raise Exception(f"API returned {response.status}: {response_text}")
                
                return json.loads(response_text)
                
        except json.JSONDecodeError as e:
            raise Exception(f"Invalid JSON response: {response_text[:200]}")
        except Exception as e:
            raise Exception(f"API call failed: {str(e)}")
    
    def _parse_response(self, api_response: Dict, mapping: Dict) -> Dict:
        """Parse AI response and extract structured data"""
        try:
            # Extract content from API response
            content = api_response.get('choices', [{}])[0].get('message', {}).get('content', '')
            
            if not content:
                raise Exception("Empty response from AI")
            
            # Try to parse as JSON
            try:
                # Remove markdown code blocks if present
                content_clean = content.strip()
                if content_clean.startswith('```json'):
                    content_clean = content_clean[7:]
                if content_clean.startswith('```'):
                    content_clean = content_clean[3:]
                if content_clean.endswith('```'):
                    content_clean = content_clean[:-3]
                content_clean = content_clean.strip()
                
                parsed = json.loads(content_clean)
                
                return {
                    'status': parsed.get('status', 'uncertain'),
                    'confidence': float(parsed.get('confidence', 0.5)),
                    'reasoning': parsed.get('reasoning', 'No reasoning provided'),
                    'ticker': parsed.get('ticker', mapping.get('ticker', ''))
                }
            except json.JSONDecodeError:
                # If not JSON, try to extract information from text
                return {
                    'status': 'review_required',
                    'confidence': 0.5,
                    'reasoning': content,
                    'ticker': mapping.get('ticker', '')
                }
                
        except Exception as e:
            return {
                'status': 'error',
                'confidence': 0.0,
                'reasoning': f'Failed to parse AI response: {str(e)}',
                'ticker': mapping.get('ticker', '')
            }
    
    def _store_ai_response(self, mapping_id: Optional[int], prompt: str, 
                          raw_response: Dict, parsed_response: Dict,
                          processing_time: int, mapping_data: Dict,
                          is_error: bool = False):
        """
        Store AI response in database for learning purposes
        
        This is CRITICAL for the learning system - all responses are stored
        to improve future predictions
        """
        try:
            from database_manager import db_manager
            conn = db_manager.get_connection()
            try:
                cursor = conn.cursor()
                
                # Ensure ai_responses table exists
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS ai_responses (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        mapping_id INTEGER,
                        merchant_name TEXT NOT NULL,
                        category TEXT,
                        prompt TEXT NOT NULL,
                        raw_response TEXT NOT NULL,
                        parsed_response TEXT NOT NULL,
                        processing_time_ms INTEGER NOT NULL,
                        model_version TEXT NOT NULL,
                        is_error INTEGER DEFAULT 0,
                        admin_feedback TEXT,
                        admin_correct_ticker TEXT,
                        was_ai_correct INTEGER,
                        feedback_notes TEXT,
                        feedback_date TEXT,
                        created_at TEXT NOT NULL
                    )
                """)
                
                # Insert AI response
                cursor.execute("""
                    INSERT INTO ai_responses 
                    (mapping_id, merchant_name, category, prompt, raw_response, parsed_response,
                     processing_time_ms, model_version, is_error, created_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    mapping_id,
                    mapping_data.get('merchant_name', ''),
                    mapping_data.get('category', ''),
                    prompt,
                    json.dumps(raw_response),
                    json.dumps(parsed_response),
                    processing_time,
                    self.model,
                    1 if is_error else 0,
                    datetime.now().isoformat()
                ))
                
                response_id = cursor.lastrowid
                conn.commit()
                
                print(f"✅ Stored AI response for mapping {mapping_id} (ID: {response_id})")
                return response_id
            finally:
                db_manager.release_connection(conn)
        except Exception as e:
            print(f"❌ Error storing AI response: {e}")
            import traceback
            traceback.print_exc()
            return None

