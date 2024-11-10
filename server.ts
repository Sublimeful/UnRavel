import express from "express";
import cors from "cors";
import api from "./src/server/routes/api.ts";
import ssr from "./src/server/routes/ssr.ts";

const app = express();

app.use(cors());
app.use(express.json());
app.use(api);
app.use(ssr);

app.listen(5173, () => {
  console.log("Server running at: http://localhost:5173/");
});
