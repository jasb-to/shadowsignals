"""
FinMA-7B-full AI API Server
Self-hosted financial AI model for Shadow Signals

Run with: python scripts/ai-server/api-server.py
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from transformers import LlamaTokenizer, LlamaForCausalLM
import logging
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js to call this API

# Model configuration
MODEL_NAME = "ChanceFocus/finma-7b-full"
FALLBACK_MODEL = "mistralai/Mistral-7B-Instruct-v0.1"

# Global model and tokenizer
tokenizer = None
model = None
fallback_tokenizer = None
fallback_model = None

def load_finma_model():
    """Load the FinMA-7B-full model"""
    global tokenizer, model
    try:
        logger.info(f"Loading FinMA-7B-full model: {MODEL_NAME}")
        tokenizer = LlamaTokenizer.from_pretrained(MODEL_NAME)
        model = LlamaForCausalLM.from_pretrained(
            MODEL_NAME,
            device_map="auto" if torch.cuda.is_available() else None,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        )
        model.eval()
        logger.info("FinMA-7B-full model loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to load FinMA-7B-full model: {e}")
        return False

def load_fallback_model():
    """Load the Mistral 7B fallback model"""
    global fallback_tokenizer, fallback_model
    try:
        logger.info(f"Loading fallback model: {FALLBACK_MODEL}")
        fallback_tokenizer = LlamaTokenizer.from_pretrained(FALLBACK_MODEL)
        fallback_model = LlamaForCausalLM.from_pretrained(
            FALLBACK_MODEL,
            device_map="auto" if torch.cuda.is_available() else None,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
        )
        fallback_model.eval()
        logger.info("Fallback model loaded successfully")
        return True
    except Exception as e:
        logger.error(f"Failed to load fallback model: {e}")
        return False

def generate_text(prompt: str, max_length: int = 512, use_fallback: bool = False):
    """Generate text using the loaded model"""
    try:
        # Select model and tokenizer
        current_tokenizer = fallback_tokenizer if use_fallback else tokenizer
        current_model = fallback_model if use_fallback else model
        
        if current_tokenizer is None or current_model is None:
            raise Exception("Model not loaded")
        
        # Tokenize input
        inputs = current_tokenizer(prompt, return_tensors="pt").to(current_model.device)
        
        # Generate output
        with torch.no_grad():
            output_ids = current_model.generate(
                inputs["input_ids"],
                max_length=max_length,
                do_sample=True,
                temperature=0.7,
                top_p=0.9,
                repetition_penalty=1.1
            )
        
        # Decode output
        output = current_tokenizer.decode(output_ids[0], skip_special_tokens=True)
        
        # Remove the prompt from the output
        if output.startswith(prompt):
            output = output[len(prompt):].strip()
        
        return output
    except Exception as e:
        logger.error(f"Error generating text: {e}")
        raise

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "model_loaded": model is not None,
        "fallback_loaded": fallback_model is not None,
        "cuda_available": torch.cuda.is_available()
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    """
    Analyze crypto/financial data
    
    Request body:
    {
        "prompt": "Your analysis prompt here",
        "max_length": 512,
        "use_fallback": false
    }
    """
    try:
        data = request.json
        prompt = data.get('prompt')
        max_length = data.get('max_length', 512)
        use_fallback = data.get('use_fallback', False)
        
        if not prompt:
            return jsonify({"error": "Prompt is required"}), 400
        
        logger.info(f"Analyzing prompt (length: {len(prompt)}, fallback: {use_fallback})")
        
        # Try primary model first
        try:
            result = generate_text(prompt, max_length, use_fallback=False)
            return jsonify({
                "result": result,
                "model_used": "finma-7b-full",
                "success": True
            })
        except Exception as e:
            logger.warning(f"Primary model failed, trying fallback: {e}")
            
            # Try fallback model
            if fallback_model is not None:
                result = generate_text(prompt, max_length, use_fallback=True)
                return jsonify({
                    "result": result,
                    "model_used": "mistral-7b",
                    "success": True
                })
            else:
                raise Exception("Both primary and fallback models failed")
                
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/portfolio-analyze', methods=['POST'])
def portfolio_analyze():
    """
    Analyze portfolio holdings with financial context
    
    Request body:
    {
        "holdings": [...],
        "total_value": 10000,
        "market_data": {...}
    }
    """
    try:
        data = request.json
        holdings = data.get('holdings', [])
        total_value = data.get('total_value', 0)
        market_data = data.get('market_data', {})
        
        # Build financial analysis prompt
        prompt = f"""Analyze this cryptocurrency portfolio and provide professional financial insights:

