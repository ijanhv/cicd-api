import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { Server } from "http";
import helmet from "helmet";
import routes from './routes/v1';
import { createServer } from 'http';

import cookieParser from "cookie-parser";
import { Server as SocketIOServer } from 'socket.io'; // Import Socket.IO server

import xss from "@middleware/xss";
import compression from "compression";
import config from "@config/envCofig";
import prisma from "./client";
import ApiError from "@utils/apiError";
import httpStatus from "http-status";
import { errorConverter, errorHandler } from "@middleware/error";

const app = express();

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(
  express.urlencoded({
    extended: true,
  })
);

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
app.use(cors());
app.options("*", cors());

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'This route does not exist'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

const server = createServer(app); // Create the HTTP server
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
  },
}); // Initialize Socket.IO server

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


prisma.$connect().then(() => {
  console.info('Connected to Postgres Database');
  server.listen(config.port, () => {
    console.info(`Listening to port ${config.port}`);
  });
});


export default io; 
