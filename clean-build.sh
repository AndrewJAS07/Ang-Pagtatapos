#!/bin/bash
# Clean build helper script

echo "Cleaning Metro cache and node_modules..."
rm -rf node_modules
rm -rf .expo
rm -rf android/build

echo "Reinstalling dependencies..."
npm install

echo "Clearing Metro cache..."
npm start -- --reset-cache

echo "Ready for fresh build!"
