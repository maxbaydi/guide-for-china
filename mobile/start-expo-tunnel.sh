#!/bin/bash

echo "========================================"
echo "  Starting Expo with Tunnel Mode"
echo "  (Extended timeout)"
echo "========================================"
echo ""

cd "$(dirname "$0")"

export EXPO_TUNNEL_TIMEOUT=120000

echo "Starting with extended timeout (120s)..."
echo "1. Install Expo Go from Play Store/App Store"
echo "2. Scan QR code with Expo Go app"
echo ""

npx expo start --tunnel --max-workers 2

