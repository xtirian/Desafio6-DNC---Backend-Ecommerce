"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const authDoc_1 = __importDefault(require("./middleware/authDoc"));
dotenv_1.default.config();
const server = (0, express_1.default)();
server.use(express_1.default.json());
server.use((0, cors_1.default)());
server.use((0, morgan_1.default)("dev"));
server.use(express_1.default.urlencoded({ extended: false }));
server.use(express_1.default.static(path_1.default.join(__dirname, "public"))); //access public to get the css
const PORT = process.env.PORT;
const swaggerOptions = { customCssUrl: "swagger-ui.css" };
const swagger_output_json_1 = __importDefault(require("./doc/swagger_output.json"));
if (process.env.NODE_ENV) {
    server.get("/", (req, res) => {
        /**#swagger.ignore=true */ res.redirect("/doc");
    });
    server.use("/doc", authDoc_1.default, swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_output_json_1.default, swaggerOptions));
}
server.get('/', (req, res) => {
    res.json({ message: 'hello world with Typescript' });
});
server.listen(PORT, () => 'server running on port 3333');
