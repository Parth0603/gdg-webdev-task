# GDG AITR Event Registration System

A modern full-stack event registration platform for GDG AITR with comprehensive admin management and dynamic event handling.

## ✨ Key Features

### 🎯 Core Functionality
- **Dynamic Event Management**: Admin can create, edit, and delete events with details
- **Smart Registration**: Form adapts to current event with automatic event linking
- **Registration Control**: Start/stop registration with admin toggle
- **Mobile-First Design**: Fully responsive across all devices
- **Dark Mode**: Toggle dark/light theme (except event page)

### 👨‍💼 Admin Dashboard
- **Modern Tabbed Interface**: Overview, Events, Registrations, Settings
- **Real-time Statistics**: Live registration counts and event info
- **Data Management**: Export CSV, delete users, clear all data
- **Event Showcase**: Beautiful event display with management controls

### 📱 User Experience
- **Event Details Page**: Dedicated page showcasing event information
- **Registration Status**: Shows if registration is open/closed
- **Form Validation**: Real-time validation with error handling
- **Success Confirmation**: Registration confirmation with event details

## 🚀 Quick Access

- **🎪 Event Details**: `/event` - View current event information
- **📝 Registration**: `/` - Register for events
- **👨‍💼 Admin Panel**: `/admin` - Manage events and registrations
- **🔑 Admin Password**: `gdg-admin`

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Styling**: Custom CSS  

## 🔌 API Endpoints

### Registration
- `POST /register` - Submit registration
- `GET /api/registration-status` - Check if registration is open
- `POST /api/toggle-registration` - Start/stop registration (admin)

### Event Management
- `GET /api/current-event` - Get current event details
- `POST /api/save-event` - Create/update event (admin)
- `DELETE /api/delete-event` - Delete current event (admin)

### Data Management
- `GET /api/registrations` - Get all registrations
- `GET /api/export` - Download CSV export
- `DELETE /api/clear-data` - Clear all data (admin)
- `DELETE /api/delete-user/:id` - Delete specific user (admin)

## 🗄️ Database Schema

### Registration Collection
`name, gender, email, phone, enrollment, college, year, branch, experience, interests, expectations, eventName, registeredAt`

### Event Collection
`title, description, date, location, createdAt, updatedAt`

### Registration Status Collection
`isOpen, updatedAt`

## 📁 Project Structure

```
gdg-aitr-registration/
├── server.js                 # Express server + API routes
├── package.json             # Dependencies & scripts
└── public/                 # Frontend files
    ├── index.html          # Registration form
    ├── event.html          # Event details page
    ├── admin.html          # Modern admin dashboard
    ├── registered.html     # Success page
    ├── register-admin.html # Admin registration
    ├── favicon.png         # Site favicon
    ├── images.png          # GDG logo
    ├── style.css           # Main styles + responsive
    ├── admin-styles.css    # Admin dashboard styles
    ├── script.js           # Registration logic
    └── admin.js            # Admin functionality
```

## 🌟 Recent Updates

- **🎨 Modern Admin UI**: Redesigned with tabbed interface and better UX
- **📱 Mobile Optimization**: Enhanced responsive design for all screen sizes
- **🎪 Event Management**: Complete event lifecycle management
- **🌙 Dark Mode**: Theme toggle with localStorage persistence
- **📊 Dashboard Analytics**: Real-time stats and event information
- **🔄 Registration Control**: Dynamic start/stop functionality

## 🚀 Deployment

- **☁️ Cloud Hosted**: Deployed with MongoDB Atlas
- **🔄 Auto Keep-Alive**: Prevents service sleeping
- **🔒 Secure**: Environment variables for database connection
- **📱 PWA Ready**: Optimized for mobile and desktop

---
*Built for GDG AITR Web Development Task*