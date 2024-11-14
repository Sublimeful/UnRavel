import { io } from "socket.io-client";

console.log("NODE_ENV", process.env["NODE_ENV"]);

export const socket = io(
  process.env["NODE_ENV"] === "production"
    ? "https://unravel.sublimeful.org"
    : "http://localhost:5174",
  {
    autoConnect: false,
  },
);
