import http from "http";
import { Server } from "socket.io";
import app from "./app";

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000/",
      "http://localhost:3001/",
      "https://creditoya.vercel.app/",
      "https://creditoya.vercel.app/dashboard",
      "https://intranet-creditoya.vercel.app/",
      "https://intranet-creditoya.vercel.app/dashboard",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

export { server, io };
