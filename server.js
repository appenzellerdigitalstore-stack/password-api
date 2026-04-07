const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const API_KEYS = [
  "key_client_1",
  "key_client_2",
  "my-secret-key" // tu key actual
];

app.use(express.json());

// API Key Middleware
app.use((req, res, next) => {
  if (req.path === '/' || req.path === '/health') return next();

  const apiKey = req.headers['x-api-key'];

  if (!apiKey || !API_KEYS.includes(apiKey)) {
    return res.status(401).json({ error: 'Unauthorized. Invalid API key.' });
  }

  next();
});

// Root
app.get('/', (req, res) => {
  res.json({
    name: "Security Toolkit API",
    version: "2.1.0",
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

// Generate Password
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

// Improved Strength Checker
app.post('/check-strength', (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  let score = 0;

  // Length scoring (stricter)
  if (password.length >= 10) score++;
  if (password.length >= 14) score++;

  // Character variety
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (hasUpper) score++;
  if (hasLower) score++;
  if (hasNumber) score++;
  if (hasSymbol) score++;

  // Penalize common patterns HARD
  const weakPatterns = ['123', 'password', 'qwerty', 'abc', 'test'];
  let penalty = 0;

  weakPatterns.forEach(pattern => {
    if (password.toLowerCase().includes(pattern)) {
      penalty += 2; // stronger penalty
    }
  });

  score = score - penalty;

  if (score < 0) score = 0;

  let strength = 'very weak';

  if (score >= 6) strength = 'very strong';
  else if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  else if (score >= 2) strength = 'weak';

  res.json({
    password,
    score,
    strength
  });
});

// Start
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});