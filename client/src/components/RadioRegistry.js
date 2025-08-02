import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Save, 
  X, 
  AlertTriangle, 
  Clock,
  Radio,
  User,
  Building,
  MapPin,
  Settings,
  FileText,
  CheckCircle,
  Zap
} from 'lucide-react';

const RadioRegistry = () => {
  const [formData, setFormData] = useState({
    serial_number: '',
    model: '',
    version: '',
    user_name: '',
    department: '',
    location: '',
    site_code: '',
    shift: '',
    status: 'active',
    notes: '',
    operator_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [duplicateRadio, setDuplicateRadio] = useState(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [recentRadios, setRecentRadios] = useState([]);

  const departments = [
    'Operations', 'Maintenance', 'Safety', 'Security', 'Logistics', 
    'Administration', 'Emergency Response', 'Environmental'
  ];
  const shifts = ['Day Shift', 'Night Shift', 'Swing Shift', 'On-Call'];
  const statuses = ['Active', 'Maintenance', 'Offline', 'Reserved'];

  useEffect(() => {
    fetchRecentRadios();
    const savedOperator = localStorage.getItem('operatorName');
    if (savedOperator) {
      setFormData(prev => ({ ...prev, operator_name: savedOperator }));
    }
  }, []);

  const fetchRecentRadios = async () => {
    try {
      const response = await axios.get('/api/radios?limit=3');
      setRecentRadios(response.data.slice(0, 3));
    } catch (error) {
      console.error('Error fetching recent radios:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'operator_name' && value.trim()) {
      localStorage.setItem('operatorName', value.trim());
    }
  };

  const checkForDuplicate = async (serialNumber) => {
    if (!serialNumber) return false;
    try {
      const response = await axios.get(`/api/radios/serial/${serialNumber}`);
      if (response.data) {
        setDuplicateRadio(response.data);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  const handleSerialNumberBlur = async (e) => {
    const serialNumber = e.target.value.trim().toUpperCase();
    if (serialNumber && !editMode) {
      setFormData(prev => ({ ...prev, serial_number: serialNumber }));
      const isDuplicate = await checkForDuplicate(serialNumber);
      if (isDuplicate) {
        setShowDuplicateModal(true);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.serial_number.trim() || !formData.model.trim() || !formData.operator_name.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const submitData = { ...formData, serial_number: formData.serial_number.toUpperCase() };

      if (editMode && duplicateRadio) {
        await axios.put(`/api/radios/${duplicateRadio.id}`, submitData);
        toast.success('Radio updated successfully!');
      } else {
        await axios.post('/api/radios', submitData);
        toast.success('Radio registered successfully!');
      }

      // Reset form
      setFormData({
        serial_number: '',
        model: '',
        version: '',
        user_name: '',
        department: '',
        location: '',
        site_code: '',
        shift: '',
        status: 'active',
        notes: '',
        operator_name: formData.operator_name
      });
      
      setDuplicateRadio(null);
      setEditMode(false);
      setShowDuplicateModal(false);
      fetchRecentRadios();

    } catch (error) {
      if (error.response?.status === 409) {
        setDuplicateRadio(error.response.data.existingRadio);
        setShowDuplicateModal(true);
        toast.error('Radio already exists - update it instead?');
      } else {
        toast.error('Error saving radio');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateExisting = () => {
    if (duplicateRadio) {
      setFormData({
        serial_number: duplicateRadio.serial_number,
        model: duplicateRadio.model,
        version: duplicateRadio.version || '',
        user_name: duplicateRadio.user_name || '',
        department: duplicateRadio.department || '',
        location: duplicateRadio.location || '',
        site_code: duplicateRadio.site_code || '',
        shift: duplicateRadio.shift || '',
        status: duplicateRadio.status || 'active',
        notes: duplicateRadio.notes || '',
        operator_name: formData.operator_name
      });
      setEditMode(true);
      setShowDuplicateModal(false);
      toast.success('Loaded existing radio for editing');
    }
  };

  const handleCancel = () => {
    setFormData({
      serial_number: '',
      model: '',
      version: '',
      user_name: '',
      department: '',
      location: '',
      site_code: '',
      shift: '',
      status: 'active',
      notes: '',
      operator_name: formData.operator_name
    });
    setDuplicateRadio(null);
    setEditMode(false);
    setShowDuplicateModal(false);
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

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      {/* Main Registration Form */}
      <div className="xl:col-span-2">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Radio className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {editMode ? 'Update Equipment' : 'Register New Equipment'}
                </h2>
                <p className="text-slate-600 font-medium">
                  {editMode ? 'Modify equipment details' : 'Add communication equipment to the system'}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            {/* Operator Information */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex items-center space-x-3 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-900">Operator Information</h3>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="operator_name"
                  value={formData.operator_name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm transition-all font-medium"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            </div>

            {/* Equipment Details */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-100">
              <div className="flex items-center space-x-3 mb-6">
                <Radio className="w-5 h-5 text-emerald-600" />
                <h3 className="text-lg font-semibold text-slate-900">Equipment Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Serial Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="serial_number"
                    value={formData.serial_number}
                    onChange={handleInputChange}
                    onBlur={handleSerialNumberBlur}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all font-mono font-medium uppercase"
                    placeholder="e.g., MTR001"
                    required
                    disabled={editMode}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all font-medium"
                    placeholder="e.g., Motorola CP200"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Version</label>
                  <input
                    type="text"
                    name="version"
                    value={formData.version}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all font-medium"
                    placeholder="e.g., v2.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-sm transition-all font-medium"
                  >
                    {statuses.map(status => (
                      <option key={status} value={status.toLowerCase()}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Assignment Details */}
            <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6 border border-violet-100">
              <div className="flex items-center space-x-3 mb-6">
                <Building className="w-5 h-5 text-violet-600" />
                <h3 className="text-lg font-semibold text-slate-900">Assignment Details</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Assigned User</label>
                  <input
                    type="text"
                    name="user_name"
                    value={formData.user_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white shadow-sm transition-all font-medium"
                    placeholder="Employee name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white shadow-sm transition-all font-medium"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white shadow-sm transition-all font-medium"
                    placeholder="Building, area"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Site Code</label>
                  <input
                    type="text"
                    name="site_code"
                    value={formData.site_code}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white shadow-sm transition-all font-mono font-medium uppercase"
                    placeholder="MINE01"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Shift</label>
                  <select
                    name="shift"
                    value={formData.shift}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 bg-white shadow-sm transition-all font-medium"
                  >
                    <option value="">Select Shift</option>
                    {shifts.map(shift => (
                      <option key={shift} value={shift}>{shift}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
              <div className="flex items-center space-x-3 mb-4">
                <FileText className="w-5 h-5 text-amber-600" />
                <h3 className="text-lg font-semibold text-slate-900">Additional Notes</h3>
              </div>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white shadow-sm transition-all font-medium resize-none"
                placeholder="Additional information, maintenance notes, special instructions..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center transform hover-scale-102"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                ) : editMode ? (
                  <Save className="w-5 h-5 mr-3" />
                ) : (
                  <Plus className="w-5 h-5 mr-3" />
                )}
                {loading ? 'Processing...' : editMode ? 'Update Equipment' : 'Register Equipment'}
              </button>
              {editMode && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all duration-200 flex items-center shadow-sm hover:shadow-md"
                >
                  <X className="w-5 h-5 mr-3" />
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Sidebar */}
      <div className="xl:col-span-1 space-y-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-amber-500" />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full p-3 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 border border-emerald-200 rounded-xl text-left transition-all">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 text-emerald-600 mr-3" />
                <span className="font-medium text-slate-900">Bulk Import</span>
              </div>
              <p className="text-xs text-slate-600 ml-7">Import multiple radios</p>
            </button>
            <button className="w-full p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl text-left transition-all">
              <div className="flex items-center">
                <Settings className="w-4 h-4 text-blue-600 mr-3" />
                <span className="font-medium text-slate-900">Templates</span>
              </div>
              <p className="text-xs text-slate-600 ml-7">Use preset configurations</p>
            </button>
          </div>
        </div>

        {/* Recent Equipment */}
        {recentRadios.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-slate-500" />
              Recently Added
            </h3>
            <div className="space-y-3">
              {recentRadios.map((radio) => (
                <div key={radio.id} className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-mono font-bold text-slate-900">{radio.serial_number}</div>
                    <span className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold border ${getStatusColor(radio.status)}`}>
                      {radio.status || 'active'}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-slate-700 mb-1">{radio.model}</div>
                  {radio.user_name && (
                    <div className="text-xs text-slate-600 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      {radio.user_name}
                    </div>
                  )}
                  <div className="text-xs text-slate-500 mt-2">
                    {new Date(radio.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Duplicate Modal */}
      {showDuplicateModal && duplicateRadio && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 px-8 py-6">
              <div className="flex items-center text-white">
                <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center mr-4">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Equipment Already Exists</h3>
                  <p className="text-orange-100 font-mono font-semibold">{duplicateRadio.serial_number}</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 mb-6 border border-slate-200">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Model:</span>
                    <span className="font-bold text-slate-900">{duplicateRadio.model}</span>
                  </div>
                  {duplicateRadio.user_name && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">User:</span>
                      <span className="font-bold text-slate-900">{duplicateRadio.user_name}</span>
                    </div>
                  )}
                  {duplicateRadio.department && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600 font-medium">Department:</span>
                      <span className="font-bold text-slate-900">{duplicateRadio.department}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Status:</span>
                    <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-semibold border ${getStatusColor(duplicateRadio.status)}`}>
                      {duplicateRadio.status || 'active'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleUpdateExisting}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover-scale-102"
                >
                  Update This Equipment
                </button>
                <button
                  onClick={() => setShowDuplicateModal(false)}
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

export default RadioRegistry;