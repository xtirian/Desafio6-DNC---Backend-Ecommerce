"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customer_route_1 = __importDefault(require("./routes/customer.route"));
function routes(server) {
    try {
        server.use("/customer", customer_route_1.default);
        return;
    }
    catch (error) {
        console.error(error);
    }
}
exports.default = routes;
