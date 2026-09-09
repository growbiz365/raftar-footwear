#!/bin/bash
set -e

echo "Installing backend dependencies..."
cd backend
npm ci --omit=dev || npm install --omit=dev

echo "Backend dependencies installed."
echo "NOTE: frontend/dist is pre-built and committed to git, so Vite never runs on Hostinger."