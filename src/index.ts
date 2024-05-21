import { server } from "./server";
import "./ws/ioRoute";
import dotenv from "dotenv";

dotenv.config();

server.listen(process.env.PORT, () => {
  console.log(`server io running in port ${process.env.PORT}`);
});
