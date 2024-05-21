import express from "express";
import cors from "cors";
import morgan from "morgan";

//import Handlers Route

const app = express();

// middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());


// routes

export default app
