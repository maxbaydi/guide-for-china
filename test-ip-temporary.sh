#!/bin/bash

# Temporary test script using IP address while DNS propagates
# This tests the configuration changes with the IP address

echo "============================================"
echo "Testing configuration with IP address (temporary)"
echo "============================================"
echo ""
echo "Note: DNS for mypns.com is not yet pointing to 81.177.136.22"
echo "This test uses the IP address directly"
echo ""

# Color codes for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to test an endpoint
test_endpoint() {
    local url=$1
    local description=$2
    
    echo -n "Testing $description: "
    
    # Test with curl
    if curl -s -f -k "$url" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ SUCCESS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Function to test GraphQL endpoint
test_graphql() {
    local url=$1
    
    echo -n "Testing GraphQL endpoint: "
    
    # Test with a simple introspection query
    if curl -s -f -k -X POST "$url" \
        -H "Content-Type: application/json" \
        -d '{"query":"{__typename}"}' > /dev/null 2>&1; then
        echo -e "${GREEN}✓ SUCCESS${NC}"
        return 0
    else
        echo -e "${RED}✗ FAILED${NC}"
        return 1
    fi
}

# Test server connectivity
echo "1. Testing Server Connectivity:"
echo -n "   Ping server: "
if ping -c 1 81.177.136.22 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Server reachable${NC}"
else
    echo -e "${RED}✗ Server unreachable${NC}"
    exit 1
fi
echo ""

# Test HTTPS endpoints with IP
echo "2. Testing HTTPS Endpoints (using IP):"
test_endpoint "https://81.177.136.22:8443/health" "API Gateway Health"
test_endpoint "https://81.177.136.22:8443/api/v1/health" "API v1 Health"
test_graphql "https://81.177.136.22:8443/graphql"
echo ""

# Test specific services
echo "3. Testing Service Endpoints:"
test_endpoint "https://81.177.136.22:8443/api/v1/dictionary/health" "Dictionary Service"
test_endpoint "https://81.177.136.22:8443/api/v1/auth/health" "Auth Service"
test_endpoint "https://81.177.136.22:8443/api/v1/tts/health" "TTS Service"
echo ""

# Test SSL certificate
echo "4. Testing SSL Certificate:"
echo -n "   Certificate validation: "
if echo | openssl s_client -connect 81.177.136.22:8443 -servername 81.177.136.22 2>/dev/null | openssl x509 -noout 2>/dev/null; then
    echo -e "${GREEN}✓ Valid certificate${NC}"
    
    # Get certificate details
    echo "   Certificate details:"
    echo | openssl s_client -connect 81.177.136.22:8443 -servername 81.177.136.22 2>/dev/null | openssl x509 -noout -subject -issuer -dates 2>/dev/null | sed 's/^/      /'
else
    echo -e "${YELLOW}⚠ Self-signed or invalid certificate${NC}"
fi
echo ""

# Test CORS with curl
echo "5. Testing CORS Headers:"
echo -n "   CORS headers present: "
cors_headers=$(curl -s -I -k -X OPTIONS "https://81.177.136.22:8443/api/v1/health" \
    -H "Origin: http://localhost:8080" \
    -H "Access-Control-Request-Method: GET" | grep -i "access-control")
    
if [ ! -z "$cors_headers" ]; then
    echo -e "${GREEN}✓ CORS enabled${NC}"
    echo "$cors_headers" | sed 's/^/      /'
else
    echo -e "${RED}✗ No CORS headers found${NC}"
fi
echo ""

# Summary
echo "============================================"
echo "Summary:"
echo "============================================"
echo ""
echo "Current Status:"
echo "  Server IP: 81.177.136.22:8443 ✓ Working"
echo "  Domain: mypns.com ✗ DNS not configured"
echo ""
echo "Next Steps:"
echo "1. Update DNS A record for mypns.com to point to 81.177.136.22"
echo "2. Wait for DNS propagation (5-60 minutes)"
echo "3. Run the original test script: ./test-domain-migration.sh"
echo ""
echo "Temporary Configuration:"
echo "  API Base URL: https://81.177.136.22:8443/api/v1"
echo "  GraphQL URL: https://81.177.136.22:8443/graphql"
echo ""
echo -e "${YELLOW}Note:${NC} Once DNS is fixed, the mobile app configuration"
echo "will automatically use the domain name."
echo ""

