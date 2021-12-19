#!/bin/bash
set -e

echo "Removing all node_modules directories and dist directories..."

rm -rf node_modules dist
rm -rf category-style/dist
rm -rf log4ts-style/dist
rm -rf tests-integration/rollup/node_modules
rm -rf tests-integration/rollup/dist
rm -rf tests-integration/webpack/node_modules
rm -rf tests-integration/webpack/dist
rm -rf home/node_modules

echo "Installing packages for core and style flavors..."
npm ci

echo ""
echo "Installing packages for tests-integration"
cd tests-integration/rollup
npm ci
cd ../webpack
npm ci

echo ""
echo "Installing packages for home..."
cd ../../home
npm ci

cd ..

echo ""
echo "Installation success."
echo "To build all logging and flavors:"
echo "  npm run build --workspaces"
echo "To build a test-integration project (requires previous command succeeded), go in respective directory (e.g. tests-integration/rollup):"
echo "  npm run build"

