// Import the necessary packages
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const moment = require('moment-timezone');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');

const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins for development
  },
  maxHttpBufferSize: 1e8, // 100 MB, to handle video files
});

const port = 3000;

// Set up Multer for file uploads (for future video support)
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
const upload = multer({ storage: storage });

// Store alert data
const alerts = [];

// Serve uploaded files statically from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve the dashboard HTML file
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Route to handle the alert from the app (POST request)
app.post('/alert', upload.single('video'), (req, res) => {
  console.log('Received new alert!');

  const { latitude, longitude, timestamp } = req.body;

  const formattedTimestamp = moment(timestamp).tz('Asia/Kolkata').format('MMMM Do YYYY, h:mm:ss a z');
  const osmUrl = `http://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;

  const newAlert = {
    latitude,
    longitude,
    timestamp,
    formattedTimestamp,
    osmUrl,
    videoUrl: req.file ? `/uploads/${req.file.filename}` : null // Save video path if file exists
  };

  alerts.push(newAlert);

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