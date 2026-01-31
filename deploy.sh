#!/bin/bash

# Script Deploy Otomatis untuk Tomo Batik
# Usage: ./deploy.sh

set -e  # Exit on error

echo "🚀 Starting deployment process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run this script as root. Run as regular user with sudo privileges.${NC}"
   exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js not found. Installing Node.js 20.x...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm not found. Please install Node.js first.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js version: $(node --version)${NC}"
echo -e "${GREEN}✓ npm version: $(npm --version)${NC}"

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${YELLOW}Creating .env.production file...${NC}"
    echo "VITE_API_URL=http://localhost:3001/api" > .env.production
    echo -e "${YELLOW}⚠️  Please edit .env.production with your API URL before building!${NC}"
    read -p "Press Enter to continue after editing .env.production..."
fi

# Build project
echo -e "${YELLOW}Building project...${NC}"
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}Build failed! dist directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed successfully!${NC}"
echo -e "${GREEN}✓ Files are ready in dist/ directory${NC}"

# Check if Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}Nginx not found. Please install Nginx first:${NC}"
    echo "sudo apt install -y nginx"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Deployment preparation completed!${NC}"
echo ""
echo "Next steps:"
echo "1. Copy dist/ folder to /var/www/tomo-batik/dist"
echo "2. Setup Nginx configuration (see DEPLOYMENT.md)"
echo "3. Setup SSL with Let's Encrypt (optional but recommended)"
echo ""
echo "For detailed instructions, see DEPLOYMENT.md"

