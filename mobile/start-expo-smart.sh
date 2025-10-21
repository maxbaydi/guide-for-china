#!/bin/bash

echo "========================================"
echo "  Smart Expo Launcher"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "Trying LOCAL NETWORK first (recommended)..."
echo "If your phone and PC are on the same WiFi, this will work."
echo ""
echo "Instructions:"
echo "1. Install Expo Go from Play Store/App Store"
echo "2. Scan QR code with Expo Go app"
echo "3. If not working, press Ctrl+C and run again with tunnel"
echo ""

npm start

