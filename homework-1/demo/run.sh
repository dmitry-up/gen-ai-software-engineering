#!/bin/bash
echo "========================================"
echo " Banking Transactions API - Starting..."
echo "========================================"
echo

cd "$(dirname "$0")/.."
npm install
npm start
