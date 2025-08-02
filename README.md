# 📻⛏️ Mining Radio Registry System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-18.2.0-blue)](https://reactjs.org/)

A modern, mobile-first web application designed specifically for mining operations to manage radio equipment inventory. Built with React and Node.js, featuring comprehensive tracking, audit trails, and professional reporting capabilities.

![Mining Radio Registry Screenshot](https://via.placeholder.com/800x400/ff6b35/ffffff?text=Mining+Radio+Registry+System)

## 🌟 Features

### 📱 **Mobile-First Design**
- **Touch-Optimized Interface** - Large buttons and touch-friendly navigation
- **Responsive Layout** - Perfect on any device from phone to desktop  
- **Bottom Navigation** - Easy thumb navigation on mobile devices
- **Offline-Ready** - Works reliably on mobile data connections

### ⛏️ **Mining-Specific Features**
- **Site Code Tracking** - Monitor equipment across different mining sites (MINE-A, PIT-01, etc.)
- **Shift Management** - Track radios by shift: Day, Night, Swing, On-Call
- **Equipment Status** - Active, Maintenance, Offline, Reserved status tracking
- **Department Organization** - Operations, Maintenance, Safety, Security, etc.
- **Professional Reporting** - Excel exports with mining-specific data

### 🔍 **Advanced Search & Management**
- **Global Search** - Find radios by serial, model, user, location, or site
- **Multi-Filter System** - Filter by department, model, version, status, shift, site code
- **Real-Time Results** - Instant search with live status counts
- **Visual Status Indicators** - Color-coded equipment status throughout
- **Grid/List Views** - Switch between card and detailed list layouts

### 📊 **Comprehensive Tracking**
- **Duplicate Prevention** - Automatic detection with modern popup interface
- **Operator Logging** - Track who makes every change for accountability
- **Complete Audit Trail** - Full history with timestamps and IP addresses
- **Change Tracking** - Detailed logs of what was modified

### 🛡️ **Security & Reliability**
- **Input Validation** - Comprehensive form validation and error handling
- **Rate Limiting** - API protection against abuse
- **SQL Injection Prevention** - Parameterized queries throughout
- **IP Address Logging** - Security audit trail for all operations

## 🏗️ Technical Architecture

### **Backend (Node.js/Express)**
- RESTful API with comprehensive endpoints
- SQLite database with structured schema
- Excel export with professional formatting
- Security middleware (Helmet, CORS, rate limiting)
- Comprehensive error handling and logging

### **Frontend (React 18)**
- Modern React with hooks and functional components
- Mobile-first responsive design with custom CSS utilities
- Real-time search and filtering capabilities
- Professional form handling with validation
- Modal-based workflows for better UX

### **Database Schema**
- **Radios Table**: Complete equipment tracking with mining-specific fields
- **Logs Table**: Full audit trail with operator identification
- **Automatic Timestamps**: Created/updated tracking for all records

## ⚡ Super Quick Start

**Just want to see it running?**

```bash
git clone https://github.com/yourusername/commlink-pro.git
cd commlink-pro
npm run setup
npm run demo
npm run dev
```

Then open `http://localhost:3000` in your browser! 🎉

### 🔧 If you get "npm is not recognized" error:

**Windows:**
1. Download and install Node.js from https://nodejs.org/
2. Restart your command prompt/PowerShell
3. Try again: `npm --version` should show a version number

**Alternative Windows method:**
```powershell
# Using PowerShell as Administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
# Then download and install Node.js from the official website
```

---

## 🚀 Detailed Setup

### Prerequisites
- Node.js 14+ installed
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mining-radio-registry.git
   cd mining-radio-registry
   ```

2. **Run the automated installer**
   ```bash
   npm run setup
   ```
   This command will:
   - Install all backend dependencies
   - Install all frontend dependencies  
   - Set up the project structure
   - Verify Node.js compatibility

3. **Start the development servers**
   ```bash
   npm run dev
   ```
   This will start both:
   - Backend server on `http://localhost:5000`
   - Frontend development server on `http://localhost:3000`

4. **Add demo data** (recommended for testing)
   ```bash
   npm run demo
   ```
   This adds 12 sample mining radios with realistic data including:
   - Various radio models (Motorola, Kenwood, Hytera, Icom)
   - Different departments (Security, Operations, Maintenance, etc.)
   - Multiple shifts and site codes
   - Realistic assignments and status values

5. **Access the application**
   - **Main App**: `http://localhost:3000`
   - **API Endpoints**: `http://localhost:5000/api`

### Alternative Setup (Manual)

If the automated installer doesn't work:

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..

# Start development
npm run dev
```

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 📖 Usage Guide

### 🔧 **Adding New Radios**

1. **Navigate to "Add Radio"** tab
2. **Enter your name** (required for logging)
3. **Fill in radio details**:
   - Serial Number (required, unique)
   - Model (required)
   - Version/Firmware
   - Equipment Status
4. **Assignment Information**:
   - Assigned User
   - Department
   - Shift
   - Location
   - Site Code
5. **Add notes** if needed
6. **Click "Register Radio"**

### 🔍 **Searching Radios**

1. **Use the global search** bar for quick lookups
2. **Apply filters** for specific criteria:
   - Department, Model, Version
   - Status, Shift, Site Code
3. **View results** in grid or list format
4. **Click "Details"** for complete radio information
5. **Export results** to Excel for reporting

### 📊 **Managing Equipment**

- **Status Updates**: Change equipment status as needed
- **Assignment Changes**: Update user assignments and locations
- **Notes**: Add maintenance notes or special configurations
- **Duplicate Handling**: System automatically detects duplicates and offers update option

### 📈 **Reports & Analytics**

- **Dashboard Statistics**: Live counts by status and department
- **Activity Logs**: Complete audit trail of all changes
- **Excel Export**: Professional reports with all data fields
- **Search Results**: Export filtered results for specific needs

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
NODE_ENV=production
DATABASE_PATH=./radio_registry.db
```

### Database Configuration

The system uses SQLite by default. For production with larger datasets, consider migrating to PostgreSQL:

```javascript
// Update server.js connection settings
const dbConfig = {
  client: 'postgresql',
  connection: {
    host: 'localhost',
    user: 'username',
    password: 'password',
    database: 'radio_registry'
  }
};
```

## 📋 API Documentation

### Radio Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/radios` | List all radios with optional filtering |
| GET | `/api/radios/serial/:id` | Check for duplicate by serial number |
| POST | `/api/radios` | Add new radio |
| PUT | `/api/radios/:id` | Update existing radio |
| DELETE | `/api/radios/:id` | Delete radio (requires operator name) |

### Utility Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/export` | Export all radios to Excel |
| GET | `/api/logs` | Get activity logs |
| GET | `/api/stats` | Get system statistics |

### Example API Usage

```javascript
// Add a new radio
const response = await fetch('/api/radios', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    serial_number: 'MTR001',
    model: 'Motorola CP200',
    version: 'v2.1',
    user_name: 'John Smith',
    department: 'Security',
    location: 'Main Gate',
    site_code: 'MINE-A',
    shift: 'Day Shift',
    status: 'active',
    operator_name: 'System Admin',
    notes: 'Primary security radio'
  })
});
```

## 🔒 Security Features

### Input Validation
- All form inputs validated on both client and server
- SQL injection prevention through parameterized queries
- XSS protection with input sanitization

### Access Control
- Rate limiting on all API endpoints
- IP address logging for audit trails
- Operator identification required for all changes

### Data Protection
- Helmet.js security headers
- CORS configuration for cross-origin requests
- Secure cookie handling in production

## 🛠️ Development

### Project Structure

```
mining-radio-registry/
├── client/                 # React frontend
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/         # Utility functions
│   │   └── App.js         # Main application
├── server.js              # Express backend
├── demo-data.js          # Demo data generator
├── setup.js              # Installation script
└── package.json          # Dependencies and scripts
```

### Available Scripts

```bash
npm run dev         # Start development servers
npm run start       # Start production server
npm run build       # Build for production
npm run setup       # Install all dependencies
npm run demo        # Add demo data
npm run reset       # Reset database
```

### Adding New Features

1. **Backend Changes**: Update `server.js` with new API endpoints
2. **Database Schema**: Modify table creation in `initializeDatabase()`
3. **Frontend Components**: Add new React components in `client/src/components/`
4. **Styling**: Update `client/src/App.css` for new styles

## 🐛 Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Change port in package.json or set environment variable
PORT=3001 npm run dev
```

**Database Errors**
```bash
# Reset database and restart
npm run reset
npm run dev
```

**Build Errors**
```bash
# Clear dependencies and reinstall
rm -rf node_modules client/node_modules
npm run setup
```

### Debug Mode

Enable detailed logging:
```bash
DEBUG=* npm run dev
```

## 📞 Support

For technical support or feature requests:

1. **Check the troubleshooting section** above
2. **Review closed issues** in the GitHub repository
3. **Create a new issue** with detailed information:
   - Operating system and browser
   - Node.js version
   - Error messages and logs
   - Steps to reproduce

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit your changes** (`git commit -m 'Add amazing feature'`)
4. **Push to the branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style and formatting
- Add tests for new features
- Update documentation for API changes
- Ensure mobile responsiveness for UI changes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🏆 Acknowledgments

- **React Community** - For the excellent frontend framework
- **Express.js Team** - For the robust backend framework
- **SQLite** - For the reliable embedded database
- **Lucide React** - For the beautiful icon set
- **Mining Industry** - For inspiration and requirements

---

**Mining Radio Registry System** - Professional Equipment Management for Mining Operations

Made with ❤️ for the mining industry