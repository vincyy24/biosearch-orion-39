import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-gray-100">404</h1>
      <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Oops! Page not found</p>
      <button className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-600 underline" onClick={() => navigate("/")}>
        Return to Home
      </button>
      </div>
    </div>
  );
};

export default NotFound;
