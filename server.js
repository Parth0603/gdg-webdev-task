require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const json2csv = require('json2csv');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
if (!process.env.MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is not set');
}

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err);
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.log('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// Registration Schema
const registrationSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3 },
  gender: { type: String, required: true, enum: ['Male', 'Female', 'Other'] },
  email: { type: String, required: true, unique: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
  phone: { type: String, required: true, match: /^\d{10}$/ },
  enrollment: { type: String, required: true, minlength: 8 },
  college: { type: String, required: true },
  otherCollege: { type: String },
  year: { type: String, required: true, enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate'] },
  branch: { type: String, required: true, enum: ['CSE', 'IT', 'ECE', 'EE', 'ME', 'CE', 'Other'] },
  experience: { type: String, required: true, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  interests: [{ type: String }],
  expectations: { type: String },
  registeredAt: { type: Date, default: Date.now }
});

const Registration = mongoose.model('Registration', registrationSchema);

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/registered', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'registered.html'));
});

// Registration endpoint
app.post('/register', async (req, res) => {
  console.log('Registration attempt:', req.body);
  
  if (mongoose.connection.readyState !== 1) {
    return res.status(500).json({ error: 'Database connection not ready' });
  }
  
  try {
    const { 
      name, gender, email, phone, enrollment, college, otherCollege,
      year, branch, experience, interests, expectations
    } = req.body;
    
    // Server-side validation
    if (!name || name.length < 3) {
      return res.status(400).json({ error: 'Name must be at least 3 characters' });
    }
    if (!gender) {
      return res.status(400).json({ error: 'Gender is required' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone must be exactly 10 digits' });
    }
    if (!enrollment || enrollment.length < 8) {
      return res.status(400).json({ error: 'Enrollment number must be at least 8 characters' });
    }
    if (!college) {
      return res.status(400).json({ error: 'College is required' });
    }
    if (college === 'Other' && (!otherCollege || otherCollege.length < 3)) {
      return res.status(400).json({ error: 'Please specify your college name' });
    }
    if (!experience) {
      return res.status(400).json({ error: 'Programming experience is required' });
    }

    // Check for duplicate enrollment number
    const existingEnrollment = await Registration.findOne({ enrollment });
    if (existingEnrollment) {
      return res.status(400).json({ error: 'Enrollment number already registered' });
    }

    const registrationData = {
      name, gender, email, phone, enrollment, college,
      year, branch, experience, interests: interests || [],
      expectations: expectations || ''
    };
    
    if (college === 'Other') {
      registrationData.otherCollege = otherCollege;
    }

    const registration = new Registration(registrationData);
    await registration.save();
    
    res.json({ success: true, message: 'Registration successful!' });
  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      if (error.keyPattern.email) {
        res.status(400).json({ error: 'Email already registered' });
      } else if (error.keyPattern.enrollment) {
        res.status(400).json({ error: 'Enrollment number already registered' });
      } else {
        res.status(400).json({ error: 'Duplicate entry found' });
      }
    } else {
      res.status(500).json({ error: 'Registration failed' });
    }
  }
});

app.get('/api/registrations', async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ registeredAt: -1 });
    res.json(registrations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

app.get('/api/export', async (req, res) => {
  try {
    const registrations = await Registration.find().select('-_id -__v');
    const fields = [
      'name', 'gender', 'email', 'phone', 'enrollment', 'college', 'otherCollege',
      'year', 'branch', 'experience', 'interests', 'expectations', 'registeredAt'
    ];
    const csv = json2csv.parse(registrations, { fields });
    
    res.header('Content-Type', 'text/csv');
    res.attachment('gdg-aitr-registrations.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

app.delete('/api/clear-data', async (req, res) => {
  try {
    const result = await Registration.deleteMany({});
    console.log(`🗑️ Admin cleared all data: ${result.deletedCount} registrations deleted`);
    res.json({ 
      success: true, 
      message: `Successfully deleted ${result.deletedCount} registrations` 
    });
  } catch (error) {
    console.error('Clear data error:', error);
    res.status(500).json({ error: 'Failed to clear data' });
  }
});

app.delete('/api/delete-user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedUser = await Registration.findByIdAndDelete(id);
    
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`🗑️ Admin deleted user: ${deletedUser.name} (${deletedUser.email})`);
    res.json({ 
      success: true, 
      message: `Successfully deleted ${deletedUser.name}` 
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Keep-alive endpoint
app.get('/api/ping', (req, res) => {
  res.json({ status: 'alive', timestamp: new Date().toISOString() });
});

// Self-ping to prevent sleeping (only in production)
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    fetch(`${process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000'}/api/ping`)
      .catch(() => {}); // Ignore errors
  }, 14 * 60 * 1000); // Ping every 14 minutes
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});