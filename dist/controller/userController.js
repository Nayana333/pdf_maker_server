"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../model/user/userModel"));
const speakeasy = require('speakeasy');
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const sendVerifyMail_1 = __importDefault(require("../utils/sendVerifyMail"));
exports.registerUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('reached');
    const { userName, email, password, confirmPassword } = req.body;
    console.log(req.body);
    if (!userName || !email || !password || !confirmPassword) {
        res.status(400);
        throw new Error('Please fill all fields');
    }
    const existingUser = yield userModel_1.default.findOne({ userName });
    if (existingUser) {
        res.status(400);
        throw new Error('Username already exists');
    }
    const userExist = yield userModel_1.default.findOne({ email });
    if (userExist) {
        res.status(400);
        throw new Error('Email already registered');
    }
    const otp = speakeasy.totp({
        secret: speakeasy.generateSecret({ length: 20 }).base32,
        digits: 4,
    });
    console.log(otp);
    const sessionData = req.session;
    sessionData.userDetails = { userName, email, password };
    sessionData.otp = otp;
    sessionData.otpGeneratedTime = Date.now();
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(password, salt);
    sessionData.userDetails.password = hashedPassword;
    (0, sendVerifyMail_1.default)(req, userName, email);
    res.status(200).json({ message: "OTP sent for verification", email, otp });
}));
