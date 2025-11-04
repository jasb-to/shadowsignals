# FinMA-7B AI Server

Self-hosted financial AI model server for Shadow Signals using FinMA-7B-full.

## Features

- **Primary Model**: FinMA-7B-full (financial domain-specific)
- **Fallback Model**: Mistral-7B-Instruct (general purpose)
- **Free & Open Source**: No API costs
- **Financial Domain**: Trained specifically for crypto/financial analysis

## Setup

### 1. Install Dependencies

\`\`\`bash
cd scripts/ai-server
pip install -r requirements.txt
\`\`\`

### 2. Download Models

The models will be automatically downloaded on first run from Hugging Face:
- `ChanceFocus/finma-7b-full` (~14GB)
- `mistralai/Mistral-7B-Instruct-v0.1` (~14GB)

**Note**: You may need to accept the model license terms on Hugging Face.

### 3. Run the Server

\`\`\`bash
python api-server.py
\`\`\`

The server will start on `http://localhost:5000`

### 4. Configure Environment Variable

Add to your `.env` file:
\`\`\`
AI_SERVER_URL=http://localhost:5000
\`\`\`

For production, deploy the Python server and update the URL accordingly.

## API Endpoints

### Health Check
\`\`\`bash
GET /health
\`\`\`

### General Analysis
\`\`\`bash
POST /analyze
Content-Type: application/json

{
  "prompt": "Analyze Bitcoin's recent price action...",
  "max_length": 512
}
\`\`\`

### Portfolio Analysis
\`\`\`bash
POST /portfolio-analyze
Content-Type: application/json

{
  "holdings": [...],
  "total_value": 10000,
  "market_data": {...}
}
\`\`\`

### Token Analysis
\`\`\`bash
POST /token-analyze
Content-Type: application/json

{
  "symbol": "BTC",
  "price": 50000,
  "technical_data": {...}
}
\`\`\`

## Deployment Options

### Option 1: Same Server as Next.js
Run the Python server on the same machine as your Next.js app on a different port.

### Option 2: Separate Server
Deploy the Python server to a separate machine/container and update `AI_SERVER_URL`.

### Option 3: Docker
\`\`\`dockerfile
FROM python:3.10-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000
CMD ["python", "api-server.py"]
\`\`\`

### Option 4: AWS Lambda / Cloud Functions
Package the model and deploy as a serverless function (requires larger instance sizes).

## Hardware Requirements

- **Minimum**: 16GB RAM, CPU only (slower)
- **Recommended**: 16GB RAM + NVIDIA GPU with 8GB+ VRAM
- **Optimal**: 32GB RAM + NVIDIA GPU with 16GB+ VRAM

## Model Information

**FinMA-7B-full**
- Repository: [ChanceFocus/finma-7b-full](https://huggingface.co/ChanceFocus/finma-7b-full)
- Project: [The-FinAI/PIXIU](https://github.com/The-FinAI/PIXIU)
- Domain: Financial language and concepts
- Size: ~7B parameters (~14GB disk space)

**Mistral-7B-Instruct**
- Repository: [mistralai/Mistral-7B-Instruct-v0.1](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.1)
- Domain: General purpose instruction-following
- Size: ~7B parameters (~14GB disk space)
