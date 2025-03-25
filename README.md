
# ORION - Open Repository for Integrated Electrochemical Observation & Networking

ORION is a comprehensive platform for managing biomedical research data, providing tools for data visualization, analysis, and collaboration.

## Project Overview

ORION is designed to facilitate the storage, access, and analysis of potentiostat-generated experimental data. It provides:

- A centralized repository for research data
- Advanced visualization and analysis tools
- Collaboration features for research teams
- Publication management with DOI integration
- User dashboard with analytics

## Project Structure

- `frontend/` - React application built with Vite, TypeScript, and Tailwind CSS
- `backend/` - Django application serving as the API and data management system

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

## Key Features

- **Data Browsing:** Explore and filter research datasets
- **Visualization Tools:** Interactive charts and graphs for data analysis
- **Publication Management:** Link datasets to published papers with DOI verification
- **User Dashboard:** Track activity and manage personal data
- **Research Collaboration:** Share datasets with team members

## Implemented Features

- ✅ Data browsing and basic visualization
- ✅ Publication management with DOI verification
- ✅ User authentication system
- ✅ Basic dashboard analytics
- ✅ Responsive design for mobile and desktop
- ✅ Sidebar state persistence

## Pending Implementation

- ⏳ Advanced search functionality
- ⏳ Two-factor authentication
- ⏳ User data export and deletion capabilities
- ⏳ File upload security enhancements (type restrictions, size limits)
- ⏳ Multi-user collaboration with granular permissions
- ⏳ Email notifications system
- ⏳ Integration with citation management tools
- ⏳ API access for programmatic data retrieval
- ⏳ Advanced analytics and data visualization options

## Technologies Used

- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, Recharts
- **Backend:** Django, Django REST Framework
- **Database:** PostgreSQL (production), SQLite (development)
- **Authentication:** JWT-based authentication

## Contributing

Please read our contribution guidelines before submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
