import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CreateIssue } from './CreateIssue';
import { IssueList } from './IssueList';

export const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);

  const handleIssueCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-indigo-600">
              Smart Issue Board
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-gray-700">
                Logged in as: <span className="font-medium">{currentUser?.email}</span>
              </span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CreateIssue onIssueCreated={handleIssueCreated} />
        <IssueList key={refreshKey} />
      </main>
    </div>
  );
};

