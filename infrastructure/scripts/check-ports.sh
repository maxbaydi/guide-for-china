#!/bin/bash

# Script to check if ports are accessible from external devices

echo "🔍 Checking HanGuide API ports..."
echo ""

LOCAL_IP="192.168.31.88"
PORTS=(4000 4001 4002)
PORT_NAMES=("API Gateway" "Dictionary Service" "User Service")

for i in "${!PORTS[@]}"; do
    port=${PORTS[$i]}
    name=${PORT_NAMES[$i]}
    
    echo -n "Checking $name (port $port)... "
    
    if nc -zv $LOCAL_IP $port 2>&1 | grep -q "succeeded"; then
        echo "✅ Accessible"
    else
        echo "❌ Not accessible"
        echo "   Try running: sudo ufw allow $port/tcp"
    fi
done

echo ""
echo "📱 Use this URL in your mobile app:"
echo "   http://$LOCAL_IP:4000/api/v1"
echo ""
echo "🌐 Test in browser:"
echo "   http://$LOCAL_IP:4000/health"

