import { io } from "socket.io-client";

export const socket = io(
  import.meta.env.PROD
    ? "https://unravel.sublimeful.org"
    : "http://localhost:5174",
  {
    autoConnect: false,
  },
);
