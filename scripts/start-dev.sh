#!/bin/bash

echo "🚀 Starting Kamioi Platform Development Environment"
echo

echo "📦 Starting Backend Server (Port 5000)..."
cd backend
python app.py &
BACKEND_PID=$!

echo "⏳ Waiting for backend to start..."
sleep 3

echo "🎨 Starting Frontend Server (Port 3764)..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo
echo "✅ Development servers started!"
echo "🌐 Frontend: http://localhost:3764"
echo "🔧 Backend: http://localhost:5000"
echo "📊 Health Check: http://localhost:5000/api/health"
echo
echo "Press Ctrl+C to stop both servers"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    exit 0
}

# Trap Ctrl+C
trap cleanup INT

# Wait for both processes
wait

