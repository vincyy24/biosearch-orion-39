
#!/bin/bash

# Navigate to frontend directory
cd frontend

# Install dependencies if needed
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
