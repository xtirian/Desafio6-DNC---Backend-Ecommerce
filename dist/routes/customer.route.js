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
        const customer = yield prisma_1.prisma.customer.findMany({
            select: {
                name: true,
                email: true,
            }
        });
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
        if (error instanceof prisma_1.PrismaExc.PrismaClientKnownRequestError) {
            res.status(500);
            throw error;
        }
    }
}));
//GET WITH ID
router.get("/account/:customerId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { customerId } = req.params;
        if (customerId) {
            const customer = yield prisma_1.prisma.customer.findUnique({
                where: {
                    id: Number(customerId),
                },
                select: {
                    name: true,
                    email: true,
                    sales: true
                }
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
        if (error instanceof prisma_1.PrismaExc.PrismaClientKnownRequestError) {
            res.status(500);
            throw error;
        }
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
// PUT TO UPDATE NAME AND EMAIL
router.put("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, name } = req.body;
    //can only update the name and e-mail with this route
    const customer = yield prisma_1.prisma.customer.update({
        where: {
            email: email,
        },
        data: {
            email: email,
            name: name,
        },
    });
}));
// PUT TO UPDATE THE PASSWORD
router.put("/password/:customerId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customerId } = req.params;
    const { oldPassword, newPassword } = req.body;
    const getCustomer = yield customer_controller_1.CustomerController.GetUserById(Number(customerId));
    if (!getCustomer) {
        res.status(404).send({
            message: "customer not found",
        });
    }
    const bdPassword = getCustomer === null || getCustomer === void 0 ? void 0 : getCustomer.password;
    const checkOldPassword = () => bdPassword && bcrypt_1.default.compareSync(oldPassword, bdPassword);
    // ENCRYPTING THE PASSWORD
    if (checkOldPassword()) {
        const saltRounds = 12;
        const hash = bcrypt_1.default.hashSync(newPassword, saltRounds);
        // Change the password
        try {
            yield prisma_1.prisma.customer.update({
                where: {
                    id: Number(customerId),
                },
                data: {
                    password: hash,
                },
            });
            res.status(200).send({
                message: "Customer updated succefully",
                data: {
                    name: getCustomer === null || getCustomer === void 0 ? void 0 : getCustomer.name,
                    email: getCustomer === null || getCustomer === void 0 ? void 0 : getCustomer.email,
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
    }
}));
//DELETE
router.delete("/account/:customerId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customerId } = req.params;
    const { password } = req.body;
    const getCustomer = yield customer_controller_1.CustomerController.GetUserById(Number(customerId));
    if (!getCustomer) {
        res.status(404).send({
            message: "customer not found",
        });
    }
    const bdPassword = getCustomer === null || getCustomer === void 0 ? void 0 : getCustomer.password;
    const checkOldPassword = () => bdPassword && bcrypt_1.default.compareSync(password, bdPassword);
    // ENCRYPTING THE PASSWORD
    if (checkOldPassword()) {
        try {
            yield prisma_1.prisma.customer.delete({
                where: {
                    id: Number(customerId),
                },
            });
            res.status(200).send({
                message: "Customer deleted succefully",
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
    }
}));
exports.default = router;
