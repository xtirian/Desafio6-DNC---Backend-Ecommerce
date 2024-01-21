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
//CREATE PRODUCT
const router = (0, express_1.Router)();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, price, cost, quantity } = req.body;
    if (!name || !price || !cost || !quantity) {
        res.status(400).send({
            message: "can't handle this request",
        });
    }
    const productCheck = yield product_controller_1.ProductController.CheckProductExist(name);
    if (productCheck === null || productCheck === void 0 ? void 0 : productCheck.length) {
        res.status(400).send({
            message: "produto já existe",
        });
    }
    try {
        // PRISMA ALREADY VERIFY THE DATA TYPE AND IF ALL DATA EXISTS
        const newProduct = yield prisma_1.prisma.product.create({
            data: {
                name: name,
                price: price,
                cost: cost,
                quantity: quantity,
            },
        });
        if (newProduct) {
            res.status(201).send({
                message: `Product ${name} created sucessfully.`,
            });
        }
    }
    catch (error) {
        if (error instanceof prisma_1.PrismaExc.PrismaClientKnownRequestError) {
            res.status(500).send({
                message: "Couldn't handle the request.",
            });
            throw error;
        }
    }
}));
//GET PRODUCT
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield prisma_1.prisma.product.findMany({
        select: {
            id: true,
            name: true,
            price: true,
            cost: true,
            quantity: true,
            operations: true,
        },
    });
    res.status(200).send(product);
}));
// GET PRODUCT BY ID
router.get("/:productId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const product = yield prisma_1.prisma.product.findMany({
        where: {
            id: Number(productId)
        },
        select: {
            id: true,
            name: true,
            price: true,
            cost: true,
            quantity: true,
            operations: true,
        },
    });
    res.status(200).send(product);
}));
//GET PRODUCTS BY NAME
router.get("/name=:productName", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { productName } = req.params;
    productName = productName.replace(/-/g, " ");
    try {
        const products = yield prisma_1.prisma.product.findMany({
            where: {
                name: {
                    contains: productName,
                },
            },
            select: {
                id: true,
                name: true,
                price: true,
                cost: true,
                quantity: true,
                operations: true,
            },
        });
        if (!products.length) {
            res.status(400).send({
                message: "There's no product with this params",
            });
        }
        res.status(200).send(products);
    }
    catch (error) {
        if (error instanceof prisma_1.PrismaExc.PrismaClientKnownRequestError) {
            res.status(500).send({
                message: "Couldn't handle the request.",
            });
            throw error;
        }
    }
}));
// UDATE
router.put("/:productId/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const { name, price, cost } = req.body;
    let { quantity } = req.body;
    //REQUEST THE PRODUCT FROM DATA BASE
    const savedProduct = yield product_controller_1.ProductController.GetProductById(Number(productId));
    if (!savedProduct) {
        res.status(400).send({
            message: "Can't find this product in our database",
        });
    }
    // CHECK IF THE NAME IS ALREADY USED IN DATABASE
    const checkName = yield product_controller_1.ProductController.CheckProductExist(name);
    if (checkName === null || checkName === void 0 ? void 0 : checkName.length) {
        res.status(400).send({
            message: "the name already exist, please, choose other name",
        });
        return;
    }
    if (!quantity) {
        quantity = savedProduct === null || savedProduct === void 0 ? void 0 : savedProduct.quantity;
    }
    try {
        yield product_controller_1.ProductController.UpdateProductQuantity(Number(productId), name, cost, price, quantity);
        res.status(200).send({
            message: `Product ${savedProduct === null || savedProduct === void 0 ? void 0 : savedProduct.name} updated to ${name}`,
            data: {
                name: name,
                price: price,
                cost: cost,
                quantity: quantity,
            },
        });
    }
    catch (error) {
        console.log(error);
        if (error instanceof prisma_1.PrismaExc.PrismaClientInitializationError) {
            res.status(500).send({ message: "Couldn't handle the request." });
        }
        throw error;
    }
}));
//DELETE
router.delete("/:productId/delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { productId } = req.params;
    const productCheck = yield product_controller_1.ProductController.GetProductById(Number(productId));
    if (!productCheck) {
        res.status(400).send({
            message: "The product ID doesn't exist",
        });
        return;
    }
    try {
        const deleteProduct = yield prisma_1.prisma.product.delete({
            where: { id: Number(productId) },
        });
        res.status(200).send({ message: `Product ${deleteProduct === null || deleteProduct === void 0 ? void 0 : deleteProduct.name} deleted` });
    }
    catch (error) {
        if (error instanceof prisma_1.PrismaExc.PrismaClientInitializationError) {
            res.status(500).send({ message: "Couldn't handle the request." });
        }
        throw error;
    }
}));
exports.default = router;
