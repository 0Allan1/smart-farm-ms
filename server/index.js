const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const farmRoutes = require('./routes/farms.routes');
const cropRoutes = require('./routes/crops.routes');
const alertRoutes = require('./routes/alerts.routes');
const activityRoutes = require('./routes/activities.routes');
const schedulerRoutes = require('./routes/scheduler.routes');
const accessRoutes = require('./routes/access.routes');
const weatherRoutes = require('./routes/weather.routes');
const reportRoutes = require('./routes/reports.routes');
const adviceRoutes = require('./routes/advice.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/farms', farmRoutes);
app.use('/api/crops', cropRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/access', accessRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/advice', adviceRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'SFMS Backend is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
