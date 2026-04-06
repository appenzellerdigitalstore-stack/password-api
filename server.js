const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = "my-secret-key";

// Middleware
app.use(express.json());

app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/health') return next();

  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Missing or invalid API key.' });
  }

  next();
});

// Root endpoint (important for product feel)
app.get('/', (req, res) => {
  res.json({
    name: "Password Generator API",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      generatePassword: "/generate-password?length=12"
    },
    auth: "Use x-api-key in headers"
  });
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Password generator
app.get('/generate-password', (req, res) => {
  const length = parseInt(req.query.length) || 12;

  if (length < 4 || length > 100) {
    return res.status(400).json({ error: 'Length must be between 4 and 100' });
  }

  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';

  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  res.json({
    success: true,
    data: {
      password,
      length
    }
  });
});

// Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});