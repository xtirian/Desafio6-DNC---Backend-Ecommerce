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
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const product_controller_1 = require("../controllers/product.controller");
const operation_controller_1 = require("../controllers/operation.controller");
const router = (0, express_1.Router)();
//CREATE
router.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, quantity, productId } = req.body;
    // check type operation
    if (type !== "sale") {
        if (type !== "purchase") {
            res.status(400).send({
                message: "types alloweds are 'sale' or 'purchase'.",
            });
            return;
        }
    }
    //check if the product exist in db
    const checkProduct = yield product_controller_1.ProductController.GetProductById(Number(productId));
    if (!checkProduct) {
        res.status(400).send({
            message: "Couldn't find the product in our database. Check the id.",
        });
        return;
    }
    // check if the quantity avaliable match if the operation's need. If the type is sale and the sale and the avaliability don't fulfill the operation need, will return a message that can't generate this operation
    const quantityCheck = operation_controller_1.OperationController.CheckPorductAvaliability(type, quantity, checkProduct.quantity);
    if (quantityCheck < 0) {
        res.status(400).send({
            message: "This operation exceed the quantity avaliable in the stock.",
        });
        return;
    }
    try {
        const createOperation = yield prisma_1.prisma.operation.create({
            data: {
                type: type,
                quantity: quantity,
                productId: productId,
            },
        });
        if (createOperation) {
            yield product_controller_1.ProductController.UpdateProductQuantity(productId, checkProduct.name, checkProduct.cost, checkProduct.price, quantityCheck);
        }
        res.status(201).send({
            message: "Operation created!",
            data: {
                id: createOperation.id,
                product: checkProduct.name,
                productId: createOperation.productId,
                quantity: quantity,
                price: checkProduct.price,
                cost: checkProduct.cost
            },
        });
        return;
    }
    catch (error) {
        if (error instanceof prisma_1.PrismaExc.PrismaClientKnownRequestError) {
            res.status(500).send({
                message: "Internal Server Error",
                error: error.code,
            });
        }
        throw error;
    }
}));
// READ
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allOperations = yield prisma_1.prisma.operation.findMany();
        res.status(200).send(allOperations);
    }
    catch (error) {
        if (error instanceof prisma_1.PrismaExc.PrismaClientKnownRequestError) {
            res.status(500).send({
                message: "Internal Server Error",
                error: error.code,
            });
        }
        throw error;
    }
}));
// UPDATE
router.put("/:operationId/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { operationId } = req.params;
    const { newQuantity } = req.body;
    const checkOperation = operation_controller_1.OperationController.undoOperation(Number(operationId), newQuantity);
    if (!checkOperation) {
        res.status(400).send({
            message: "Can't find the operation, verify the Id you want",
        });
        return;
    }
    try {
        const operationUpdate = yield prisma_1.prisma.operation.update({
            where: {
                id: Number(operationId),
            },
            data: {
                quantity: newQuantity,
            },
        });
        res.status(200).send({ message: "operation umpdated succefully" });
    }
    catch (error) {
        res.status(500).send(error);
        throw error;
    }
}));
// DELETE
router.delete("/:operationId/delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { operationId } = req.params;
    try {
        yield prisma_1.prisma.operation.delete({
            where: {
                id: Number(operationId),
            },
        });
    }
    catch (error) {
        if (error instanceof prisma_1.PrismaExc.PrismaClientKnownRequestError) {
            res.status(500).send(error);
        }
        throw error;
    }
}));
exports.default = router;
