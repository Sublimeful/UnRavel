import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./src/server/routes/auth.ts";
import playerRoutes from "./src/server/routes/player.ts";
import roomRoutes from "./src/server/routes/room.ts";
import gameRoutes from "./src/server/routes/game.ts";
import matchmakingRoutes from "./src/server/routes/matchmaking.ts";
import rankingsRoutes from "./src/server/routes/rankings.ts";
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
app.use(rankingsRoutes);
app.use(ssr);

const PORT = process.env["NODE_ENV"] === "development" ? 5173 : 80;

app.listen(PORT, () => {
  console.log(`Server running at: http://localhost:${PORT}`);
});
