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
exports.ProductController = void 0;
const prisma_1 = require("../utils/prisma");
class ProductController {
    static CheckProductExist(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const productExist = yield prisma_1.prisma.product.findMany({
                where: {
                    name: name,
                },
            });
            if (productExist) {
                return productExist;
            }
            else {
                return;
            }
        });
    }
    static GetProductById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const savedProduct = yield prisma_1.prisma.product.findUnique({
                where: {
                    id: id,
                },
            });
            if (savedProduct) {
                return savedProduct;
            }
            return;
        });
    }
    static UpdateProductQuantity(productId, name, cost, price, quantity) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield prisma_1.prisma.product.update({
                    where: {
                        id: productId,
                    },
                    data: {
                        name: name,
                        cost: cost,
                        price: price,
                        quantity: quantity,
                    },
                });
                return;
            }
            catch (error) {
                throw error;
            }
        });
    }
}
exports.ProductController = ProductController;
