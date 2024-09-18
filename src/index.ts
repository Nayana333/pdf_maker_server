import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import connectDB from "./config/db";
import cors from 'cors';
import errorHandler from './middleware/errorHandler';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import http from 'http';
import path from 'path';
import userRoutes from './routes/userRoutes';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const server = http.createServer(app);
connectDB();

declare module 'express-session' {
  interface Session {
    userDetails?: { userName: string, email: string, password: string };
    otp?: string;
    otpGeneratedTime?: number;
    email?: string;
  }
}

const sessionSecret = process.env.SESSION_SECRET || 'default_secret_value';
app.enable("trust proxy");
app.use(session({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    ttl: 24 * 60 * 60, 
    autoRemove: 'native',
  }),
  cookie: {
    maxAge: 24 * 60 * 60 * 1000 
  }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: process.env.ORIGIN,
  methods: "GET,HEAD,PUT,PATCH,DELETE,POST",
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api/users', userRoutes);

app.use(errorHandler);

app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
