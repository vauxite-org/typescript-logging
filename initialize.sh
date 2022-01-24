#!/bin/bash
set -euo pipefail
IFS=$'\n\t'

echo "Removing all node_modules directories and dist directories..."
rm -rf core/node_modules
rm -rf core/dist
rm -rf category-style/node_modules
rm -rf category-style/dist
rm -rf log4ts-style/node_modules
rm -rf log4ts-style/dist
rm -rf tests-integration/rollup/node_modules
rm -rf tests-integration/rollup/dist
rm -f  tests-integration/rollup/package-lock.json
rm -rf tests-integration/webpack/node_modules
rm -rf tests-integration/webpack/dist
rm -f  tests-integration/rollup/package-lock.json

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

# Note we do install, we don't checkin package-lock here as otherwise npm will use cache (so something old) for these if
# they were previously installed, can't have that with tests, they need to be reliable.
echo ""
echo "Installing packages for tests-integration/rollup"
cd ../tests-integration/rollup
npm install
echo "Building tests-integration/rollup..."
npm run build

echo "Installing packages for tests-integration/webpack"
cd ../webpack
npm install
echo "Building tests-integration/webpack..."
npm run build

cd ../../

echo -e "\nInstallation success.\n"
echo -e "The core (typescript-logging) is globally linked. The flavors: category-style and log4ts-style link to it, to enable local development.\n"
echo -e "To build a core/flavor module - get into a project directory, e.g. core, then type:"
echo -e "  npm run build (this applies to flavors too)\n"
echo "To build a test-integration project (requires core and flavors built successfully), go in respective directory (e.g. tests-integration/rollup):"
echo -e "  npm run build\n"
echo "Be aware that the integration projects need to have their package-lock.json removed to have the dependent packages (tar.gz.) installed clean again or a cached version is installed/used."
echo "Another option would be to link core and flavors both for each integration project (for development purposes this is faster)."

