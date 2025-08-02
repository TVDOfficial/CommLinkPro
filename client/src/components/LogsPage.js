import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  RefreshCw, 
  Clock,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  Settings,
  Zap
} from 'lucide-react';

const LogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(100);

  useEffect(() => {
    fetchLogs();
  }, [limit]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/logs?limit=${limit}`);
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to load activity logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    switch (action.toUpperCase()) {
      case 'ADD':
        return <Plus className="h-5 w-5 text-emerald-600" />;
      case 'UPDATE':
        return <Edit className="h-5 w-5 text-blue-600" />;
      case 'DELETE':
        return <Trash2 className="h-5 w-5 text-red-600" />;
      case 'EXPORT':
        return <Download className="h-5 w-5 text-purple-600" />;
      default:
        return <Activity className="h-5 w-5 text-slate-600" />;
    }
  };

  const getActionColor = (action) => {
    switch (action.toUpperCase()) {
      case 'ADD':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'UPDATE':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'DELETE':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'EXPORT':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const logTime = new Date(timestamp);
    const diffMs = now - logTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const getActionStats = () => {
    const stats = { ADD: 0, UPDATE: 0, DELETE: 0, EXPORT: 0 };
    logs.forEach(log => {
      if (stats.hasOwnProperty(log.action)) {
        stats[log.action]++;
      }
    });
    return stats;
  };

  const actionStats = getActionStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        <span className="text-slate-600 font-medium">Loading activity logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Activity Monitor</h2>
                <p className="text-slate-600 font-medium">System audit trail and change logs</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white shadow-sm transition-all font-medium"
              >
                <option value={50}>Last 50 entries</option>
                <option value={100}>Last 100 entries</option>
                <option value={250}>Last 250 entries</option>
                <option value={500}>Last 500 entries</option>
              </select>
              <button
                onClick={fetchLogs}
                className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                title="Refresh logs"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Action Statistics */}
        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { action: 'ADD', label: 'Equipment Added', color: 'emerald', icon: Plus },
              { action: 'UPDATE', label: 'Updates Made', color: 'blue', icon: Edit },
              { action: 'DELETE', label: 'Equipment Removed', color: 'red', icon: Trash2 },
              { action: 'EXPORT', label: 'Data Exports', color: 'purple', icon: Download }
            ].map(({ action, label, color, icon: Icon }) => (
              <div key={action} className={`bg-gradient-to-r from-${color}-50 to-${color}-100 rounded-xl p-4 border border-${color}-200`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-lg flex items-center justify-center shadow-lg`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold text-${color}-700`}>{actionStats[action]}</div>
                    <div className={`text-sm font-medium text-${color}-600`}>{label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200">
        <div className="px-8 py-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Recent Activity</h3>
            <div className="text-sm text-slate-600">
              {logs.length} {logs.length === 1 ? 'entry' : 'entries'}
            </div>
          </div>
        </div>

        <div className="p-8">
          {logs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Clock className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">No Activity Yet</h3>
              <p className="text-slate-600 text-lg">
                System activity will appear here as users manage equipment
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div 
                  key={log.id} 
                  className="flex items-center space-x-4 p-6 hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent rounded-xl transition-all duration-200 border border-transparent hover:border-slate-200"
                >
                  {/* Action Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-white border-2 border-slate-200 rounded-xl flex items-center justify-center shadow-sm">
                      {getActionIcon(log.action)}
                    </div>
                  </div>

                  {/* Log Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-semibold border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                      {log.radio_serial && (
                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-mono font-semibold">
                          {log.radio_serial}
                        </span>
                      )}
                      <span className="text-xs text-slate-500 font-medium">
                        {getRelativeTime(log.timestamp)}
                      </span>
                    </div>

                    <div className="text-slate-900 font-medium mb-2">
                      {log.details || 'No details available'}
                    </div>

                    <div className="flex items-center space-x-6 text-sm text-slate-500">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{formatTimestamp(log.timestamp)}</span>
                      </div>
                      {log.operator_name && (
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4" />
                          <span>{log.operator_name}</span>
                        </div>
                      )}
                      {log.ip_address && (
                        <div className="flex items-center space-x-1">
                          <Shield className="w-4 h-4" />
                          <span>{log.ip_address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${
                      log.action === 'ADD' ? 'bg-emerald-400' :
                      log.action === 'UPDATE' ? 'bg-blue-400' :
                      log.action === 'DELETE' ? 'bg-red-400' : 'bg-purple-400'
                    }`}></div>
                  </div>
                </div>
              ))}

              {/* Load More */}
              {logs.length >= limit && (
                <div className="text-center pt-8 border-t border-slate-200">
                  <button
                    onClick={() => setLimit(prev => prev + 100)}
                    className="px-6 py-3 bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 rounded-xl font-semibold transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    Load More Entries
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* System Insights */}
      {logs.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Zap className="w-6 h-6 text-amber-500" />
            <h3 className="text-xl font-bold text-slate-900">System Insights</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{logs.length}</div>
              <div className="text-sm text-slate-600 font-medium">Total Activities</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-600 mb-2">
                {Math.round((actionStats.ADD / (logs.length || 1)) * 100)}%
              </div>
              <div className="text-sm text-slate-600 font-medium">Equipment Additions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {new Set(logs.map(log => log.operator_name).filter(Boolean)).size}
              </div>
              <div className="text-sm text-slate-600 font-medium">Active Users</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsPage;