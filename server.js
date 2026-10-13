// Import the necessary packages
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

// Twilio for SMS/WhatsApp (Free tier available)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

const client = require('twilio')(accountSid, authToken);

const twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
  },
  maxHttpBufferSize: 1e8, // 100 MB, to handle video files
});

const port = 3000;

// Set up Multer for file uploads (audio and video)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for video files
  }
});

// Store alert data and emergency contacts
const alerts = [];
const emergencyContacts = [
  { name: 'Emergency Contact 1', phone: '+919480486500', method: 'sms' },
  { name: 'Emergency Contact 2', phone: '+919480486500', method: 'sms' }
  // All contacts will receive SMS alerts (free tier)
];

// Function to send SMS alert
async function sendSMSAlert(contact, alertData) {
  try {
    const message = `🚨 PULSESAFE EMERGENCY ALERT 🚨\n\n${alertData.name || 'Someone'} needs help!\n\n📍 Location: ${alertData.latitude}, ${alertData.longitude}\n🕐 Time: ${alertData.formattedTimestamp}\n🗺️ View on map: ${alertData.osmUrl}\n\n📹 Media available at: http://localhost:${port}/dashboard\n\nPlease check on them immediately!`;
    
    await twilioClient.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: contact.phone
    });
    
    console.log(`SMS sent to ${contact.name} at ${contact.phone}`);
    return true;
  } catch (error) {
    console.error(`Failed to send SMS to ${contact.name}:`, error.message);
    return false;
  }
}

// Function to send WhatsApp alert
async function sendWhatsAppAlert(contact, alertData) {
  try {
    const message = `🚨 *PULSESAFE EMERGENCY ALERT* 🚨\n\n${alertData.name || 'Someone'} needs help!\n\n📍 *Location:* ${alertData.latitude}, ${alertData.longitude}\n🕐 *Time:* ${alertData.formattedTimestamp}\n🗺️ *View on map:* ${alertData.osmUrl}\n\n📹 *Media available at:* http://localhost:${port}/dashboard\n\nPlease check on them immediately!`;
    
    await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${contact.phone}`
    });
    
    console.log(`WhatsApp sent to ${contact.name} at ${contact.phone}`);
    return true;
  } catch (error) {
    console.error(`Failed to send WhatsApp to ${contact.name}:`, error.message);
    console.log('Note: WhatsApp requires Twilio WhatsApp Business API setup. Falling back to SMS.');
    
    // Fallback to SMS if WhatsApp fails
    try {
      await sendSMSAlert(contact, alertData);
      console.log(`Fallback SMS sent to ${contact.name}`);
      return true;
    } catch (smsError) {
      console.error(`Fallback SMS also failed:`, smsError.message);
      return false;
    }
  }
}

// Function to send alerts to all emergency contacts (SMS-only)
async function sendEmergencyAlerts(alertData) {
  console.log('Sending emergency SMS alerts to contacts...');
  
  const sendPromises = emergencyContacts.map(async (contact) => {
    // Always use SMS for free tier
    return await sendSMSAlert(contact, alertData);
  });
  
  const results = await Promise.allSettled(sendPromises);
  const successful = results.filter(r => r.value).length;
  const failed = results.length - successful;
  
  console.log(`SMS alert sending complete: ${successful} successful, ${failed} failed`);
  return { successful, failed };
}

// Serve uploaded files statically from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Serve the dashboard HTML file
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// API endpoint to add/update emergency contacts
app.post('/contacts', express.json(), (req, res) => {
  try {
    const { contacts } = req.body;
    if (Array.isArray(contacts)) {
      emergencyContacts.length = 0; // Clear existing contacts
      emergencyContacts.push(...contacts);
      console.log('Emergency contacts updated:', emergencyContacts);
      res.status(200).send({ message: 'Contacts updated successfully', contacts: emergencyContacts });
    } else {
      res.status(400).send({ error: 'Invalid contacts format' });
    }
  } catch (error) {
    console.error('Error updating contacts:', error);
    res.status(500).send({ error: 'Failed to update contacts' });
  }
});

// API endpoint to get current emergency contacts
app.get('/contacts', (req, res) => {
  res.status(200).send({ contacts: emergencyContacts });
});

// Route to handle the alert from the app (POST request)
app.post('/alert', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
  console.log('Received new alert!');

  const { latitude, longitude, timestamp, name } = req.body;

  const formattedTimestamp = moment(timestamp).tz('Asia/Kolkata').format('MMMM Do YYYY, h:mm:ss a z');
  const osmUrl = `http://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;

  const newAlert = {
    latitude,
    longitude,
    timestamp,
    name,
    formattedTimestamp,
    osmUrl,
    videoUrl: req.files && req.files.video ? `/uploads/${req.files.video[0].filename}` : null,
    audioUrl: req.files && req.files.audio ? `/uploads/${req.files.audio[0].filename}` : null
  };

  alerts.push(newAlert);

  console.log('Alert details:', {
    location: `${latitude}, ${longitude}`,
    hasVideo: !!newAlert.videoUrl,
    hasAudio: !!newAlert.audioUrl,
    timestamp: formattedTimestamp
  });

  // Send alerts to emergency contacts (non-blocking)
  sendEmergencyAlerts(newAlert).catch(error => {
    console.error('Error sending emergency alerts:', error);
  });

  io.emit('new-alert', newAlert);

  res.status(200).send({
    message: 'Alert received and logged successfully!',
    alert: newAlert
  });
});

io.on('connection', (socket) => {
  console.log('A dashboard client connected');
  socket.emit('initial-alerts', alerts);

  socket.on('disconnect', () => {
    console.log('A dashboard client disconnected');
  });
});

server.listen(port, () => {
  console.log(`PulseSafe backend listening on port ${port}`);
  console.log('Backend is ready to receive alerts!');
  console.log(`View the alerts dashboard at http://localhost:${port}/dashboard`);
});