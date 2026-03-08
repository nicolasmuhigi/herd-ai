FROM tensorflow/tensorflow:2.16.1

WORKDIR /app
ENV PYTHONUNBUFFERED=1

# Install app dependencies; TensorFlow is already present in base image.
RUN pip install --no-cache-dir \
    fastapi==0.115.0 \
    uvicorn[standard]==0.32.0 \
    pillow==10.4.0 \
    numpy==1.26.4 \
    python-multipart==0.0.12

COPY huggingface-space/app.py .
COPY cattle_model.keras .

EXPOSE 7860

CMD ["sh", "-c", "python -m uvicorn app:app --host 0.0.0.0 --port ${PORT:-10000}"]
