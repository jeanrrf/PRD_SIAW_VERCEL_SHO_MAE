#!/bin/bash
set -e

echo "Installing Python dependencies..."
python -m pip install --upgrade pip
pip install -r requirements.txt --target .

echo "Moving static files to public directory..."
mkdir -p public/static
cp -r public/static/* public/

echo "Build completed successfully!"
