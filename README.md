# PulseSafe - Emergency Response System

PulseSafe is an automated emergency response application that detects emergencies through dual-sensor monitoring (accelerometer and microphone) and automatically alerts trusted contacts with location data and media recordings.

## Features

### ✅ Implemented
- **Dual-Sensor Detection**: Accelerometer and microphone monitoring with user-defined thresholds
- **10-Second Countdown**: Full-screen countdown with vibration and cancel option
- **Media Capture**: 10-second audio and video recording during emergencies
- **Live Dashboard**: Real-time web dashboard showing all alerts with media playback
- **SMS/WhatsApp Alerts**: Automatic notifications to emergency contacts via Twilio
- **Contact Management**: In-app emergency contacts configuration
- **Settings**: Customizable motion and audio detection thresholds

### 🚧 Coming Soon
- Phone contacts integration
- Background execution optimization
- Enhanced SMS/WhatsApp templates

## Setup Instructions

### 1. Backend Setup

1. **Install Dependencies**:
   ```bash
   cd PulseSafe
   npm install
   ```

2. **Configure Twilio** (Free tier available):
   - Sign up at [twilio.com](https://www.twilio.com)
   - Get your Account SID, Auth Token, and a Twilio phone number
   - Update `server.js` with your credentials:
   ```javascript
   const TWILIO_ACCOUNT_SID = 'your_account_sid';
   const TWILIO_AUTH_TOKEN = 'your_auth_token';
   const TWILIO_PHONE_NUMBER = '+1234567890'; // Your Twilio number
   ```

3. **Start Backend Server**:
   ```bash
   node server.js
   ```
   Server will run on `http://localhost:3000`
   Dashboard available at `http://localhost:3000/dashboard`

### 2. Frontend Setup (React Native/Expo)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Update Backend URL**:
   In `App.js`, update the BACKEND_URL to match your server:
   ```javascript
   const BACKEND_URL = 'http://YOUR_SERVER_IP:3000/alert';
   ```

3. **Run the App**:
   ```bash
   npm start
   # or
   expo start
   ```

### 3. App Configuration

1. **Permissions**: The app will request:
   - Location permissions (required)
   - Microphone permissions (required)
   - Camera permissions (required)

2. **Settings**: Configure detection thresholds in the Settings screen:
   - Motion threshold: Higher values = less sensitive
   - Audio threshold: Higher values = less sensitive (1-120 dB)

3. **Emergency Contacts**: Add contacts in the Emergency Contacts screen:
   - Phone numbers must include country code (+1 for US, +91 for India)
   - Choose SMS or WhatsApp for each contact

## How It Works

### Emergency Detection Flow
1. **Protection Mode**: User enables protection mode in the app
2. **Dual Monitoring**: App continuously monitors:
   - Accelerometer for sudden motion/impact
   - Microphone for loud sounds (screams, crashes)
3. **Trigger**: Either sensor exceeding threshold triggers 10-second countdown
4. **Countdown**: User can cancel if false alarm
5. **Media Capture**: If countdown completes, app records 10-second audio + video
6. **Alert Transmission**: Sends location, media, and timestamp to backend
7. **Contact Notification**: Backend forwards alerts to saved emergency contacts
8. **Dashboard Update**: Live dashboard displays all alert information

### Alert Information Sent
- Exact GPS coordinates
- Timestamp of event
- 10-second video recording
- 10-second audio recording
- Map link for location viewing

## Twilio Pricing (Free Tier Available)

- **New Accounts**: $15 free credit when signing up
- **SMS**: ~$0.0075 per message
- **WhatsApp**: ~$0.005 per message (requires business verification for production)
- **Demo Mode**: Use Twilio Sandbox for WhatsApp (free testing)

## File Structure

```
PulseSafe/
├── App.js                 # Main React Native app
├── CountdownScreen.js     # Emergency countdown screen
├── SettingsScreen.js      # Threshold configuration
├── ContactsScreen.js      # Emergency contacts management
├── server.js              # Node.js backend server
├── dashboard.html         # Web dashboard
├── package.json           # Dependencies
└── uploads/               # Media file storage (auto-created)
```

## API Endpoints

- `POST /alert` - Receive emergency alerts from app
- `GET /dashboard` - Web dashboard interface
- `GET /contacts` - Get emergency contacts
- `POST /contacts` - Update emergency contacts
- `GET /uploads/*` - Serve media files

## Troubleshooting

### Common Issues

1. **Permissions Denied**: Ensure all three permissions (location, microphone, camera) are granted
2. **Backend Connection**: Check that BACKEND_URL matches your server IP
3. **Twilio Errors**: Verify Twilio credentials and phone number configuration
4. **Media Not Recording**: Ensure camera and microphone permissions are granted
5. **SMS Not Sending**: Check Twilio balance and phone number verification

### Testing

1. **Motion Detection**: Shake phone vigorously to test accelerometer trigger
2. **Audio Detection**: Make loud noise near phone to test microphone trigger
3. **Full Flow**: Enable protection mode, trigger sensor, wait for countdown completion

## Security & Privacy

- All media recordings are stored locally on your server
- Location data is only shared with designated emergency contacts
- Audio monitoring only checks volume levels, doesn't store continuous audio
- Video recording only occurs during confirmed emergencies

## Support

For issues or questions:
1. Check console logs in both app and server
2. Verify all permissions are granted
3. Ensure backend server is running and accessible
4. Confirm Twilio configuration if SMS/WhatsApp not working

---

**Important**: This is an emergency response system. Test thoroughly before relying on it for real emergencies. Always have backup safety measures in place.
