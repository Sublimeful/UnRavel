import { io } from "socket.io-client";
export const socket = io("https://unravel.sublimeful.org", {
  autoConnect: false,
});
