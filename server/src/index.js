import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const port = Number(process.env.PORT || 3000);
const jwtSecret = process.env.JWT_SECRET;

if (!process.env.MONGODB_URI || !jwtSecret) {
  throw new Error('MONGODB_URI and JWT_SECRET are required');
}

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json({ limit: '1mb' }));

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  data: {
    expenses: { type: Array, default: [] },
    categories: { type: Array, default: [] },
    budget: { type: Object, default: { monthlyLimit: 0, categoryLimits: {} } },
  },
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const createToken = user => jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '30d' });

const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Authentication required' });
    const payload = jwt.verify(token, jwtSecret);
    req.user = await User.findById(payload.sub);
    if (!req.user) return res.status(401).json({ message: 'Account not found' });
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired session' });
  }
};

const publicUser = user => ({ id: user.id, email: user.email });

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/auth/register', async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || password.length < 8) return res.status(400).json({ message: 'Email and an 8-character password are required' });
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: 'An account with this email already exists' });
    const user = await User.create({ email, passwordHash: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: createToken(user), user: publicUser(user) });
  } catch (error) {
    res.status(500).json({ message: 'Could not create account' });
  }
});

app.post('/auth/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  res.json({ token: createToken(user), user: publicUser(user) });
});

app.get('/sync', requireAuth, (req, res) => res.json(req.user.data));

app.put('/sync', requireAuth, async (req, res) => {
  const { expenses, categories, budget } = req.body;
  if (!Array.isArray(expenses) || !Array.isArray(categories) || !budget || typeof budget !== 'object') {
    return res.status(400).json({ message: 'Invalid sync payload' });
  }
  req.user.data = { expenses, categories, budget };
  await req.user.save();
  res.json({ ok: true });
});

await mongoose.connect(process.env.MONGODB_URI);
app.listen(port, () => console.log(`Expense Tracker API listening on port ${port}`));
