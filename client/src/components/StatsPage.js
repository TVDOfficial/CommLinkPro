import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  BarChart3, 
  Users, 
  Building, 
  Radio, 
  Activity, 
  TrendingUp,
  MapPin,
  Clock,
  Shield,
  Zap,
  Award,
  Target
} from 'lucide-react';

const StatsPage = () => {
  const [stats, setStats] = useState(null);
  const [radios, setRadios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, radiosResponse] = await Promise.all([
        axios.get('/api/stats'),
        axios.get('/api/radios')
      ]);
      setStats(statsResponse.data);
      setRadios(radiosResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStats = () => {
    const statusCounts = { active: 0, maintenance: 0, offline: 0, reserved: 0 };
    radios.forEach(radio => {
      const status = radio.status?.toLowerCase() || 'active';
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      }
    });
    return statusCounts;
  };

  const getDepartmentStats = () => {
    const deptCounts = {};
    radios.forEach(radio => {
      if (radio.department) {
        deptCounts[radio.department] = (deptCounts[radio.department] || 0) + 1;
      }
    });
    return Object.entries(deptCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);
  };

  const getModelStats = () => {
    const modelCounts = {};
    radios.forEach(radio => {
      modelCounts[radio.model] = (modelCounts[radio.model] || 0) + 1;
    });
    return Object.entries(modelCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6);
  };

  const getAssignmentStats = () => {
    const assigned = radios.filter(radio => radio.user_name && radio.user_name.trim() !== '').length;
    const unassigned = radios.length - assigned;
    return { assigned, unassigned, percentage: radios.length ? Math.round((assigned / radios.length) * 100) : 0 };
  };

  const getRecentStats = () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const recent7Days = radios.filter(radio => new Date(radio.created_at) >= sevenDaysAgo).length;
    const recent30Days = radios.filter(radio => new Date(radio.created_at) >= thirtyDaysAgo).length;
    
    return { recent7Days, recent30Days };
  };

  const getSiteStats = () => {
    const siteCounts = {};
    radios.forEach(radio => {
      if (radio.site_code) {
        siteCounts[radio.site_code] = (siteCounts[radio.site_code] || 0) + 1;
      }
    });
    return Object.entries(siteCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        <span className="text-slate-600 font-medium">Loading analytics...</span>
      </div>
    );
  }

  const statusStats = getStatusStats();
  const departmentStats = getDepartmentStats();
  const modelStats = getModelStats();
  const assignmentStats = getAssignmentStats();
  const recentStats = getRecentStats();
  const siteStats = getSiteStats();

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Equipment Analytics</h2>
              <p className="text-slate-600 font-medium">Comprehensive system insights and performance metrics</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Radio className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-700">{radios.length}</div>
                  <div className="text-sm font-semibold text-blue-600">Total Equipment</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-6 border border-emerald-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-700">{assignmentStats.assigned}</div>
                  <div className="text-sm font-semibold text-emerald-600">Assigned Units</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Building className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-amber-700">{departmentStats.length}</div>
                  <div className="text-sm font-semibold text-amber-600">Active Departments</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-700">{assignmentStats.percentage}%</div>
                  <div className="text-sm font-semibold text-purple-600">Assignment Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Shield className="w-6 h-6 text-emerald-500" />
          <h3 className="text-xl font-bold text-slate-900">Equipment Status Overview</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { status: 'active', label: 'Active', color: 'emerald', count: statusStats.active },
            { status: 'maintenance', label: 'Maintenance', color: 'amber', count: statusStats.maintenance },
            { status: 'offline', label: 'Offline', color: 'red', count: statusStats.offline },
            { status: 'reserved', label: 'Reserved', color: 'slate', count: statusStats.reserved }
          ].map(({ status, label, color, count }) => {
            const percentage = radios.length ? Math.round((count / radios.length) * 100) : 0;
            return (
              <div key={status} className="text-center">
                <div className={`w-16 h-16 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{count}</span>
                </div>
                <div className="font-semibold text-slate-900 mb-1">{label}</div>
                <div className={`w-full bg-${color}-100 rounded-full h-2 mb-2`}>
                  <div 
                    className={`h-2 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="text-sm text-slate-600 font-medium">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Department Distribution */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Building className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-bold text-slate-900">Department Distribution</h3>
          </div>
          
          <div className="space-y-4">
            {departmentStats.map(([department, count], index) => {
              const percentage = radios.length ? Math.round((count / radios.length) * 100) : 0;
              const colors = ['blue', 'emerald', 'purple', 'amber', 'red', 'indigo', 'pink', 'cyan'];
              const color = colors[index % colors.length];
              
              return (
                <div key={department} className="flex items-center space-x-4">
                  <div className={`w-10 h-10 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {count}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-900">{department}</span>
                      <span className="text-sm text-slate-600 font-medium">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Equipment Models */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Radio className="w-6 h-6 text-emerald-500" />
            <h3 className="text-xl font-bold text-slate-900">Popular Models</h3>
          </div>
          
          <div className="space-y-4">
            {modelStats.map(([model, count], index) => {
              const percentage = radios.length ? Math.round((count / radios.length) * 100) : 0;
              const colors = ['emerald', 'blue', 'purple', 'amber', 'red', 'indigo'];
              const color = colors[index % colors.length];
              
              return (
                <div key={model} className="flex items-center space-x-4">
                  <div className={`w-10 h-10 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                    {count}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-semibold text-slate-900 truncate">{model}</span>
                      <span className="text-sm text-slate-600 font-medium">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className={`h-2 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full transition-all duration-300`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Site Distribution */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <MapPin className="w-6 h-6 text-purple-500" />
            <h3 className="text-xl font-bold text-slate-900">Site Distribution</h3>
          </div>
          
          {siteStats.length > 0 ? (
            <div className="space-y-4">
              {siteStats.map(([site, count], index) => {
                const percentage = radios.length ? Math.round((count / radios.length) * 100) : 0;
                const colors = ['purple', 'blue', 'emerald', 'amber', 'red'];
                const color = colors[index % colors.length];
                
                return (
                  <div key={site} className="flex items-center space-x-4">
                    <div className={`w-10 h-10 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                      {count}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-900 font-mono">{site}</span>
                        <span className="text-sm text-slate-600 font-medium">{percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-600">No site code data available</p>
            </div>
          )}
        </div>

        {/* Growth Metrics */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-6 h-6 text-emerald-500" />
            <h3 className="text-xl font-bold text-slate-900">Growth Metrics</h3>
          </div>
          
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-emerald-600 mb-2">{recentStats.recent7Days}</div>
              <div className="text-sm text-slate-600 font-medium">Equipment added (7 days)</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">{recentStats.recent30Days}</div>
              <div className="text-sm text-slate-600 font-medium">Equipment added (30 days)</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">
                {Math.round((recentStats.recent30Days / Math.max(radios.length, 1)) * 100)}%
              </div>
              <div className="text-sm text-slate-600 font-medium">Growth rate (30 days)</div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
        <div className="flex items-center space-x-3 mb-6">
          <Zap className="w-6 h-6 text-amber-500" />
          <h3 className="text-xl font-bold text-slate-900">System Health</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Award className="w-10 h-10 text-white" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 mb-2">{assignmentStats.percentage}%</div>
            <div className="text-sm text-slate-600 font-medium">Equipment Utilization</div>
            <div className="text-xs text-slate-500 mt-1">
              {assignmentStats.assigned} of {radios.length} units assigned
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Target className="w-10 h-10 text-white" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {Math.round((statusStats.active / Math.max(radios.length, 1)) * 100)}%
            </div>
            <div className="text-sm text-slate-600 font-medium">Equipment Active</div>
            <div className="text-xs text-slate-500 mt-1">
              {statusStats.active} units operational
            </div>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">{modelStats.length}</div>
            <div className="text-sm text-slate-600 font-medium">Model Diversity</div>
            <div className="text-xs text-slate-500 mt-1">
              Different equipment models
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;