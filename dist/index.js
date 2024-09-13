"use strict";
// const dotenv = require('dotenv');
// const express = require('express');
// const { Request: ExpressRequest, Response:ExpressResponse } = require('express');
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 3000;
// app.get('/', (req: Request, res: Response) => {
//   res.send('Hello, World!');
// });
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.get('/', (req, res) => {
    res.send('Hello, World!');
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
