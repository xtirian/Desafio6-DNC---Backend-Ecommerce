import { Router, Request, Response } from "express";
import { prisma, PrismaExc } from "../utils/prisma";
import axios from "axios";
import { ProductController } from "../controllers/product.controller";

interface productListInterface {
  products: {
    id: number;
    quantity: number;
  }[];
}

const router = Router();

//CREATE PURCHASE
router.post("/create", async (req: Request, res: Response) => {
  const { products }: productListInterface = await req.body;

  let operationList: number[] = [];
  let totalCost = 0;

  try {
    function increaseTotalCost(quantity: number, value: number) {
      const productValue = quantity * value;

      totalCost += productValue;
    }

    Promise.all(
      products.map(async (product): Promise<void> => {
        const checkProduct = await ProductController.GetProductById(product.id);

        if (checkProduct) {
          const newOperation = await axios.post(
            `${process.env.URL}operation/create`,
            {
              type: "purchase",
              quantity: product.quantity,
              productId: product.id,
            }
          );
          if (newOperation.status === 200) {
            operationList.push(newOperation.data.data.id);

            increaseTotalCost(product.quantity, Number(checkProduct.cost));
          }
        }
      })
    ).then(async () => {
      if (!operationList.length) {
        res.status(400).send({
          message: "Can't handle the operation with this products",
        });
      }
  
      if (operationList.length) {
        const newPurchase = await prisma.purchase.create({
          data: {
            totalCost: totalCost,
            operations: operationList.join(),
          },
        });
  
        res.status(201).send(newPurchase);
      }

    });

    
  } catch (error) {
    if (error instanceof PrismaExc.PrismaClientKnownRequestError) {
      res.status(500).send(error);
    }

    throw error;
  }
});

//GET ALL PURCHASES
router.get("/", async (req: Request, res: Response) => {


  try {
    const purchasesList =
    await prisma.purchase.findMany({
      select:{
        id: true,
        operations: true,
        totalCost: true
      }
    })

    res.status(200).send(purchasesList)

    
    
  } catch (error) {
    if(error instanceof PrismaExc.PrismaClientKnownRequestError){
      res.status(500).send({
        message: "the server couldn't handle this request"
      })
    }
  }


});


//GET ONE PURCHASE
router.get("/:purchaseId", async (req: Request, res: Response) => {

  const {purchaseId} = req.params;



  try {
    const purchases =
    await prisma.purchase.findUnique({
      where:{
        id: Number(purchaseId)
      },
      select:{
        id: true,
        operations: true,
        totalCost: true
      }
    })

    res.status(200).send(purchases)

    
    
  } catch (error) {
    if(error instanceof PrismaExc.PrismaClientKnownRequestError){
      res.status(500).send({
        message: "the server couldn't handle this request"
      })
    }
  }


});

export default router;
