#!/bin/bash

# Test script for mypns.com domain migration
# This script tests all endpoints with the new domain

echo "============================================"
echo "Testing mypns.com domain configuration"
echo "============================================"
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

# Test DNS resolution
echo "1. Testing DNS Resolution:"
echo -n "   Resolving mypns.com: "
if nslookup mypns.com > /dev/null 2>&1; then
    ip=$(nslookup mypns.com | grep -A1 "Name:" | grep "Address:" | awk '{print $2}' | tail -1)
    echo -e "${GREEN}✓ Resolved to $ip${NC}"
else
    echo -e "${RED}✗ Failed to resolve${NC}"
    exit 1
fi
echo ""

# Test HTTPS endpoints
echo "2. Testing HTTPS Endpoints:"
test_endpoint "https://mypns.com/health" "API Gateway Health"
test_endpoint "https://mypns.com/api/v1/health" "API v1 Health"
test_graphql "https://mypns.com/graphql"
echo ""

# Test specific services
echo "3. Testing Service Endpoints:"
test_endpoint "https://mypns.com/api/v1/dictionary/health" "Dictionary Service"
test_endpoint "https://mypns.com/api/v1/auth/health" "Auth Service"
test_endpoint "https://mypns.com/api/v1/tts/health" "TTS Service"
echo ""

# Test SSL certificate
echo "4. Testing SSL Certificate:"
echo -n "   Certificate validation: "
if echo | openssl s_client -connect mypns.com:443 -servername mypns.com 2>/dev/null | openssl x509 -noout 2>/dev/null; then
    echo -e "${GREEN}✓ Valid certificate${NC}"
    
    # Get certificate details
    echo "   Certificate details:"
    echo | openssl s_client -connect mypns.com:443 -servername mypns.com 2>/dev/null | openssl x509 -noout -subject -issuer -dates 2>/dev/null | sed 's/^/      /'
else
    echo -e "${YELLOW}⚠ Self-signed or invalid certificate${NC}"
fi
echo ""

# Test CORS with curl
echo "5. Testing CORS Headers:"
echo -n "   CORS headers present: "
cors_headers=$(curl -s -I -k -X OPTIONS "https://mypns.com/api/v1/health" \
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
echo "Domain: mypns.com"
echo "API Base URL: https://mypns.com/api/v1"
echo "GraphQL URL: https://mypns.com/graphql"
echo ""
echo -e "${YELLOW}Note:${NC} If using self-signed certificates, mobile apps"
echo "need to be configured to trust them."
echo ""
echo "Next steps:"
echo "1. Update server configuration with the new domain"
echo "2. Deploy the updated .env.prod file to the server"
echo "3. Restart Docker services"
echo "4. Rebuild mobile app with new configuration"
echo ""


