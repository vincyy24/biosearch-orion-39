
# BiomediResearch Platform

This is a Django + React application for managing biomedical research data.

## Project Structure

- `frontend/` - React application
- `backend/` - Django application

## Setup Instructions

### 1. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
pip install -r requirements.txt
```

### 2. Build the Frontend

```bash
# From the frontend directory
npm run build
```
This will build the React app and copy the files to `backend/static/frontend/`.

### 3. Run Django Server

```bash
# From the backend directory
python manage.py migrate
python manage.py runserver
```

The application will be available at http://localhost:8000

## Development

For development, you can run both servers separately:

```bash
# Terminal 1 - Frontend (from frontend directory)
npm run dev

# Terminal 2 - Backend (from backend directory)
python manage.py runserver
```

Frontend will be at http://localhost:5173 and backend at http://localhost:8000.

## Important Files

- `frontend/vite.config.ts` - Vite configuration
- `backend/backend/settings.py` - Django settings
- `backend/backend/urls.py` - Django URL routing

## Notes

- Frontend API calls should use `/api/` as the base URL
- Direct all AJAX requests to the Django server
- Build files are automatically moved to Django's static directory during build
