
#!/bin/bash

# Make sure npm is available
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to frontend directory and install dependencies if needed
cd frontend
npm install 

# Build the frontend
npm run build

# Navigate back to root
cd ..

# Make sure the static/frontend directory exists
mkdir -p backend/static/frontend

# Django collectstatic
cd backend
python3 manage.py collectstatic --noinput

echo "Build complete! Frontend files have been moved to backend/static/frontend."
