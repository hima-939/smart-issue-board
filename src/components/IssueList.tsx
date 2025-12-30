import { useState, useEffect } from 'react';
import { getIssues, updateIssueStatus } from '../services/issueService';
import { Issue, Priority, Status } from '../types/issue';

export const IssueList = () => {
  const [filteredIssues, setFilteredIssues] = useState<Issue[]>([]);
  const [statusFilter, setStatusFilter] = useState<Status | ''>('');
  const [priorityFilter, setPriorityFilter] = useState<Priority | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusError, setStatusError] = useState('');
  const [errorIssueId, setErrorIssueId] = useState<string | null>(null);

  const loadIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getIssues(
        statusFilter || undefined,
        priorityFilter || undefined
      );
      setFilteredIssues(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [statusFilter, priorityFilter]);

  const handleStatusChange = async (issueId: string, newStatus: Status, oldStatus: Status) => {
    setStatusError('');
    setErrorIssueId(null);
    try {
      await updateIssueStatus(issueId, newStatus, oldStatus);
      await loadIssues();
    } catch (err: any) {
      setStatusError(err.message || 'Failed to update status');
      setErrorIssueId(issueId);
      setTimeout(() => {
        setStatusError('');
        setErrorIssueId(null);
      }, 5000);
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Open':
        return 'bg-blue-100 text-blue-800';
      case 'In Progress':
        return 'bg-purple-100 text-purple-800';
      case 'Done':
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        <p className="mt-2 text-gray-600">Loading issues...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">All Issues</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Status | '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Priority
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as Priority | '')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {filteredIssues.length === 0 ? (
          <p className="text-gray-600 text-center py-8">No issues found.</p>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <div
                key={issue.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {issue.title}
                  </h3>
                  <div className="flex gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(
                        issue.priority
                      )}`}
                    >
                      {issue.priority}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
                        issue.status
                      )}`}
                    >
                      {issue.status}
                    </span>
                  </div>
                </div>

                <p className="text-gray-600 mb-3">{issue.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                  <div>
                    <span className="font-medium">Assigned To:</span>{' '}
                    {issue.assignedTo || 'Unassigned'}
                  </div>
                  <div>
                    <span className="font-medium">Created By:</span> {issue.createdBy}
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>{' '}
                    {issue.createdTime.toLocaleString()}
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Update Status
                  </label>
                  {errorIssueId === issue.id && statusError && (
                    <div className="mb-2 p-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
                      {statusError}
                    </div>
                  )}
                  <select
                    value={issue.status}
                    onChange={(e) =>
                      handleStatusChange(
                        issue.id,
                        e.target.value as Status,
                        issue.status
                      )
                    }
                    className={`px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                      errorIssueId === issue.id ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

