import React from 'react';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-8">
          This is a placeholder login page. You can customize it as needed.
        </p>
        <button
          onClick={() => navigate('/auth')}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Go to Auth Page
        </button>
      </div>
    </div>
  );
};

export default LoginPage; 