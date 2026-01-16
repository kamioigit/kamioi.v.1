# Add this function before the approve_mapping function

def execute_stock_purchase(mapping):
    """Execute stock purchase when mapping is approved"""
    try:
        if not mapping or not mapping.get('ticker'):
            return False
            
        # Initialize Alpaca service
        alpaca = AlpacaService()
        
        # Get accounts (create one if needed)
        accounts = alpaca.get_accounts()
        if not accounts:
            print("No trading accounts found - skipping stock purchase")
            return False
        
        account_id = accounts[0]['id']
        symbol = mapping['ticker']
        dollar_amount = 1.00  # .00 investment as per requirement
        
        # Buy fractional shares
        order_result = alpaca.buy_fractional_shares(account_id, symbol, dollar_amount)
        
        if order_result:
            # Update transaction with stock purchase details
            transaction_id = mapping.get('transaction_id')
            if transaction_id:
                # Update transaction to reflect stock purchase
                conn = db_manager.get_connection()
                cur = conn.cursor()
                cur.execute("""
                    UPDATE transactions 
                    SET ticker = ?, shares = ?, stock_price = ?, 
                        investable = ?, round_up = ?, fee = ?, 
                        total_debit = amount + ?, status = 'invested'
                    WHERE id = ?
                """, (symbol, dollar_amount, 1.0, dollar_amount, 0.25, 0.25, 0.5, transaction_id))
                conn.commit()
                conn.close()
                
                print(f"✅ Stock purchase successful:  of {symbol}")
                return True
            else:
                print(f"⚠️ Stock purchase successful but no transaction_id found")
                return False
        else:
            print(f"❌ Stock purchase failed for {symbol}")
            return False
            
    except Exception as e:
        print(f"Error executing stock purchase: {e}")
        return False
