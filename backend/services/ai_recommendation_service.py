"""
AI Recommendation Service - Provides AI insights for User/Family/Business dashboards
Uses DeepSeek v3 to generate personalized investment recommendations
"""

import http.client
import json
import os
from typing import Dict, List, Optional
from datetime import datetime
# Note: This service uses database_manager pattern, not SQLAlchemy
# from database import db
# from models.api_usage import APIUsage
from services.api_usage_tracker import APIUsageTracker

class AIRecommendationService:
    """Generate AI-powered investment recommendations using DeepSeek v3"""
    
    def __init__(self):
        # Official DeepSeek API (not RapidAPI)
        self.api_key = os.getenv('DEEPSEEK_API_KEY', 'sk-20c74c5e5f2c425397645546b92d3ed2')
        self.api_base_url = "https://api.deepseek.com"
        self.model = "deepseek-chat"  # Using deepseek-chat model
        self.usage_tracker = APIUsageTracker()
    
    def get_investment_recommendations(self, user_data: Dict, dashboard_type: str = 'user', user_id: int = None) -> Dict:
        """
        Get AI-powered investment recommendations
        
        Args:
            user_data: {
                'transactions': List[Dict],
                'portfolio': Dict,
                'goals': List[Dict],
                'risk_tolerance': str,
                'investment_history': List[Dict]
            }
            dashboard_type: 'user', 'family', or 'business'
            user_id: Optional user ID for tracking
            
        Returns:
            {
                'recommendations': List[Dict],
                'insights': List[str],
                'risk_analysis': Dict,
                'opportunities': List[Dict]
            }
        """
        start_time = datetime.now()
        
        # Determine page_tab based on dashboard_type
        page_tab_map = {
            'user': 'User Dashboard - AI Recommendations',
            'family': 'Family Dashboard - AI Recommendations',
            'business': 'Business Dashboard - AI Recommendations'
        }
        page_tab = page_tab_map.get(dashboard_type, 'AI Recommendations')
        
        try:
            # Build context from user data
            print(f"🔧 [AI Recommendations] Building context for {dashboard_type} dashboard, user_id={user_id}")
            context = self._build_user_context(user_data, dashboard_type)
            print(f"🔧 [AI Recommendations] Context built successfully, length={len(context)}")
            
            # Generate prompt
            prompt = self._build_recommendation_prompt(context, dashboard_type)
            print(f"🔧 [AI Recommendations] Prompt built successfully, length={len(prompt)}")
            
            # Prepare request payload for tracking
            request_payload = {
                "model": self.model,
                "messages": [
                    {
                        "role": "system",
                        "content": "You are an educational financial content assistant for Kamioi. You provide educational nudges and learning opportunities based on user purchases. You are NOT a financial advisor. NEVER provide buy/sell recommendations. Always use phrases like 'Want to learn...', 'Curious to see...', 'Here's how X has performed...'. Always respond in valid JSON format only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "temperature": 0.7,
                "max_tokens": 1500,
                "response_format": {"type": "json_object"}
            }
            request_data_str = json.dumps(request_payload)
            
            # Call DeepSeek API
            raw_response = self._call_deepseek_api(prompt)
            
            # Prepare response data for tracking
            response_data_str = json.dumps(raw_response)
            
            # Parse response
            recommendations = self._parse_recommendations(raw_response)
            
            # Calculate processing time
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # Track API usage with detailed token breakdown
            usage = raw_response.get('usage', {})
            prompt_tokens = usage.get('prompt_tokens', 0)
            completion_tokens = usage.get('completion_tokens', 0)
            total_tokens = usage.get('total_tokens', 0)
            
            print(f"📊 [AI Recommendations] Recording API call: user_id={user_id}, page_tab={page_tab}")
            print(f"📊 [AI Recommendations] request_data length: {len(request_data_str)}, response_data length: {len(response_data_str)}")
            
            self.usage_tracker.record_api_call(
                endpoint='/api/ai/recommendations',
                model=self.model,
                prompt_tokens=prompt_tokens,
                completion_tokens=completion_tokens,
                total_tokens=total_tokens,
                processing_time_ms=processing_time,
                success=True,
                user_id=user_id,
                page_tab=page_tab,
                request_data=request_data_str,
                response_data=response_data_str
            )
            
            return recommendations
            
        except Exception as e:
            error_msg = str(e)
            processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # Log detailed error information
            print(f"❌ [AI Recommendations] API call failed: {error_msg}")
            print(f"❌ [AI Recommendations] Processing time: {processing_time}ms")
            print(f"❌ [AI Recommendations] Error type: {type(e).__name__}")
            import traceback
            print(f"❌ [AI Recommendations] Traceback: {traceback.format_exc()}")
            
            # Prepare request data for failed call tracking (simplified to avoid errors)
            request_data_str = None
            try:
                request_payload = {
                    "model": self.model,
                    "messages": [{"role": "system", "content": "Educational assistant"}, {"role": "user", "content": "Generate recommendations"}]
                }
                request_data_str = json.dumps(request_payload)
            except Exception as build_error:
                print(f"⚠️ [AI Recommendations] Could not build request_data for tracking: {build_error}")
            
            # Track failed call
            print(f"📊 [AI Recommendations] Recording failed API call: user_id={user_id}, page_tab={page_tab}, error={error_msg[:100]}")
            try:
                self.usage_tracker.record_api_call(
                    endpoint='/api/ai/recommendations',
                    model=self.model,
                    prompt_tokens=0,
                    completion_tokens=0,
                    total_tokens=0,
                    processing_time_ms=processing_time,
                    success=False,
                    error_message=error_msg[:500] if error_msg else "Unknown error",  # Truncate long errors
                    user_id=user_id,
                    page_tab=page_tab,
                    request_data=request_data_str,
                    response_data=json.dumps({'error': error_msg[:500]}) if error_msg else None
                )
            except Exception as track_error:
                print(f"❌ [AI Recommendations] Failed to record API call in tracker: {track_error}")
            
            # Return fallback recommendations
            return self._get_fallback_recommendations(user_data, dashboard_type)
    
    def _build_user_context(self, user_data: Dict, dashboard_type: str) -> str:
        """Build context string from user data for educational nudges"""
        transactions = user_data.get('transactions', [])
        portfolio = user_data.get('portfolio', {})
        goals = user_data.get('goals', [])
        risk_tolerance = user_data.get('risk_tolerance', 'moderate')
        
        # Get user's round-up settings (CRITICAL for accurate calculations)
        round_up_amount = user_data.get('round_up_amount', 1.00)  # Default $1.00
        round_up_enabled = user_data.get('round_up_enabled', True)  # Default enabled
        
        # Get user location for local recommendations
        user_location = user_data.get('location')
        user_city = user_data.get('city')
        user_state = user_data.get('state')
        user_country = user_data.get('country')
        
        # Analyze transactions
        total_spent = sum(t.get('amount', 0) for t in transactions)
        top_merchants = self._get_top_merchants(transactions, limit=15)  # Get more merchants for better context
        categories = self._get_category_breakdown(transactions)
        
        # Recent purchases (last 10)
        recent_purchases = sorted(transactions, key=lambda x: x.get('date', ''), reverse=True)[:10]
        
        # Round-up analysis - use actual round-up amounts from transactions
        transactions_with_roundup = [t for t in transactions if t.get('round_up', 0) > 0]
        total_roundups = sum(t.get('round_up', 0) for t in transactions)
        avg_roundup = total_roundups / len(transactions_with_roundup) if transactions_with_roundup else round_up_amount
        
        # Calculate weekly and monthly round-ups for context (with safe date parsing)
        from datetime import datetime, timedelta
        now = datetime.now()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        # Safely parse transaction dates
        transactions_this_week = []
        transactions_this_month = []
        unique_dates_with_roundups = set()
        
        for t in transactions:
            t_date = t.get('date')
            if not t_date:
                continue
                
            try:
                # Try to parse the date
                if isinstance(t_date, str):
                    # Remove timezone info and parse
                    date_str = t_date.split('T')[0] if 'T' in t_date else t_date.split(' ')[0]
                    try:
                        parsed_date = datetime.strptime(date_str, '%Y-%m-%d')
                    except:
                        # Try other formats
                        try:
                            parsed_date = datetime.fromisoformat(date_str)
                        except:
                            continue
                else:
                    # Already a datetime object
                    parsed_date = t_date if isinstance(t_date, datetime) else None
                    if not parsed_date:
                        continue
                
                # Check if within week/month
                if parsed_date >= week_ago:
                    transactions_this_week.append(t)
                if parsed_date >= month_ago:
                    transactions_this_month.append(t)
                
                # Track unique dates for streak
                if t.get('round_up', 0) > 0:
                    date_key = parsed_date.strftime('%Y-%m-%d') if isinstance(parsed_date, datetime) else str(parsed_date).split('T')[0]
                    unique_dates_with_roundups.add(date_key)
            except Exception as e:
                # Skip transactions with unparseable dates
                continue
        
        roundups_this_week = sum(t.get('round_up', 0) for t in transactions_this_week)
        purchase_count_week = len(transactions_this_week)
        potential_investment_week = purchase_count_week * round_up_amount
        total_roundups_month = sum(t.get('round_up', 0) for t in transactions_this_month)
        streak_days = len(unique_dates_with_roundups)
        
        # Projected monthly contribution (based on current pace)
        if transactions_this_month:
            avg_daily_roundups = total_roundups_month / 30.0  # Rough estimate
            projected_monthly_contribution = avg_daily_roundups * 30
        else:
            projected_monthly_contribution = round_up_amount * 10  # Default estimate
        
        # Portfolio summary
        portfolio_value = portfolio.get('total_value', 0)
        holdings = portfolio.get('holdings', [])
        
        # Goal progress
        goal_progress = []
        for goal in goals:
            goal_name = goal.get('name', 'Unknown Goal')
            target = goal.get('target', 0)
            current = goal.get('current', 0) or portfolio_value
            percent = (current / target * 100) if target > 0 else 0
            goal_progress.append(f"- {goal_name}: ${current:,.2f} / ${target:,.2f} ({percent:.1f}%)")
        
        context = f"""
USER PROFILE ({dashboard_type.upper()} DASHBOARD):
- Risk Tolerance: {risk_tolerance}
- Total Spending: ${total_spent:,.2f}
- Portfolio Value: ${portfolio_value:,.2f}
- Number of Holdings: {len(holdings)}
- Location: {user_location or 'Not specified'} {f'({user_city}, {user_state}, {user_country})' if user_city or user_state or user_country else ''}

RECENT PURCHASES (last 10, for brand/merchant-based educational nudges):
{self._format_recent_purchases(recent_purchases)}

TOP MERCHANTS (where user spends most - use for brand education):
{self._format_merchants(top_merchants)}

SPENDING BY CATEGORY (use for sector education):
{self._format_categories(categories)}

ROUND-UP SETTINGS (USER CONFIGURED):
- Round-up amount: ${round_up_amount:,.2f} (user's setting - Kamioi ADDS this amount to each purchase)
- Round-ups enabled: {'Yes' if round_up_enabled else 'No'}
- Round-up logic: Kamioi ADDS the round-up setting to the purchase amount (NOT rounding, just adding)
- Formula: Purchase Amount + Round-Up Setting = Total Charged
- Round-Up Invested = Round-Up Setting (always the same, regardless of purchase amount)

ROUND-UP HABITS:
- Transactions with round-ups: {len(transactions_with_roundup)} of {len(transactions)}
- Total round-ups this period: ${total_roundups:,.2f}
- Average round-up amount: ${avg_roundup:,.2f}
- Round-ups active: {'Yes' if transactions_with_roundup else 'No'}
- Purchases this week: {purchase_count_week}
- Round-ups this week: ${roundups_this_week:,.2f}
- Potential investment this week (if all had round-ups): ${potential_investment_week:,.2f}
- Total round-ups this month: ${total_roundups_month:,.2f}
- Contribution streak: {streak_days} days with round-up activity
- Projected monthly contribution (at current pace): ${projected_monthly_contribution:,.2f}

ROUND-UP LOGIC:
- User's round-up setting: ${round_up_amount:,.2f} (Kamioi ADDS this amount to each purchase)
- Formula: Purchase Amount + Round-Up Setting = Total Charged
- Round-Up Invested = Round-Up Setting (always the same, regardless of purchase amount)
- DO NOT say "round up to $X" - Kamioi ADDS the setting amount to the purchase

CURRENT PORTFOLIO:
{self._format_portfolio(holdings)}

INVESTMENT GOALS & PROGRESS:
{chr(10).join(goal_progress) if goal_progress else 'No goals set'}

INSTRUCTIONS FOR EDUCATIONAL MESSAGES:
- Follow the exact template formats provided in the prompt (Brand/Purchase-Based, Round-Up Insights, Category Education, Goal-Based, Market Education, In-App Learning)
- All messages must be SELF-CONTAINED - provide complete information without requiring clicks
- Use ACTUAL DATA from the user's account (amounts, percentages, time periods, merchant names, stock symbols)
- DO NOT ask questions - provide direct answers and explanations
- For round-ups: Use the user's actual round-up setting (${round_up_amount:,.2f}) in messages
- For goals: Use actual progress percentages and dollar amounts
- For stocks: Use actual stock symbols and explain what they mean
- For sectors: Explain how sectors work and relate to the user's purchases
- NEVER say "you should buy" or "you should invest in X"
- NEVER provide financial advice - only educational information
"""
        return context
    
    def _format_recent_purchases(self, purchases: List[Dict]) -> str:
        """Format recent purchases for prompt"""
        if not purchases:
            return "No recent purchases"
        formatted = []
        for p in purchases[:10]:  # Last 10 purchases
            merchant = p.get('merchant', 'Unknown')
            amount = p.get('amount', 0)
            category = p.get('category', 'Other')
            date = p.get('date', 'Unknown date')
            ticker = p.get('ticker', None)
            roundup = p.get('round_up', 0)
            formatted.append(f"- {merchant}: ${amount:,.2f} ({category}) on {date}" + 
                           (f" | Ticker: {ticker}" if ticker else "") +
                           (f" | Round-up: ${roundup:,.2f}" if roundup > 0 else ""))
        return "\n".join(formatted)
    
    def _get_top_merchants(self, transactions: List[Dict], limit: int = 10) -> List[Dict]:
        """Get top merchants by spending"""
        merchant_spending = {}
        for t in transactions:
            merchant = t.get('merchant', 'Unknown')
            amount = t.get('amount', 0)
            merchant_spending[merchant] = merchant_spending.get(merchant, 0) + amount
        
        sorted_merchants = sorted(merchant_spending.items(), key=lambda x: x[1], reverse=True)
        return [{'merchant': m, 'total': amount} for m, amount in sorted_merchants[:limit]]
    
    def _get_category_breakdown(self, transactions: List[Dict]) -> Dict:
        """Get spending by category"""
        category_spending = {}
        for t in transactions:
            category = t.get('category', 'Other')
            amount = t.get('amount', 0)
            category_spending[category] = category_spending.get(category, 0) + amount
        return category_spending
    
    def _format_merchants(self, merchants: List[Dict]) -> str:
        """Format merchants for prompt"""
        if not merchants:
            return "No merchant data available"
        return "\n".join([f"- {m['merchant']}: ${m['total']:,.2f}" for m in merchants])
    
    def _format_categories(self, categories: Dict) -> str:
        """Format categories for prompt"""
        if not categories:
            return "No category data available"
        return "\n".join([f"- {cat}: ${amount:,.2f}" for cat, amount in sorted(categories.items(), key=lambda x: x[1], reverse=True)])
    
    def _format_portfolio(self, holdings: List[Dict]) -> str:
        """Format portfolio for prompt"""
        if not holdings:
            return "No current holdings"
        return "\n".join([f"- {h.get('ticker', 'N/A')}: {h.get('shares', 0)} shares @ ${h.get('price', 0):.2f}" for h in holdings])
    
    def _format_goals(self, goals: List[Dict]) -> str:
        """Format goals for prompt"""
        if not goals:
            return "No specific goals set"
        return "\n".join([f"- {g.get('name', 'Goal')}: ${g.get('target', 0):,.2f} by {g.get('deadline', 'N/A')}" for g in goals])
    
    def _build_recommendation_prompt(self, context: str, dashboard_type: str) -> str:
        """Build prompt for AI recommendations - Educational nudges, NOT financial advice"""
        prompt = f"""You are an educational financial content assistant for Kamioi. Provide self-contained educational messages based on user purchases. You are NOT a financial advisor. NEVER provide buy/sell recommendations.

KAMIOI: Round-up investment platform. Users configure a round-up setting (e.g., $1, $2, $5) that Kamioi adds to each purchase and invests automatically. NO merchant-specific programs exist.

{context}

RULES: Provide answers directly (no questions). Use actual user data. All messages must be self-contained.

TEMPLATES:

✅ 1. Brand / Purchase-Based Educational Messages
Use immediately after a user purchases something.

1. Brand performance overview:
   "You spent ${{amount}} at {{merchant}} today. Over the last {{time_period}}, {{brand_stock}} has moved {{percent_change}}. This movement reflects factors like earnings reports, customer demand, and overall market conditions."

2. Parent company insight:
   "Your purchase at {{merchant}} connects to a larger company, {{parent_company}}. This company operates across sectors like {{sector_list}}, and its stock has shown {{trend_description}} over the past {{time_period}}."

3. Brand usage + market context:
   "You frequently shop at {{merchant}}. The company behind it, {{brand_stock}}, has had an average price movement of {{avg_change}} per month this year, influenced by product launches, consumer spending, and economic trends."

4. Purchase vs. company activity:
   "Your purchase today is part of consumer spending that companies track closely. {{brand_stock}} recently reported {{recent_news_summary}}, which helped drive its stock {{trend_direction}} in the last {{time_period}}."

5. Sector insight when the brand isn't public:
   "{{merchant}} isn't publicly traded, but companies in the {{sector}} sector have shown {{sector_performance}} recently. This trend often reflects changes in supply chains, consumer habits, and economic conditions."

✅ 2. Round-Up & Micro-Investing Habit Insights
Use when users have round-ups enabled OR disabled.

1. Impact of round-ups (educational) - when round-ups are OFF:
   "If round-ups were applied to this purchase, ${{roundup_amount}} would have gone toward your investment balance. Small, consistent amounts like this are known to build momentum over time, especially when paired with regular spending."

2. Positive reinforcement - when round-ups are ON:
   "Your round-up from this purchase added ${{roundup_amount}} to your investing balance. These small contributions compound over time, helping you make progress even when markets fluctuate."

3. Weekly spending + investing insight:
   "You made {{purchase_count_week}} purchases this week. If each one rounded up by about ${{avg_roundup}}, that creates ${{potential_investment_week}} in added investing activity — simply from everyday spending."

4. Habit formation message:
   "Consistent small deposits from round-ups help form automatic investing habits. Many long-term investors rely on frequent, low-effort contributions like these."

5. Goal-oriented context:
   "Your round-ups this month total ${{total_roundups_month}}. Contributions like these help you move steadily toward goals such as {{goal_name}}, regardless of short-term market changes."

✅ 3. Category-Based Market Education
Use when a purchase is categorized (restaurants, groceries, tech, travel, etc).

1. Sector trend overview:
   "Your purchase in the {{category}} category connects to the broader {{sector}} sector. Recently, this sector has shown {{sector_trend}}, influenced by factors like consumer demand, production costs, and industry growth."

2. Category explanation:
   "Companies in the {{sector}} sector operate on trends like innovation cycles, supply-chain changes, and seasonal spending. Your recent {{category}} purchases align with one of the most active consumer sectors in the market."

3. Market context:
   "The {{sector}} sector — which includes companies related to your {{category}} purchase — has experienced {{movement_data}} this {{time_period}}, often due to shifts in consumer spending and economic indicators."

✅ 4. Goal-Based, Non-Advisory Messages
Use when a user has defined personal goals.

1. Progress reflection:
   "You're currently at {{percent_to_goal}}% of your goal: {{goal_name}}. Your recent activity, including small round-up contributions, helps maintain steady progress over time."

2. Motivation-based message:
   "Every small contribution moves you closer to {{goal_name}}. Consistent additions, even in small amounts, have historically been an effective way for many people to build long-term financial habits."

3. Scenario explanation (math-only):
   "If contributions continue at your current pace, you could add approximately ${{projected_monthly_contribution}} each month toward {{goal_name}}. This is a simple mathematical projection, not a recommendation."

4. Habit alignment:
   "Your streak of contributions over the last {{streak_days}} days shows strong consistency — a key part of reaching long-term goals like {{goal_name}}."

✅ 5. Market & Risk Education (Fully Self-Contained)
Use after purchase or browsing stock/brand info.

1. Volatility education:
   "{{brand_stock}} has shown {{volatility_level}} volatility recently. Volatility describes how often a stock's price moves up or down, and it's influenced by earnings, news, and broader market shifts."

2. Market trend explanation:
   "Stocks in the {{sector}} sector have experienced {{trend_description}} over the past {{time_period}}. Sector trends can be affected by consumer demand, technology changes, and economic cycles."

3. Risk reminder (educational):
   "All investments involve risk, including the possibility of price changes. Learning about factors like diversification and long-term time horizons can help users make more informed decisions overall."

✅ 6. In-App Learning & Knowledge Delivery
Direct educational content, not requiring clicks.

1. Quick investing concept lesson:
   "Here's a quick concept: Diversification means spreading investments across different types of companies or sectors to help reduce risk. It's a common approach long-term investors use to balance uncertainty in markets."

2. Sector explainer:
   "The {{sector}} sector includes companies that operate in areas like {{examples}}. Their prices are often influenced by supply chains, global demand, and industry competition."

3. Company basics:
   "Companies like {{brand_stock}} make money through {{revenue_sources}}, and their stock prices react to earnings reports, customer behavior, and general economic conditions."

RESPOND IN JSON FORMAT:
{{
    "recommendations": [
        {{
            "type": "brand_education|roundup_nudge|category_education|goal_progress|market_education|learning_content",
            "title": "Brief descriptive title (e.g., 'Brand Performance Overview', 'Round-Up Impact', 'Sector Education')",
            "description": "Full educational message following the templates above. MUST be self-contained and provide complete information. Use actual data from the user's account (amounts, percentages, time periods, merchant names, stock symbols). DO NOT ask questions - provide answers and explanations directly.",
            "merchant": "merchant_name if applicable",
            "category": "category if applicable",
            "brand_stock": "stock ticker if applicable",
            "priority": "high|medium|low",
            "related_data": {{
                "amount": "purchase amount if applicable",
                "roundup_amount": "user's actual round-up setting amount",
                "time_period": "time period for data (e.g., '30 days', 'this month', 'this year')",
                "goal_name": "goal name if applicable",
                "current_balance": "user's current investment balance",
                "goal_target": "goal target amount if applicable",
                "percent_change": "stock price percentage change if applicable",
                "trend_description": "trend description if applicable",
                "sector_trend": "sector trend description if applicable",
                "percent_to_goal": "percentage progress toward goal if applicable"
            }}
        }}
    ],
    "insights": [
        "Educational insight 1 (provides actual information about Kamioi's system, user's round-ups, or investment concepts - fully self-contained)",
        "Educational insight 2 (explains how something works or what data means - fully self-contained)"
    ],
    "disclaimer": "Kamioi's insights are for educational purposes only and are not financial advice or recommendations."
}}

CRITICAL REQUIREMENTS:
1. All messages must be SELF-CONTAINED - provide complete information without requiring clicks or external resources
2. Use ACTUAL DATA from the user's account (real amounts, percentages, time periods, merchant names)
3. DO NOT ask questions - provide direct answers and explanations
4. Follow the exact template formats provided above
5. Use proper financial terminology and explain concepts clearly
6. For round-ups: Use the user's actual round-up setting amount (${{round_up_amount}}) in calculations and explanations
7. For goals: Use actual progress percentages and dollar amounts from the user's account
8. For stocks: Use actual stock symbols and explain what they mean
9. For sectors: Explain how sectors work and relate to the user's purchases

REMEMBER: Kamioi automatically handles round-ups. Users don't enroll in merchant programs. Frame everything around Kamioi's automatic round-up investment system.
"""
        return prompt
    
    def _call_deepseek_api(self, prompt: str) -> Dict:
        """Call Official DeepSeek API with timeout"""
        import urllib.request
        import socket
        
        url = f"{self.api_base_url}/v1/chat/completions"
        
        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are an educational financial content assistant for Kamioi. You provide self-contained educational messages based on user purchases. You are NOT a financial advisor. NEVER provide buy/sell recommendations. Kamioi handles ALL round-up investing automatically - there are NO merchant-specific programs. Users shop at merchants and Kamioi automatically invests their round-ups. DO NOT ask questions - provide direct answers and explanations. Use actual data from the user's account. Always respond in valid JSON format only."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": 2000,  # Increased to handle longer responses
            "response_format": {"type": "json_object"}
        }
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json'
        }
        
        try:
            # Set socket timeout to 60 seconds (further increased for complex prompts)
            socket.setdefaulttimeout(60)
            
            print(f"📡 [AI Recommendations] Calling DeepSeek API with timeout=60s, prompt length={len(prompt)}")
            start_api_time = datetime.now()
            
            req = urllib.request.Request(url, data=json.dumps(payload).encode('utf-8'), headers=headers)
            with urllib.request.urlopen(req, timeout=60) as response:
                response_text = response.read().decode('utf-8')
                api_time = int((datetime.now() - start_api_time).total_seconds() * 1000)
                print(f"📡 [AI Recommendations] API call completed in {api_time}ms, status={response.status}")
                
                if response.status != 200:
                    raise Exception(f"API returned {response.status}: {response_text[:500]}")
                
                parsed_response = json.loads(response_text)
                print(f"📡 [AI Recommendations] Successfully parsed API response")
                return parsed_response
        except socket.timeout:
            api_time = int((datetime.now() - start_api_time).total_seconds() * 1000) if 'start_api_time' in locals() else 0
            print(f"⏱️ [AI Recommendations] API call timed out after {api_time}ms")
            raise Exception(f"API call timed out after 60 seconds")
        except urllib.error.HTTPError as e:
            error_body = ""
            try:
                if hasattr(e, 'read'):
                    error_body = e.read().decode('utf-8')[:500]
                else:
                    error_body = str(e)[:500]
            except:
                error_body = str(e)[:500]
            print(f"🚫 [AI Recommendations] HTTP error {e.code}: {error_body}")
            raise Exception(f"API HTTP error {e.code}: {error_body}")
        except json.JSONDecodeError as e:
            print(f"🔴 [AI Recommendations] JSON decode error: {e}")
            raise Exception(f"Failed to parse API response as JSON: {str(e)}")
        except Exception as e:
            print(f"🔴 [AI Recommendations] Unexpected error: {type(e).__name__}: {str(e)}")
            raise Exception(f"API call failed: {str(e)}")
        finally:
            # Reset socket timeout
            socket.setdefaulttimeout(None)
    
    def _parse_recommendations(self, api_response: Dict) -> Dict:
        """Parse AI response into structured recommendations"""
        try:
            content = api_response.get('choices', [{}])[0].get('message', {}).get('content', '')
            
            # Clean JSON
            content_clean = content.strip()
            if content_clean.startswith('```json'):
                content_clean = content_clean[7:]
            if content_clean.startswith('```'):
                content_clean = content_clean[3:]
            if content_clean.endswith('```'):
                content_clean = content_clean[:-3]
            content_clean = content_clean.strip()
            
            return json.loads(content_clean)
        except Exception as e:
            return self._get_fallback_recommendations({}, 'user')
    
    def _get_fallback_recommendations(self, user_data: Dict, dashboard_type: str) -> Dict:
        """Fallback educational recommendations if AI fails"""
        transactions = user_data.get('transactions', [])
        recent_transaction = transactions[0] if transactions else None
        merchant = recent_transaction.get('merchant') if recent_transaction else None
        round_up_amount = user_data.get('round_up_amount', 1.00)
        round_up_enabled = user_data.get('round_up_enabled', False)
        
        # Determine which type of message to show based on round-up status
        if round_up_enabled:
            description = f'Your round-up from this purchase added ${round_up_amount:.2f} to your investing balance. These small contributions compound over time, helping you make progress even when markets fluctuate.'
        else:
            description = f'If round-ups were applied to this purchase, ${round_up_amount:.2f} would have gone toward your investment balance. Small, consistent amounts like this are known to build momentum over time, especially when paired with regular spending.'
        
        return {
            'recommendations': [
                {
                    'type': 'roundup_nudge',
                    'title': 'Round-Up Impact',
                    'description': description,
                    'merchant': merchant,
                    'priority': 'medium',
                    'related_data': {
                        'roundup_amount': round_up_amount
                    }
                }
            ],
            'insights': [
                'Kamioi automatically invests your round-ups from purchases - no enrollment needed',
                'Consistent small deposits from round-ups help form automatic investing habits',
                'Round-up contributions help you move steadily toward your goals, regardless of short-term market changes'
            ],
            'disclaimer': "Kamioi's insights are for educational purposes only and are not financial advice or recommendations."
        }

