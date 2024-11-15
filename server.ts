import express from "express";
import cors from "cors";
import authRoutes from "./src/server/routes/auth.ts";
import miscRoutes from "./src/server/routes/misc.ts";
import roomRoutes from "./src/server/routes/room.ts";
import gameRoutes from "./src/server/routes/game.ts";
import ssr from "./src/server/routes/ssr.ts";

const app = express();

app.use(cors());
app.use(express.json());
app.use(authRoutes);
app.use(miscRoutes);
app.use(roomRoutes);
app.use(gameRoutes);
app.use(ssr);

app.listen(5173, () => {
  console.log("Server running at: http://localhost:5173");
});
