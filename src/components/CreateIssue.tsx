import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createIssue, findSimilarIssues } from '../services/issueService';
import { Issue, IssueFormData, Priority, Status } from '../types/issue';

interface CreateIssueProps {
  onIssueCreated: () => void;
}

export const CreateIssue = ({ onIssueCreated }: CreateIssueProps) => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState<IssueFormData>({
    title: '',
    description: '',
    priority: 'Medium',
    status: 'Open',
    assignedTo: '',
  });
  const [similarIssues, setSimilarIssues] = useState<Issue[]>([]);
  const [showSimilarWarning, setShowSimilarWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSimilarIssues = async () => {
      // Lowered threshold: check if title has at least 3 chars or description has at least 5 chars
      if (formData.title.length >= 3 || formData.description.length >= 5) {
        try {
          const similar = await findSimilarIssues(
            formData.title,
            formData.description
          );
          setSimilarIssues(similar);
          setShowSimilarWarning(similar.length > 0);
        } catch (error) {
          console.error('Error checking similar issues:', error);
          setSimilarIssues([]);
          setShowSimilarWarning(false);
        }
      } else {
        setSimilarIssues([]);
        setShowSimilarWarning(false);
      }
    };

    const timeoutId = setTimeout(checkSimilarIssues, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.title, formData.description]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!currentUser) {
        throw new Error('You must be logged in to create an issue');
      }

      await createIssue(formData, currentUser.email || '');
      setFormData({
        title: '',
        description: '',
        priority: 'Medium',
        status: 'Open',
        assignedTo: '',
      });
      setSimilarIssues([]);
      setShowSimilarWarning(false);
      onIssueCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to create issue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Create New Issue</h2>
      
      {showSimilarWarning && similarIssues.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="font-semibold text-yellow-800 mb-2">
            ⚠️ Similar issues found:
          </p>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            {similarIssues.map((issue) => (
              <li key={issue.id}>
                <span className="font-medium">{issue.title}</span> -{' '}
                <span className="text-xs">
                  {issue.status} | {issue.priority}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-yellow-700">
            Please review these before creating a duplicate issue.
          </p>
        </div>
      )}

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            required
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority *
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  priority: e.target.value as Priority,
                })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Status,
                })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assigned To
          </label>
          <input
            type="text"
            value={formData.assignedTo}
            onChange={(e) =>
              setFormData({ ...formData, assignedTo: e.target.value })
            }
            placeholder="Email or name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating...' : 'Create Issue'}
        </button>
      </form>
    </div>
  );
};

