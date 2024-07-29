require('dotenv').config();
require('express-async-errors');

const express = require('express');
const app = express();

const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');

const fileUpload = require("express-fileupload");
const cloudinary = require("cloudinary").v2;
const cookieParser = require("cookie-parser");

const connectDB = require('./db/connect');

// middleware for security:
app.use(helmet());
app.use(cors());
app.use(xss());

// middleware for file upload to cloudinary:
app.use(fileUpload({ useTempFiles: true, }));
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// parse cookies:
app.use(cookieParser());

// parse the jason body:
app.use(express.json());

// routes:
const authRouter = require('./routes/auth');
const postsRouter = require('./routes/posts');

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/posts', postsRouter);

// Error handling middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

// statrting of the server and connecting to mongodb:
const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URI);
    app.listen(port, () =>
      console.log(`Server is listening on port ${port}...`)
    );
  } catch (error) {
    console.log(error);
  }
};

start();
