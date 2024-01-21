"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperationController = void 0;
const prisma_1 = require("../utils/prisma");
const product_controller_1 = require("./product.controller");
class OperationController {
    static CheckPorductAvaliability(type, operationQuantity, actualQuantity) {
        if (type == "sale") {
            return actualQuantity - operationQuantity;
        }
        return actualQuantity + operationQuantity;
    }
    static undoOperation(operationId, newQuantity) {
        return __awaiter(this, void 0, void 0, function* () {
            const checkOperation = yield prisma_1.prisma.operation.findUnique({
                where: {
                    id: operationId,
                },
            });
            if (!checkOperation) {
                return false;
            }
            const getProduct = yield product_controller_1.ProductController.GetProductById(Number(checkOperation.productId));
            if (!getProduct) {
                return false;
            }
            if (checkOperation.type === "sale") {
                const originalQuantityofProduct = getProduct.quantity + checkOperation.quantity;
                //check if the updated stock can fulfill the need of the new quantity
                const newQuantityCheck = this.CheckPorductAvaliability(checkOperation.type, newQuantity, originalQuantityofProduct);
                if (!newQuantityCheck) {
                    return false;
                }
                if (newQuantityCheck) {
                    yield prisma_1.prisma.product.update({
                        where: {
                            id: checkOperation.productId,
                        },
                        data: {
                            quantity: originalQuantityofProduct - newQuantity,
                        },
                    });
                }
            }
            if (checkOperation.type === "purchase") {
                //This part will verify if the update of the operation could make the stock of the product become negative
                const originalQuantityofProduct = getProduct.quantity - checkOperation.quantity;
                //check if the updated stock can fulfill the need of the new quantity
                const newQuantityCheck = this.CheckPorductAvaliability(checkOperation.type, newQuantity, originalQuantityofProduct);
                if (!newQuantityCheck) {
                    return false;
                }
                yield prisma_1.prisma.product.update({
                    where: {
                        id: checkOperation.productId,
                    },
                    data: {
                        quantity: originalQuantityofProduct + newQuantity,
                    },
                });
            }
            return true;
        });
    }
}
exports.OperationController = OperationController;
