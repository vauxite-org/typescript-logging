#!/bin/bash
set -e

echo "Removing all node_modules directories and dist directories..."
rm -rf core/node_modules
rm -rf core/dist
rm -rf category-style/node_modules
rm -rf category-style/dist
rm -rf log4ts-style/node_modules
rm -rf log4ts-style/dist
rm -rf tests-integration/rollup/node_modules
rm -rf tests-integration/rollup/dist
rm -rf tests-integration/webpack/node_modules
rm -rf tests-integration/webpack/dist
rm -rf home/node_modules

echo "Installing packages for core..."
cd core
npm unlink -g
npm link
npm ci

echo "Building core..."
npm run build

echo "Installing packages for category-style..."
cd ../category-style
npm link typescript-logging
npm ci

echo "Building category-style..."
npm run build

echo "Installing packages for log4ts-style..."
cd ../log4ts-style
npm link typescript-logging
npm ci

echo "Building log4ts-style..."
npm run build

echo ""
echo "Installing packages for tests-integration/rollup"
cd ../tests-integration/rollup
npm ci
echo "Building tests-integration/rollup..."
npm run build

echo "Installing packages for tests-integration/webpack"
cd ../webpack
npm ci
echo "Building tests-integration/webpack..."
npm run build

cd ../../

echo -e "\nInstallation success.\n\n"
echo -e "The core (typescript-logging) is globally linked. The flavors: category-style and log4ts-style link to it, to enable local development.\n"
echo -e "To build a core/flavor module - get into a project directory, e.g. core, then type: npm run build (this applies to flavors too)\n\n"
echo "To build a test-integration project (requires core and flavors built successfully), go in respective directory (e.g. tests-integration/rollup):"
echo "  npm run build"

