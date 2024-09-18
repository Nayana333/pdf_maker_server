import express from "express";
import {
    registerUser,
    verifyOTP,
    resendOTP,
    login,
    googleAuth,
    uploadPdf,
    getPdf,
    downloadSelectedPages,
    deleteFile
  
} from '../controller/userController';
import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';

/////////////////////
const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
      cb(null, 'src/public/uploads'); 
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
      const ext = path.extname(file.originalname); 
      const filename = file.originalname.replace(ext, ''); 
      cb(null, `${filename}-${Date.now()}${ext}`); 
    },
});

const upload = multer({ storage });

// Routes
router.post("/register", registerUser);
router.post('/verifyOTP', verifyOTP);
router.post('/resendOTP', resendOTP);
router.post('/login', login);
router.post('/googleAuth', googleAuth);
router.get('/get-files/:userId', getPdf);
router.post('/downloadSelectedPages',downloadSelectedPages)
router.delete('/delete-file/:id',deleteFile)

// PDF upload route
router.post('/upload-pdf', upload.single('pdf'), uploadPdf);

// Error handling middleware for multer
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    console.error('Multer error:', err);
    res.status(400).json({ error: 'File upload failed', message: err.message });
  } else {
    console.error('Other error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
