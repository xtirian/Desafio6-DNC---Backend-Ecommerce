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
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = require("../utils/prisma");
const customer_controller_1 = require("../controllers/customer.controller");
const router = (0, express_1.Router)();
/**GET */
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const customer = yield prisma_1.prisma.customer.findMany();
        if (!customer.length) {
            res.status(500).send({
                message: "Internal error",
            });
        }
        if (customer) {
            res.status(200).send(customer);
            return;
        }
    }
    catch (error) {
        console.error(error);
        return;
    }
}));
router.get("/:customerId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId } = req.params;
        if (customerId) {
            const customer = yield prisma_1.prisma.customer.findUnique({
                where: {
                    id: Number(customerId),
                },
            });
            if (!customer) {
                res
                    .status(404)
                    .send({ message: "Can't find this user in our Database" });
            }
            res.status(200).send(customer);
        }
    }
    catch (error) {
        console.error(error);
        return;
    }
}));
/** POST */
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, name, password } = req.body;
    //Check if the data came in the body
    if (!email.length || !password.length) {
        res.status(400).send({
            message: "We couldn't continue without the e-mail and password",
        });
        return;
    }
    // As the name isn't required, and the user can change after, here we create a default name for the user when it doens fulfill the form
    if (!name.length) {
        name = "nome indefinido";
    }
    // Check if the user already exist and continue just if the user doesn't exist
    const userCheck = yield customer_controller_1.CustomerController.CheckUserByEmail(email);
    if (userCheck) {
        res.status(400).send({ message: "The user already exist." });
        return;
    }
    // ENCRYPTING THE PASSWORD
    const saltRounds = 12;
    const hash = bcrypt_1.default.hashSync(password, saltRounds);
    const newCustomer = {
        email: email,
        name: name,
        password: hash,
    };
    try {
        yield prisma_1.prisma.customer.create({ data: newCustomer });
        res.status(201).send({
            message: "Customer created succefully",
            data: {
                name: newCustomer.name,
                email: newCustomer.email,
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
            throw error;
        }
        return;
    }
}));
exports.default = router;
