FROM python:3.13-slim

WORKDIR /app
ENV PYTHONUNBUFFERED=1

# Install backend dependencies.
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy API code and the local model from repo root.
COPY backend/app.py /app/app.py
COPY cattle_model.keras /app/cattle_model.keras

EXPOSE 8010

CMD ["python", "-m", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8010"]
