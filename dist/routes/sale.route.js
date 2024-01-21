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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../utils/prisma");
const axios_1 = __importDefault(require("axios"));
const product_controller_1 = require("../controllers/product.controller");
const customer_controller_1 = require("../controllers/customer.controller");
const router = (0, express_1.Router)();
//CREATE SALE
router.post("/:customerId/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { products } = yield req.body;
    const { customerId } = req.params;
    const checkCustomer = customer_controller_1.CustomerController.GetUserById(Number(customerId));
    if (!checkCustomer) {
        res.status(404).send({ nessage: "This customer doesn't have an account" });
        return;
    }
    let operationList = [];
    let totalPrice = 0;
    try {
        function increaseTotalPrice(quantity, value) {
            const productValue = quantity * value;
            totalPrice += productValue;
        }
        Promise.all(products.map((product) => __awaiter(void 0, void 0, void 0, function* () {
            const checkProduct = yield product_controller_1.ProductController.GetProductById(product.id);
            if (checkProduct) {
                const newOperation = yield axios_1.default.post(`${process.env.URL}operation/create`, {
                    type: "sale",
                    quantity: product.quantity,
                    productId: product.id,
                });
                if (newOperation.status === 201) {
                    operationList.push(newOperation.data.data.id);
                    increaseTotalPrice(product.quantity, Number(checkProduct.price));
                }
            }
        }))).then(() => __awaiter(void 0, void 0, void 0, function* () {
            if (!operationList.length) {
                res.status(400).send({
                    message: "Can't handle the operation with this products",
                });
            }
            if (operationList.length) {
                const newPurchase = yield prisma_1.prisma.sale.create({
                    data: {
                        customerId: Number(customerId),
                        totalPrice: totalPrice,
                        operations: operationList.join(),
                    },
                });
                res.status(201).send(newPurchase);
            }
        }));
    }
    catch (error) {
        if (error instanceof prisma_1.PrismaExc.PrismaClientKnownRequestError) {
            res.status(500).send(error);
        }
        throw error;
    }
}));
//GET ALL SALES
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const purchasesList = yield prisma_1.prisma.sale.findMany({
            select: {
                id: true,
                operations: true,
                totalPrice: true
            }
        });
        res.status(200).send(purchasesList);
    }
    catch (error) {
        if (error instanceof prisma_1.PrismaExc.PrismaClientKnownRequestError) {
            res.status(500).send({
                message: "the server couldn't handle this request"
            });
        }
    }
}));
//GET ONE SALE
router.get("/:saleId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { saleId } = req.params;
    try {
        const sales = yield prisma_1.prisma.purchase.findUnique({
            where: {
                id: Number(saleId)
            },
            select: {
                id: true,
                operations: true,
                totalCost: true
            }
        });
        res.status(200).send(sales);
    }
    catch (error) {
        if (error instanceof prisma_1.PrismaExc.PrismaClientKnownRequestError) {
            res.status(500).send({
                message: "the server couldn't handle this request"
            });
        }
    }
}));
exports.default = router;
