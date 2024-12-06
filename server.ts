import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./src/server/routes/auth.ts";
import playerRoutes from "./src/server/routes/player.ts";
import roomRoutes from "./src/server/routes/room.ts";
import gameRoutes from "./src/server/routes/game.ts";
import matchmakingRoutes from "./src/server/routes/matchmaking.ts";
import ssr from "./src/server/routes/ssr.ts";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(authRoutes);
app.use(playerRoutes);
app.use(roomRoutes);
app.use(gameRoutes);
app.use(matchmakingRoutes);
app.use(ssr);

app.listen(5173, () => {
  console.log("Server running at: http://localhost:5173");
});
