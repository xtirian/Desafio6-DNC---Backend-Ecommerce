"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const customer_route_1 = __importDefault(require("./routes/customer.route"));
const product_route_1 = __importDefault(require("./routes/product.route"));
const operation_route_1 = __importDefault(require("./routes/operation.route"));
const purchase_route_1 = __importDefault(require("./routes/purchase.route"));
const sale_route_1 = __importDefault(require("./routes/sale.route"));
function routes(server) {
    try {
        server.use("/customer", customer_route_1.default);
        server.use("/product", product_route_1.default);
        server.use("/operation", operation_route_1.default);
        server.use("/purchase", purchase_route_1.default);
        server.use("/sale", sale_route_1.default);
        return;
    }
    catch (error) {
        throw error;
    }
}
exports.default = routes;
