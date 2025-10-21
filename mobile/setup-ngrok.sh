#!/bin/bash

echo "========================================"
echo "  Setup ngrok authentication"
echo "========================================"
echo ""
echo "If you're getting 'ngrok tunnel took too long' error,"
echo "you may need to authenticate ngrok."
echo ""
echo "Steps:"
echo "1. Go to https://ngrok.com/ and sign up (free)"
echo "2. Get your auth token from dashboard"
echo "3. Run: npx ngrok authtoken YOUR_TOKEN"
echo ""
echo "After that, tunnel mode should work."
echo ""

read -p "Do you have ngrok auth token? (y/n): " has_token

if [ "$has_token" = "y" ]; then
    read -p "Enter your ngrok auth token: " token
    npx ngrok authtoken "$token"
    echo ""
    echo "Authentication saved! Now try tunnel mode again."
else
    echo ""
    echo "Please get your auth token from https://ngrok.com/"
    echo "Then run this script again."
fi

