import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "../utils/prisma";

interface ProductInterface {
  id: number;
  name: string;
  price: Decimal;
  cost: Decimal;
  quantity: number;
}

export class ProductController {
  static async CheckProductExist(
    name: string
  ): Promise<ProductInterface[] | undefined> {
    const productExist = await prisma.product.findMany({
      where: {
        name: name,
      },
    });

    if (productExist) {
      return productExist;
    } else {
      return;
    }
  }

  static async GetProductById(
    id: number
  ): Promise<ProductInterface | undefined> {
    const savedProduct = await prisma.product.findUnique({
      where: {
        id: id,
      },
    });

    if (savedProduct) {
      return savedProduct;
    }

    return;
  }

  static async UpdateProductQuantity(productId:number, name:string, cost:Decimal, price:Decimal, quantity:number){

    

    try {
      await prisma.product.update({
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
    } catch (error) {
      throw error
    }
  
}
}
