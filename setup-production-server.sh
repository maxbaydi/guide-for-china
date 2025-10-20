#!/bin/bash

# Database setup script for production server
# This script helps set up the database on the production server

echo "============================================"
echo "Database Setup for Production Server"
echo "============================================"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "This script will help you set up the database on your production server."
echo ""
echo "Steps to run on the server (81.177.136.22):"
echo ""

echo "1. Connect to your server:"
echo -e "   ${YELLOW}ssh root@81.177.136.22${NC}"
echo ""

echo "2. Navigate to the project directory:"
echo -e "   ${YELLOW}cd /root/guide-for-china${NC}"
echo ""

echo "3. Check if Docker services are running:"
echo -e "   ${YELLOW}docker-compose -f docker-compose.prod.yml ps${NC}"
echo ""

echo "4. If services are not running, start them:"
echo -e "   ${YELLOW}docker-compose -f docker-compose.prod.yml up -d${NC}"
echo ""

echo "5. Wait for services to start (about 30 seconds), then run migrations:"
echo -e "   ${YELLOW}docker-compose -f docker-compose.prod.yml exec api-gateway npm run prisma:migrate:deploy${NC}"
echo ""

echo "6. Generate Prisma client:"
echo -e "   ${YELLOW}docker-compose -f docker-compose.prod.yml exec api-gateway npm run prisma:generate${NC}"
echo ""

echo "7. Check database connection:"
echo -e "   ${YELLOW}docker-compose -f docker-compose.prod.yml exec api-gateway npm run prisma:db:status${NC}"
echo ""

echo "8. Restart the API Gateway service:"
echo -e "   ${YELLOW}docker-compose -f docker-compose.prod.yml restart api-gateway${NC}"
echo ""

echo "9. Test the API:"
echo -e "   ${YELLOW}curl -k https://localhost:8443/api/v1/auth/register -X POST -H \"Content-Type: application/json\" -d '{\"email\":\"test@test.com\",\"username\":\"test\",\"password\":\"Test1234!\"}'${NC}"
echo ""

echo "============================================"
echo "DNS Configuration"
echo "============================================"
echo ""
echo "Also, don't forget to update your DNS settings:"
echo ""
echo "1. Log into your domain registrar (where you bought mypns.com)"
echo "2. Find DNS management settings"
echo "3. Update the A record:"
echo "   - Name: @ (or leave blank)"
echo "   - Type: A"
echo "   - Value: 81.177.136.22"
echo "   - TTL: 300 (5 minutes)"
echo ""
echo "4. Wait for DNS propagation (5-60 minutes)"
echo "5. Test with: ping mypns.com"
echo ""

echo "============================================"
echo "After DNS is Fixed"
echo "============================================"
echo ""
echo "Once DNS is working, test the domain:"
echo -e "   ${YELLOW}./test-domain-migration.sh${NC}"
echo ""
echo "And test the mobile app configuration:"
echo -e "   ${YELLOW}cd mobile && eas build --platform android --profile production${NC}"
echo ""


