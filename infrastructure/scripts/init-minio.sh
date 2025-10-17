#!/bin/bash

# Wait for MinIO to be ready
echo "Waiting for MinIO to be ready..."
until curl -f http://minio:9000/minio/health/live; do
  echo "MinIO is not ready yet. Waiting..."
  sleep 2
done

echo "MinIO is ready!"

# Configure MinIO client
mc alias set minio http://minio:9000 minioadmin minioadmin123

# Create bucket if it doesn't exist
if ! mc ls minio/tts-audio > /dev/null 2>&1; then
  echo "Creating bucket: tts-audio"
  mc mb minio/tts-audio
  
  # Set bucket policy for public read access
  echo "Setting bucket policy for public read access"
  mc anonymous set public minio/tts-audio
  
  echo "MinIO initialization completed!"
else
  echo "Bucket tts-audio already exists"
fi

