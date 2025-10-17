# Build stage
FROM node:20-alpine AS builder

# Install build dependencies
RUN apk add --no-cache openssl libc6-compat

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production stage - using Debian for glibc compatibility with Piper binary
FROM node:20-slim

# Install runtime dependencies including espeak-ng for Piper TTS
RUN apt-get update && apt-get install -y \
    wget \
    curl \
    espeak-ng \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Piper TTS - using confirmed working release
RUN mkdir -p /app/piper/models /tmp/tts && \
    cd /tmp && \
    wget -O piper.tar.gz https://github.com/rhasspy/piper/releases/download/2023.11.14-2/piper_linux_x86_64.tar.gz && \
    tar -xzf piper.tar.gz && \
    cp -r piper/* /app/piper/ && \
    chmod +x /app/piper/piper && \
    rm -rf /tmp/piper* && \
    cd /app

# Download Chinese model (huayan-medium is high quality female voice ~30MB)
RUN cd /app/piper/models && \
    wget -O zh_CN-huayan-medium.onnx https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/zh/zh_CN/huayan/medium/zh_CN-huayan-medium.onnx && \
    wget -O zh_CN-huayan-medium.onnx.json https://huggingface.co/rhasspy/piper-voices/resolve/v1.0.0/zh/zh_CN/huayan/medium/zh_CN-huayan-medium.onnx.json

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm install --omit=dev

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Set library path for Piper shared libraries
ENV LD_LIBRARY_PATH=/app/piper/lib:$LD_LIBRARY_PATH

# Expose port
EXPOSE 4003

# Start application
CMD ["npm", "run", "start:prod"]
