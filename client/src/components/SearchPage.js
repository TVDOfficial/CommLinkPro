import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Search, 
  Download, 
  Eye, 
  Trash2, 
  RefreshCw, 
  X,
  Filter,
  Radio,
  Building,
  MapPin,
  User,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  FileText
} from 'lucide-react';

const SearchPage = () => {
  const [radios, setRadios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRadio, setSelectedRadio] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [operatorName, setOperatorName] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    department: '',
    status: '',
    shift: ''
  });

  useEffect(() => {
    fetchRadios();
    const savedOperator = localStorage.getItem('operatorName');
    if (savedOperator) {
      setOperatorName(savedOperator);
    }
  }, []);

  const fetchRadios = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/radios');
      setRadios(response.data);
    } catch (error) {
      toast.error('Error loading equipment');
    } finally {
      setLoading(false);
    }
  };

  const filteredRadios = radios.filter(radio => {
    // Text search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesSearch = (
        radio.serial_number.toLowerCase().includes(term) ||
        (radio.radio_id && radio.radio_id.toLowerCase().includes(term)) ||
        radio.model.toLowerCase().includes(term) ||
        (radio.user_name && radio.user_name.toLowerCase().includes(term)) ||
        (radio.department && radio.department.toLowerCase().includes(term)) ||
        (radio.location && radio.location.toLowerCase().includes(term))
      );
      if (!matchesSearch) return false;
    }

    // Filter by department
    if (filters.department && radio.department !== filters.department) return false;
    
    // Filter by status
    if (filters.status && radio.status !== filters.status) return false;
    
    // Filter by shift
    if (filters.shift && radio.shift !== filters.shift) return false;

    return true;
  });

  const exportToExcel = async () => {
    try {
      const response = await axios.get('/api/export', { responseType: 'blob' });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `commlink_equipment_${timestamp}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Export completed successfully!');
    } catch (error) {
      toast.error('Export failed');
    }
  };

  const handleDelete = async (radioId) => {
    if (!operatorName.trim()) {
      toast.error('Please enter your name first');
      return;
    }

    try {
      await axios.delete(`/api/radios/${radioId}`, {
        data: { operator_name: operatorName }
      });
      toast.success('Equipment deleted successfully');
      fetchRadios();
      setDeleteConfirm(null);
    } catch (error) {
      toast.error('Delete operation failed');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'maintenance': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'offline': return 'bg-red-100 text-red-700 border-red-200';
      case 'reserved': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle className="w-3 h-3" />;
      case 'maintenance': return <Settings className="w-3 h-3" />;
      case 'offline': return <AlertTriangle className="w-3 h-3" />;
      case 'reserved': return <Clock className="w-3 h-3" />;
      default: return <CheckCircle className="w-3 h-3" />;
    }
  };

  // Get unique values for filters
  const departments = [...new Set(radios.map(r => r.department).filter(Boolean))];
  const statuses = [...new Set(radios.map(r => r.status).filter(Boolean))];
  const shifts = [...new Set(radios.map(r => r.shift).filter(Boolean))];

  const activeFiltersCount = Object.values(filters).filter(Boolean).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3" />
        <span className="text-slate-600 font-medium">Loading equipment...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Search className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Equipment Search</h2>
              <p className="text-slate-600 font-medium">Find and manage communication equipment</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-half transform -translate-y-half w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by serial number, radio ID, model, user, department, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all font-medium text-lg"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-half transform -translate-y-half text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  showFilters || activeFiltersCount > 0
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-white bg-opacity-20 text-xs px-2 py-1 rounded-full font-bold">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <div className="text-slate-600 font-medium">
                <span className="text-xl font-bold text-slate-900">{filteredRadios.length}</span> of {radios.length} equipment
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchRadios}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={exportToExcel}
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                <Download className="w-4 h-4" />
                <span>Export Excel</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Advanced Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all font-medium"
                  >
                    <option value="">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all font-medium"
                  >
                    <option value="">All Statuses</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Shift</label>
                  <select
                    value={filters.shift}
                    onChange={(e) => setFilters(prev => ({ ...prev, shift: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all font-medium"
                  >
                    <option value="">All Shifts</option>
                    {shifts.map(shift => (
                      <option key={shift} value={shift}>{shift}</option>
                    ))}
                  </select>
                </div>

              </div>
              {activeFiltersCount > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => setFilters({ department: '', status: '', shift: '' })}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {filteredRadios.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-16 text-center">
          <Search className="w-20 h-20 text-slate-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            {radios.length === 0 ? 'No Equipment Found' : 'No Matching Equipment'}
          </h3>
          <p className="text-slate-600 text-lg">
            {radios.length === 0 
              ? 'No communication equipment has been registered yet.' 
              : 'Try adjusting your search terms or filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="divide-y divide-slate-200">
            {filteredRadios.map((radio) => (
              <div key={radio.id} className="p-6 hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                        <Radio className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 font-mono">
                          {radio.serial_number}
                        </h3>
                        <p className="text-slate-600 font-medium">{radio.model}</p>
                      </div>
                      <span className={`inline-flex items-center space-x-1 px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusColor(radio.status)}`}>
                        {getStatusIcon(radio.status)}
                        <span>{radio.status || 'active'}</span>
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {radio.user_name && (
                        <div className="flex items-center space-x-2 text-slate-600">
                          <User className="w-4 h-4" />
                          <span><strong>User:</strong> {radio.user_name}</span>
                        </div>
                      )}
                      {radio.department && (
                        <div className="flex items-center space-x-2 text-slate-600">
                          <Building className="w-4 h-4" />
                          <span><strong>Dept:</strong> {radio.department}</span>
                        </div>
                      )}
                      {radio.location && (
                        <div className="flex items-center space-x-2 text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span><strong>Location:</strong> {radio.location}</span>
                        </div>
                      )}
                      {radio.radio_id && (
                        <div className="flex items-center space-x-2 text-slate-600">
                          <Radio className="w-4 h-4" />
                          <span><strong>Radio ID:</strong> {radio.radio_id}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3 text-xs text-slate-400 flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      Added: {new Date(radio.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-6">
                    <button
                      onClick={() => {
                        setSelectedRadio(radio);
                        setShowDetailsModal(true);
                      }}
                      className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      title="View Details"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(radio)}
                      className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                      title="Delete Equipment"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Details Modal */}
      {showDetailsModal && selectedRadio && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-96 overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
              <div className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <Radio className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Equipment Details</h3>
                    <p className="text-blue-100 font-mono font-semibold">{selectedRadio.serial_number}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-1">Model</label>
                  <p className="text-lg font-bold text-slate-900">{selectedRadio.model}</p>
                </div>
                {selectedRadio.version && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-1">Version</label>
                    <p className="text-lg font-bold text-slate-900">{selectedRadio.version}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-1">Status</label>
                  <span className={`inline-flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(selectedRadio.status)}`}>
                    {getStatusIcon(selectedRadio.status)}
                    <span>{selectedRadio.status || 'active'}</span>
                  </span>
                </div>
                {selectedRadio.user_name && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-1">Assigned User</label>
                    <p className="text-lg font-bold text-slate-900">{selectedRadio.user_name}</p>
                  </div>
                )}
                {selectedRadio.department && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-1">Department</label>
                    <p className="text-lg font-bold text-slate-900">{selectedRadio.department}</p>
                  </div>
                )}
                {selectedRadio.location && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-1">Location</label>
                    <p className="text-lg font-bold text-slate-900">{selectedRadio.location}</p>
                  </div>
                )}
                              {selectedRadio.radio_id && (
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-1">Radio ID</label>
                  <p className="text-lg font-bold text-slate-900 font-mono">{selectedRadio.radio_id}</p>
                </div>
              )}
                {selectedRadio.shift && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-500 mb-1">Shift</label>
                    <p className="text-lg font-bold text-slate-900">{selectedRadio.shift}</p>
                  </div>
                )}
              </div>
              
              {selectedRadio.notes && (
                <div>
                  <label className="block text-sm font-semibold text-slate-500 mb-2">Notes</label>
                  <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-xl border border-slate-200">
                    <p className="text-slate-900">{selectedRadio.notes}</p>
                  </div>
                </div>
              )}
              
              <div className="pt-6 border-t border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                  <div>
                    <span className="font-semibold">Created:</span> {new Date(selectedRadio.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-semibold">Updated:</span> {new Date(selectedRadio.updated_at).toLocaleString()}
                  </div>
                  {selectedRadio.operator_name && (
                    <div className="md:col-span-2">
                      <span className="font-semibold">Last updated by:</span> {selectedRadio.operator_name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
              <div className="flex items-center text-white">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Delete Equipment</h3>
                  <p className="text-red-100 font-mono font-semibold">{deleteConfirm.serial_number}</p>
                </div>
              </div>
            </div>
            
            <div className="p-8">
              <p className="text-slate-600 mb-6 text-lg">
                Are you sure you want to delete this equipment? This action cannot be undone.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={operatorName}
                  onChange={(e) => {
                    setOperatorName(e.target.value);
                    localStorage.setItem('operatorName', e.target.value);
                  }}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm transition-all font-medium"
                  placeholder="Enter your name for audit log"
                />
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  disabled={!operatorName.trim()}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Delete Equipment
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="w-full px-6 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;