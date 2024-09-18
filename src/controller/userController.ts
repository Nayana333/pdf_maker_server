
import { Request, Response } from "express";
import asyncHandler from 'express-async-handler';
import User from "../model/user/userModel";
const speakeasy = require('speakeasy');
import bcrypt from "bcryptjs";
import sendVerifyMail from '../utils/sendVerifyMail';
import generateToken from "../utils/generateToken";
import path from "path";
import pdfModel from "../model/pdf/pdfModel";
import { log } from "console";
const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
    console.log('reached');
    
    const { userName, email, password, confirmPassword } = req.body;
    console.log(req.body);
    if (!userName || !email || !password || !confirmPassword) {
      res.status(400);
      throw new Error('Please fill all fields');
    }
  
    const existingUser = await User.findOne({ userName });
    if (existingUser) {
      res.status(400);
      throw new Error('Username already exists');
    }
  
    const userExist = await User.findOne({ email });
    if (userExist) {
      res.status(400);
      throw new Error('Email already registered');
    }
    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret({ length: 20 }).base32,
      digits: 4,
    });
  
    console.log(otp);
  
    const sessionData = req.session!;
    sessionData.userDetails = { userName, email, password }
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now()
  
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt)
    sessionData.userDetails!.password = hashedPassword;
    sendVerifyMail(req, userName, email);
    res.status(200).json({ message: "OTP sent for verification", email, otp });
  });


  export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
    const { otp } = req.body;
    
    console.log('reached');
    
  
    console.log(`Received OTP: ${otp}`);
    console.log(`Type of received OTP: ${typeof otp}`);
  
    if (!otp) {
      res.status(400);
      throw new Error('Cannot receive OTP');
    }
  
    const sessionData = req.session;
    console.log(sessionData,":::::::")
    const storedOTP = sessionData.otp;
  
    console.log(`Stored OTP: ${storedOTP}`);
    console.log(`Type of stored OTP: ${typeof storedOTP}`);
  
    if (!storedOTP || storedOTP !== otp.toString().trim()) {
      res.status(400);
      throw new Error('Invalid OTP');
    }
  
    const otpGeneratedTime = sessionData.otpGeneratedTime || 0;
    const currentTime = Date.now();
    const expiredTime = 60 * 1000;
  
  
  
    if (currentTime - otpGeneratedTime > expiredTime) {
      res.status(400);
      throw new Error('OTP expired');
    }
  
    const userDetails = sessionData.userDetails;
    if (!userDetails) {
      res.status(400);
      throw new Error('User details not found in session');
    }
  
    const user = await User.create({
      userName: userDetails.userName,
      email: userDetails.email,
      password: userDetails.password
    });
  
    delete sessionData.userDetails;
    delete sessionData.otp;
  
    res.status(200).json({ message: 'OTP verified successfully, user added', user });
  });
  
  
  export const resendOTP = asyncHandler(async (req: Request, res: Response) => {
  
    const email = req.body
  
  
  
    const otp = speakeasy.totp({
      secret: speakeasy.generateSecret({ length: 20 }).base32,
      digits: 4,
    });
  
    console.log(otp);
  
    const sessiondata = req.session!
    sessiondata.otp = otp;
    sessiondata.otpGeneratedTime = Date.now()
  
    const userDetails = sessiondata.userDetails;
    if (!userDetails) {
      res.status(400)
      throw new Error('userDetails not found')
      return;
    }
    console.log('new OTP' + otp);
  
    sendVerifyMail(req, userDetails.userName, userDetails.email);
  
    res.status(200).json({ message: 'new otp sent for verification ', email, otp })
  
  })

  export const login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
  
    const user = await User.findOne({ email });
  
    if (!user) {
      res.status(404).json({ message: 'No user exists with the provided email' });
      return;
    }
  
    if (user.isBlocked) {
      res.status(400).json({ message: 'You are temporarily suspended' });
      return;
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
  
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }
  
    const userData = await User.findOne({ email }, { password: 0 });
  
    res.json({
      message: 'Logged in successfully',
      user: userData,
      token: generateToken(user.id),
    });
  });


  export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
    const { userName, email } = req.body;
  
    try {
      let user = await User.findOne({ email });
  
      if (user) {
        if (user.isBlocked) {
          res.status(400).json({ message: "User is blocked" });
          return;
        }
  
        const userData = await User.findOne({ email }, { password: 0 });
  
        res.json({
          message: "Login Successful",
          user: userData,
          token: generateToken(user.id),
        });
      } else {
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
  
        const newUser = new User({
          userName,
          email,
          password: hashedPassword,
          isGoogle: true,
        });
  
        await newUser.save();
  
        const userData = await User.findOne({ email }, { password: 0 });
  
        res.json({
          message: "Login Successful",
          user: userData,
          token: generateToken(newUser.id),
        });
      }
    } catch (error) {
      console.error("Error in Google authentication:", error);
      res.status(500).json({ message: "Server error" });
    }
  });



  export const uploadPdf = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId, title } = req.body;
      console.log(req.body);
      const filePath = req.file?.path;

      const fileName = filePath ? path.basename(filePath) : null;
  
      if (!fileName) {
        res.status(400).json({ message: 'No PDF uploaded' });
        return;
      }
  
      const pdfModels = new pdfModel({
        userId,       
        title,      
        fileName,
        pdf:filePath   
      });
  
      await pdfModels.save();
  
      res.status(201).json({ message: 'PDF uploaded successfully' });
    } catch (error) {
      console.error('Error on uploading:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export const getPdf = async (req: Request, res: Response): Promise<void> => {
    try {
       const { userId } = req.params; 
  
      if (!userId) {
        res.status(400).json({ message: 'User ID is required and must be a string' });
        return;
      }
  
      const getAllData = await pdfModel.find({ userId });
  
      if (getAllData.length === 0) {
        res.status(404).json({ message: 'No data found' });
        return;
      }
  
      res.status(200).json({ data: getAllData });
  
    } catch (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
 

  export const  downloadSelectedPages = async (req, res) => {
    const { pdfFile, selectedPages } = req.body;

    try {
        const filePath = path.join(__dirname, '../files', pdfFile); 

        if (!fs.existsSync(filePath)) {
            return res.status(404).send('File not found');
        }

        const existingPdfBytes = fs.readFileSync(filePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const newPdfDoc = await PDFDocument.create();

        for (const pageNumber of selectedPages) {
            if (pageNumber > 0 && pageNumber <= pdfDoc.getPageCount()) {
                const [page] = await newPdfDoc.copyPages(pdfDoc, [pageNumber - 1]);
                newPdfDoc.addPage(page);
            }
        }

        const pdfBytes = await newPdfDoc.save();

        // Send the PDF as a blob response
        res.setHeader('Content-Disposition', 'attachment; filename=selected_pages.pdf');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Length', pdfBytes.length);
        res.send(Buffer.from(pdfBytes));

    } catch (error) {
        console.error("Error processing PDF:", error);
        res.status(500).json({ message: 'Error processing PDF' });
    }
};


export const deleteFile= async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params; 
    log

    if (!id) {
      res.status(400).json({ message: 'PDF ID is required' });
      return;
    }

    // Find and delete the PDF by its ID
    const deletedPdf = await pdfModel.findByIdAndDelete(id);

    if (!deletedPdf) {
      res.status(404).json({ message: 'PDF not found' });
      return;
    }

    res.status(200).json({ message: 'PDF deleted successfully' });

  } catch (error) {
    console.error('Error deleting PDF:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
