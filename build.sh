
#!/bin/bash
set -e

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build

# Setup backend
echo "Setting up backend..."
cd ../backend
pip install -r requirements.txt
python manage.py collectstatic --noinput
python manage.py migrate

echo "Setup complete! Run the following to start the server:"
echo "cd backend && python manage.py runserver"
