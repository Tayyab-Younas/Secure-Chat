import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/DataBase.js";
import express from "express";
import http from "http";
import { initSocket } from "./Socket/SocketHandler.js";
import AuthRouters from "./routers/AuthRouters.js";
import chatRouters from "./routers/ChatRouters.js";
import messageRouters from "./routers/MessageRoutes.js";
import KeyRoutes from "./routers/KeyRoutes.js";
import { verifyToken } from "./middlewares/authMiddleware.js";
import statusRouters from "./routers/StatusRouters.js";

const app = express();

// ✅ Connect to DB
connectDB();

// ✅ Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Public Routes
app.use("/", AuthRouters);

// ✅ Protected Routes
app.use("/chat", verifyToken, chatRouters);
app.use("/message", verifyToken, messageRouters);
app.use("/key", KeyRoutes);
app.use("/status", verifyToken, statusRouters);

// ✅ Socket.io Setup
const server = http.createServer(app);
initSocket(server);

// ✅ Server Start
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});

export default app;
