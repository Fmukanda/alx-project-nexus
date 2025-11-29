import requests
import base64
from datetime import datetime
import json
import logging
from django.conf import settings
from django.utils import timezone
from .models import MpesaTransaction

logger = logging.getLogger(__name__)

class MpesaGateway:
    def __init__(self):
        self.consumer_key = getattr(settings, 'MPESA_CONSUMER_KEY', '')
        self.consumer_secret = getattr(settings, 'MPESA_CONSUMER_SECRET', '')
        self.business_shortcode = getattr(settings, 'MPESA_BUSINESS_SHORTCODE', '')
        self.passkey = getattr(settings, 'MPESA_PASSKEY', '')
        self.callback_url = getattr(settings, 'MPESA_CALLBACK_URL', '')
        self.environment = getattr(settings, 'MPESA_ENVIRONMENT', 'sandbox')  # sandbox or production
        
        if self.environment == 'sandbox':
            self.base_url = 'https://sandbox.safaricom.co.ke'
        else:
            self.base_url = 'https://api.safaricom.co.ke'
    
    def get_access_token(self):
        """Get M-Pesa API access token"""
        try:
            url = f"{self.base_url}/oauth/v1/generate?grant_type=client_credentials"
            auth_string = f"{self.consumer_key}:{self.consumer_secret}"
            encoded_auth = base64.b64encode(auth_string.encode()).decode()
            
            headers = {
                'Authorization': f'Basic {encoded_auth}'
            }
            
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            return data.get('access_token')
            
        except requests.exceptions.RequestException as e:
            logger.error(f"M-Pesa access token error: {str(e)}")
            raise Exception(f"Failed to get M-Pesa access token: {str(e)}")
    
    def generate_password(self, timestamp):
        """Generate M-Pesa API password"""
        data = f"{self.business_shortcode}{self.passkey}{timestamp}"
        encoded = base64.b64encode(data.encode()).decode()
        return encoded
    
    def stk_push(self, phone_number, amount, account_reference, transaction_desc):
        """Initiate STK push to customer's phone"""
        try:
            access_token = self.get_access_token()
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self.generate_password(timestamp)
            
            url = f"{self.base_url}/mpesa/stkpush/v1/processrequest"
            
            payload = {
                "BusinessShortCode": self.business_shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "TransactionType": "CustomerPayBillOnline",
                "Amount": int(amount),
                "PartyA": phone_number,
                "PartyB": self.business_shortcode,
                "PhoneNumber": phone_number,
                "CallBackURL": self.callback_url,
                "AccountReference": account_reference,
                "TransactionDesc": transaction_desc
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            
            if data.get('ResponseCode') == '0':
                return {
                    'success': True,
                    'merchant_request_id': data.get('MerchantRequestID'),
                    'checkout_request_id': data.get('CheckoutRequestID'),
                    'response_description': data.get('ResponseDescription'),
                    'customer_message': data.get('CustomerMessage')
                }
            else:
                return {
                    'success': False,
                    'error_code': data.get('ResponseCode'),
                    'error_message': data.get('ResponseDescription')
                }
                
        except requests.exceptions.RequestException as e:
            logger.error(f"M-Pesa STK push error: {str(e)}")
            return {
                'success': False,
                'error_message': f"Network error: {str(e)}"
            }
        except Exception as e:
            logger.error(f"M-Pesa STK push unexpected error: {str(e)}")
            return {
                'success': False,
                'error_message': f"Unexpected error: {str(e)}"
            }
    
    def query_transaction_status(self, checkout_request_id):
        """Query status of an STK push transaction"""
        try:
            access_token = self.get_access_token()
            timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
            password = self.generate_password(timestamp)
            
            url = f"{self.base_url}/mpesa/stkpushquery/v1/query"
            
            payload = {
                "BusinessShortCode": self.business_shortcode,
                "Password": password,
                "Timestamp": timestamp,
                "CheckoutRequestID": checkout_request_id
            }
            
            headers = {
                'Authorization': f'Bearer {access_token}',
                'Content-Type': 'application/json'
            }
            
            response = requests.post(url, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            return data
            
        except Exception as e:
            logger.error(f"M-Pesa query error: {str(e)}")
            return None

class MockMpesaGateway(MpesaGateway):
    """Mock M-Pesa gateway for development and testing"""
    
    def stk_push(self, phone_number, amount, account_reference, transaction_desc):
        # Simulate successful STK push for testing
        logger.info(f"Mock M-Pesa STK Push: {phone_number} - KSh {amount}")
        
        # Simulate different scenarios based on phone number
        if phone_number.endswith('1111'):
            return {
                'success': False,
                'error_message': 'Insufficient funds'
            }
        elif phone_number.endswith('2222'):
            return {
                'success': False,
                'error_message': 'Transaction cancelled by user'
            }
        else:
            return {
                'success': True,
                'merchant_request_id': f'mock_mreq_{int(timezone.now().timestamp())}',
                'checkout_request_id': f'mock_creq_{int(timezone.now().timestamp())}',
                'response_description': 'Success. Request accepted for processing',
                'customer_message': 'Success. Request accepted for processing'
            }

# Initialize M-Pesa gateway
mpesa_gateway = MockMpesaGateway()  # Switch to MpesaGateway() for production