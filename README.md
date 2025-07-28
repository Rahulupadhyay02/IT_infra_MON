# IT Infrastructure Monitoring System

A comprehensive React-based web application for real-time IT infrastructure monitoring, system health tracking, and automated task management.

## 🚀 Features

### Core Monitoring
- **Real-time System Metrics**: CPU, Memory, Disk, and Network monitoring
- **Server Health Tracking**: Comprehensive server information and status monitoring
- **Process Management**: Monitor running processes and system services
- **Network Analytics**: Connection tracking, port monitoring, and DNS analysis
- **Storage Monitoring**: Disk usage, SMART status, and backup monitoring

### Dashboard & Analytics
- **Interactive Dashboards**: Real-time metrics visualization with charts
- **System Health Overview**: Status indicators for all system components
- **Performance Analytics**: Historical data tracking and trend analysis
- **Custom Reports**: PDF generation with detailed system reports

### IT Management
- **Ticket Management**: IT support ticket creation and tracking
- **Asset Inventory**: Comprehensive asset tracking and management
- **Automation Tasks**: Automated task scheduling and execution
- **Patch Management**: System update and patch tracking
- **Scheduled Jobs**: Cron job monitoring and management

### Security & Compliance
- **Security Diagnostics**: System security assessment and monitoring
- **Firewall Status**: Network security monitoring
- **CloudWatch Integration**: AWS CloudWatch metrics integration
- **Load Balancer Monitoring**: Load balancer health and performance

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive UI
- **Recharts** for data visualization
- **React Router** for navigation
- **Firebase** for authentication and real-time data

### Backend
- **Python Flask** API server
- **psutil** for system metrics collection
- **WMI** for Windows system information
- **Firebase Admin SDK** for data storage

### Key Libraries
- **lucide-react**: Modern icon library
- **lottie-react**: Animation support
- **fuse.js**: Fuzzy search functionality
- **html2canvas & jsPDF**: Report generation
- **date-fns**: Date manipulation

## 📁 Project Structure

```
IT_infra_MON/
├── src/
│   ├── components/
│   │   ├── Charts/           # Data visualization components
│   │   ├── Dashboard/        # Dashboard UI components
│   │   ├── Monitoring/       # System monitoring components
│   │   ├── Pages/           # Application pages
│   │   ├── Header/          # Navigation headers
│   │   ├── Sidebar/         # Sidebar navigation
│   │   └── Footer/          # Footer components
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript type definitions
│   ├── config/              # Configuration files
│   └── assets/              # Static assets (images, videos, animations)
├── agent.py                 # Flask API server for system monitoring
├── monitor_fetcher.py       # Data collection and Firebase integration
└── package.json             # Frontend dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Firebase project setup
- Windows system (for WMI monitoring)

### Installation

1. **Clone the repository**
   ```bash
   git clone <https://github.com/Rahulupadhyay02/IT_infra_MON.git>
   cd IT_infra_MON
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install Python dependencies**
   ```bash
   pip install flask flask-cors psutil wmi firebase-admin requests
   ```

4. **Configure Firebase**
   - Download your Firebase service account key
   - Update the path in `monitor_fetcher.py`
   - Configure Firebase config in `src/config/firebase.ts`

### Running the Application

1. **Start the Flask API server**
   ```bash
   python agent.py
   ```

2. **Start the data collection service**
   ```bash
   python monitor_fetcher.py
   ```

3. **Start the React development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: `http://localhost:3000`
   - API: `http://localhost:5000`

## 📊 Monitoring Features

### System Metrics
- **CPU Monitoring**: Per-core usage, temperature, load averages
- **Memory Tracking**: Physical and virtual memory usage
- **Disk Analytics**: Storage usage, IOPS, SMART status
- **Network Monitoring**: Bandwidth, connections, DNS performance

### Real-time Data
- **Live Updates**: 30-second refresh intervals
- **Historical Data**: Firebase-based data persistence
- **Alert System**: Threshold-based notifications
- **Performance Trends**: Long-term metric analysis

### Security Features
- **Authentication**: Firebase-based user authentication
- **Authorization**: Role-based access control
- **Audit Logging**: System access and change tracking
- **Security Scanning**: Automated security diagnostics

## 🎨 UI/UX Features

### Modern Interface
- **Responsive Design**: Works on desktop and mobile devices
- **Dark/Light Themes**: Customizable appearance
- **Interactive Charts**: Real-time data visualization
- **Smooth Animations**: Lottie animations and transitions

### User Experience
- **Intuitive Navigation**: Sidebar and tab-based navigation
- **Search Functionality**: Global search across all data
- **Quick Actions**: One-click access to common tasks
- **Status Indicators**: Visual health status for all systems

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Firebase Setup
1. Create a Firebase project
2. Enable Authentication and Realtime Database
3. Download service account key
4. Update configuration files

## 📈 Performance

### Optimization Features
- **Lazy Loading**: Code splitting for better performance
- **Caching**: Firebase caching for faster data access
- **Compression**: Optimized bundle sizes
- **CDN Ready**: Static asset optimization

### Monitoring Capabilities
- **Real-time Metrics**: Sub-second response times
- **Scalable Architecture**: Handles multiple servers
- **Data Retention**: Configurable data retention policies
- **Export Capabilities**: PDF and CSV report generation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation in the `/docs` folder

## 🔄 Version History

- **v1.0.0**: Initial release with core monitoring features
- Real-time system monitoring
- Dashboard and analytics
- IT management tools
- Security diagnostics

---

**Note**: This application is designed for Windows systems and requires appropriate permissions for system monitoring. Ensure you have the necessary administrative privileges for full functionality.
