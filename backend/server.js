require('dns').setServers(['8.8.8.8', '1.1.1.1']);   // fixes the Atlas "querySrv ECONNREFUSED" error
require('dotenv').config();
const express = require('express'), cors = require('cors'), rate = require('express-rate-limit');
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '4mb' }));   // 4 MB so document uploads (sent as base64 text) fit
app.use('/api/auth', rate({ windowMs: 15 * 60 * 1000, max: 100 }), require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/deadlines', require('./routes/deadlines'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/admin', require('./routes/admin'));
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(require('./middleware/auth').errorHandler);
require('./config/db')().then(() => { require('./cron/reminders')(); app.listen(process.env.PORT || 5000, () => console.log('API running')); });