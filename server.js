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
mongoose.connect('mongodb+srv://parth111nagar_db_user:Parth6306@gdg-database.2gqibxi.mongodb.net/?retryWrites=true&w=majority&appName=gdg-database', {
  useNewUrlParser: true,
  useUnifiedTopology: true
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});