Portfolio Value: ${total_value:,.2f}
Holdings: {len(holdings)} tokens

Top Holdings:
"""
        for holding in holdings[:5]:
            prompt += f"- {holding['symbol']}: ${holding['value']:,.2f} ({holding['allocation']:.1f}%)\n"
        
        prompt += f"""
Market Context:
- BTC Price: ${market_data.get('btc_price', 0):,.2f}
- Market Cap: ${market_data.get('total_market_cap', 0):,.2f}
- BTC Dominance: {market_data.get('btc_dominance', 0):.1f}%

Provide:
1. Portfolio risk assessment (1-2 sentences)
2. Diversification analysis (1-2 sentences)
3. Top 3 actionable recommendations
4. Key risk factors to monitor

Keep the analysis professional, concise, and actionable."""

        result = generate_text(prompt, max_length=512)
        
        return jsonify({
            "analysis": result,
            "model_used": "finma-7b-full",
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Portfolio analysis failed: {e}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

@app.route('/token-analyze', methods=['POST'])
def token_analyze():
    """
    Analyze individual token with technical and fundamental data
    
    Request body:
    {
        "symbol": "BTC",
        "price": 50000,
        "change_24h": 2.5,
        "volume": 1000000000,
        "market_cap": 1000000000000,
        "technical_data": {...}
    }
    """
    try:
        data = request.json
        symbol = data.get('symbol')
        price = data.get('price', 0)
        change_24h = data.get('change_24h', 0)
        volume = data.get('volume', 0)
        market_cap = data.get('market_cap', 0)
        technical_data = data.get('technical_data', {})
        
        # Build token analysis prompt
        prompt = f"""Analyze {symbol} cryptocurrency with the following data:

Price: ${price:,.2f}
24h Change: {change_24h:+.2f}%
Volume: ${volume:,.0f}
Market Cap: ${market_cap:,.0f}

Technical Indicators:
- RSI: {technical_data.get('rsi', 'N/A')}
- MACD: {technical_data.get('macd', 'N/A')}
- Support: ${technical_data.get('support', 0):,.2f}
- Resistance: ${technical_data.get('resistance', 0):,.2f}

Provide:
1. Trading recommendation (Buy/Hold/Sell) with confidence level
2. Key technical levels to watch
3. Risk factors
4. Short-term outlook (1-2 sentences)

Keep the analysis professional and actionable."""

        result = generate_text(prompt, max_length=512)
        
        return jsonify({
            "analysis": result,
            "model_used": "finma-7b-full",
            "success": True
        })
        
    except Exception as e:
        logger.error(f"Token analysis failed: {e}")
        return jsonify({
            "error": str(e),
            "success": False
        }), 500

if __name__ == '__main__':
    # Load models on startup
    logger.info("Starting FinMA-7B AI Server...")
    
    # Try to load primary model
    if not load_finma_model():
        logger.warning("Primary model failed to load, trying fallback...")
        load_fallback_model()
    
    # Load fallback model as backup
    if model is not None:
        logger.info("Loading fallback model as backup...")
        load_fallback_model()
    
    # Start server
    port = int(os.environ.get('PORT', 5000))
    logger.info(f"Starting server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
