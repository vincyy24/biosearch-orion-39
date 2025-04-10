#!/bin/bash

set -e  # Exit immediately if a command exits with a non-zero status
set -o pipefail  # Catch errors in pipelines

# Function to display error messages and exit
error_exit() {
    echo "Error: $1" >&2
    exit 1
}

# Ensure npm is installed, if not install it
if ! command -v npm &> /dev/null; then
    echo "npm is not installed. Installing npm..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y npm || error_exit "Failed to install npm."
    elif command -v yum &> /dev/null; then
        sudo yum install -y npm || error_exit "Failed to install npm."
    else
        error_exit "Package manager not supported. Please install npm manually."
    fi
fi

# Ensure pip is installed, if not install it
if ! command -v pip &> /dev/null; then
    echo "pip is not installed. Installing pip..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y python3-pip || error_exit "Failed to install pip."
    elif command -v yum &> /dev/null; then
        sudo yum install -y python3-pip || error_exit "Failed to install pip."
    else
        error_exit "Package manager not supported. Please install pip manually."
    fi
fi

# Ensure Python is installed, if not install it
if ! command -v python3 &> /dev/null; then
    echo "Python3 is not installed. Installing Python3..."
    if command -v apt-get &> /dev/null; then
        sudo apt-get update && sudo apt-get install -y python3 || error_exit "Failed to install Python3."
    elif command -v yum &> /dev/null; then
        sudo yum install -y python3 || error_exit "Failed to install Python3."
    else
        error_exit "Package manager not supported. Please install Python3 manually."
    fi
fi

# Create the static/frontend directory if it doesn't exist
STATIC_DIR="backend/static/frontend"
mkdir -p "$STATIC_DIR"

# Navigate to the frontend directory and install dependencies
if [ -d "frontend" ]; then
    cd frontend || error_exit "Failed to navigate to the frontend directory."
    npm install || error_exit "npm install failed."
    npm run build || error_exit "npm run build failed."
    cd - > /dev/null || error_exit "Failed to navigate back to the root directory."
else
    error_exit "Frontend directory does not exist."
fi

# Navigate to the backend directory and collect static files
if [ -d "backend" ]; then
    cd backend || error_exit "Failed to navigate to the backend directory."
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt || error_exit "Failed to install Python dependencies."
    else
        error_exit "requirements.txt not found in the backend directory."
    fi
    python3 manage.py collectstatic --noinput || error_exit "Django collectstatic failed."
    cd - > /dev/null || error_exit "Failed to navigate back to the root directory."
else
    error_exit "Backend directory does not exist."
fi

echo "Build complete! Frontend files have been moved to $STATIC_DIR."
