#!/bin/bash

echo "========================================"
echo "  Starting Expo for Development"
echo "  with Expo Go App"
echo "========================================"
echo ""
echo "Choose mode:"
echo "  1. Local network (fastest, same WiFi required)"
echo "  2. Tunnel (works anywhere, slower)"
echo "  3. Clear cache and start"
echo ""

read -p "Enter choice (1-3): " choice

cd "$(dirname "$0")"

case $choice in
    1)
        echo ""
        echo "Starting on LOCAL NETWORK..."
        echo "1. Install Expo Go from Play Store/App Store"
        echo "2. Scan QR code with Expo Go app"
        echo ""
        npm start
        ;;
    2)
        echo ""
        echo "Starting with TUNNEL..."
        echo "This may take a minute to connect..."
        echo "1. Install Expo Go from Play Store/App Store"
        echo "2. Scan QR code with Expo Go app"
        echo ""
        npm run start:tunnel
        ;;
    3)
        echo ""
        echo "Clearing cache and starting..."
        npm run reset
        ;;
    *)
        echo "Invalid choice!"
        ;;
esac

