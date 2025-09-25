# GDG AITR Event Registration System

A full-stack event registration system for GDG AITR club activities with student registration forms and admin management dashboard.

## Features

- **Student Registration**: Comprehensive form with validation for personal and academic details
- **Admin Dashboard**: Password-protected access to view and export registration data
- **Data Export**: CSV export functionality for analysis
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Validation**: Client-side form validation with error handling

## Quick Start

1. **Install Dependencies**: `npm install`
2. **Start MongoDB**: Ensure MongoDB is running on localhost:27017
3. **Run Application**: `npm start`
4. **Access System**: http://localhost:3000

## Admin Access
- URL: http://localhost:3000/admin
- Password: `gdg-admin`

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js + Express
- **Database**: MongoDB + Mongoose
- **Styling**: Custom CSS with GDG branding

## API Endpoints

- `POST /register` - Submit registration
- `GET /api/registrations` - Get all registrations
- `GET /api/export` - Download CSV export
- `GET /` - Registration form
- `GET /admin` - Admin dashboard
- `GET /registered` - Success page

## Database Schema

Registration fields: name, gender, email, phone, enrollment, college, year, branch, experience, interests, expectations, registeredAt

## Project Structure

```
gdg-aitr-registration/
├── server.js                 # Express server and API routes
├── package.json             # Project dependencies and scripts
├── package-lock.json        # Dependency lock file
├── README.md               # Project documentation
├── start.bat               # Windows startup script
└── public/                 # Frontend static files
    ├── index.html          # Main registration form
    ├── admin.html          # Admin dashboard interface
    ├── registered.html     # Registration success page
    ├── register-admin.html # Admin registration page
    ├── images.png          # GDG AITR logo
    ├── style.css           # Main stylesheet
    ├── admin-styles.css    # Admin-specific styles
    ├── script.js           # Registration form logic
    └── admin.js            # Admin dashboard functionality
```

## Troubleshooting

- **MongoDB Error**: Ensure MongoDB is running on port 27017
- **Port in Use**: Change port in server.js or stop conflicting services
- **Admin Access**: Use exact password 'gdg-admin'

Built for GDG AITR club event management.