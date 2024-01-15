"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const swagger_autogen_1 = __importDefault(require("swagger-autogen"));
(0, swagger_autogen_1.default)({
    openapi: "3.0.0",
    language: "pt-BR",
});
const outputFile = "./swagger-output.json"; // Here I'm pointing where is created the documentation
const endpointsFiles = [path_1.default.join("../src/server.ts")]; // In this array I'm poiting to the routes of our project. I need to put here th file where I coordinate the routes
const doc = {
    info: {
        version: "1.0.0",
        title: "Desafio 6 - DNC---Backend-Ecommerce",
        description: "Projeto criado para atender o desafio enviado pela DNC como parte do processo de aprendizado",
    },
    servers: [
        {
            url: `http://localhost:${process.env.PORT}`,
            description: "Develop server",
        },
        {
            url: `${process.env.URL}`, //TODO: update after we have the deploy
            description: "Production server",
        },
    ],
    consumes: ["application/json"],
    produces: ["application/json"],
}; // this function calls for doc update
(0, swagger_autogen_1.default)()(outputFile, endpointsFiles, doc).then(() => {
    require("../server.ts");
});
