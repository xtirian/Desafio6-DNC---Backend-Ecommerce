import express from "express";
import { Request, Response } from "express";
import dotenv from "dotenv";
import logger from "morgan";
import path from "path";
import cors from "cors";
import swaggerUI from "swagger-ui-express";
import authDocProducao from "./middleware/authDoc";

dotenv.config();
const server = express();
server.use(express.json());
server.use(cors());
server.use(logger("dev"));
server.use(express.urlencoded({ extended: false }));
server.use(express.static(path.join(__dirname, "public"))); //access public to get the css

const PORT = process.env.PORT;
const swaggerOptions = { customCssUrl: "swagger-ui.css" };
import swaggerFile from "./doc/swagger_output.json";
import routes from "./routes";

if (process.env.NODE_ENV) {
  server.get("/", (req: Request, res: Response) => {
    /**#swagger.ignore=true */ res.redirect("/doc");
  });

  server.use(
    "/doc",
    authDocProducao,
    swaggerUI.serve,
    swaggerUI.setup(swaggerFile, swaggerOptions)
  );
}

server.get("/", (req: Request, res: Response) => {
  res.json({ message: "hello world with Typescript" });
});

routes(server);

if (process.env.NODE_ENV) {
  server.listen(PORT, () => "server running on port 3333");
}
