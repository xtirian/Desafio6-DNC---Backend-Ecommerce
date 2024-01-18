import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../utils/prisma";
import { ProductController } from "./product.controller";

export class OperationController {
  static CheckPorductAvaliability(
    type: string,
    operationQuantity: number,
    actualQuantity: number
  ): number {
    if (type == "sale") {
      return actualQuantity - operationQuantity;
    }

    return actualQuantity + operationQuantity;
  }

  static async undoOperation(
    operationId: number,
    newQuantity: number
  ): Promise<boolean> {
    const checkOperation = await prisma.operation.findUnique({
      where: {
        id: operationId,
      },
    });

    if (!checkOperation) {
      return false;
    }

    const getProduct = await ProductController.GetProductById(
      Number(checkOperation.productId)
    );

    if (!getProduct) {
      return false;
    }

    if (checkOperation.type === "sale") {
      const originalQuantityofProduct =
        getProduct.quantity + checkOperation.quantity;

      //check if the updated stock can fulfill the need of the new quantity
      const newQuantityCheck = this.CheckPorductAvaliability(
        checkOperation.type,
        newQuantity,
        originalQuantityofProduct
      );

      if(!newQuantityCheck){
        return false
      }

      if (newQuantityCheck) {
        await prisma.product.update({
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
      const originalQuantityofProduct =
        getProduct.quantity - checkOperation.quantity;

      //check if the updated stock can fulfill the need of the new quantity
      const newQuantityCheck = this.CheckPorductAvaliability(
        checkOperation.type,
        newQuantity,
        originalQuantityofProduct
      );

      if(!newQuantityCheck){
        return false
      }

      await prisma.product.update({
        where: {
          id: checkOperation.productId,
        },
        data: {
          quantity: originalQuantityofProduct + newQuantity,
        },
      });
    }

    return true;
  }
}
