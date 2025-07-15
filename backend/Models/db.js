const mongoose = require('mongoose');
require('dotenv').config();

const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL).then(()=>{
    console.log("Database connected successfully!!");
}).catch((err)=>{
    console.log("Database connection failed", err);
});