const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEY = "my-secret-key";

app.use(express.json());

// API Key Middleware
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/health') return next();

  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Unauthorized. Missing or invalid API key.' });
  }

  next();
});

// Root
app.get('/', (req, res) => {
  res.json({
    name: "Security Toolkit API",
    version: "2.0.0",
    endpoints: {
      generatePassword: "/generate-password",
      bulkGenerate: "/generate-bulk",
      checkStrength: "/check-strength",
      health: "/health"
    }
  });
});

// Health
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Generate Password (with rules)
app.get('/generate-password', (req, res) => {
  const length = parseInt(req.query.length) || 12;
  const minUppercase = parseInt(req.query.minUppercase) || 1;
  const minNumbers = parseInt(req.query.minNumbers) || 1;

  if (length < 4 || length > 100) {
    return res.status(400).json({ error: 'Length must be between 4 and 100' });
  }

  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()';

  let password = '';

  for (let i = 0; i < minUppercase; i++) {
    password += upper[Math.floor(Math.random() * upper.length)];
  }

  for (let i = 0; i < minNumbers; i++) {
    password += numbers[Math.floor(Math.random() * numbers.length)];
  }

  const all = lower + upper + numbers + symbols;

  for (let i = password.length; i < length; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  password = password.split('').sort(() => Math.random() - 0.5).join('');

  res.json({ password, length });
});

// Bulk generation
app.get('/generate-bulk', (req, res) => {
  const count = parseInt(req.query.count) || 10;
  const length = parseInt(req.query.length) || 12;

  if (count > 1000) {
    return res.status(400).json({ error: 'Max 1000 passwords per request' });
  }

  const passwords = [];

  for (let i = 0; i < count; i++) {
    let pass = '';
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    for (let j = 0; j < length; j++) {
      pass += chars[Math.floor(Math.random() * chars.length)];
    }

    passwords.push(pass);
  }

  res.json({ count, passwords });
});

// Strength checker
app.post('/check-strength', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = ['weak', 'medium', 'strong', 'very strong'];

  res.json({
    password,
    score,
    strength: levels[score - 1] || 'very weak'
  });
});

// Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});