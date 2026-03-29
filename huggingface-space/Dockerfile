FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .

# Copy model file (will be uploaded separately)
COPY cattle_model.keras .

# Expose port
EXPOSE $PORT

# Set environment variable for TensorFlow
ENV TF_CPP_MIN_LOG_LEVEL=2

# Run the application
CMD ["sh", "-c", "uvicorn app:app --host 0.0.0.0 --port $PORT"]
