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
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const userModel_1 = __importDefault(require("../model/user/userModel"));
const protect = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(' ')[1];
            console.log(req.token);
            req.token = token;
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            if (decoded.role !== "user") {
                res.status(401);
                throw new Error("Not authorized");
            }
            req.user = yield userModel_1.default.findById(decoded.id).select("-password");
            if (req.user.isBlocked) {
                res.status(401);
                throw new Error('User blocked');
            }
            next();
        }
        catch (error) {
            console.log(error);
            if (error.name === "TokenExpiredError") {
                res.status(401);
                throw new Error("Token expired");
            }
            else {
                res.status(401);
                throw new Error("Not authorized");
            }
        }
    }
    else {
        if (!token) {
            res.status(401);
            throw new Error('Not authorized, no token');
        }
    }
}));
exports.protect = protect;
