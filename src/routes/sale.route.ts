import { Router, Request, Response } from "express";
import { prisma, PrismaExc } from "../utils/prisma";
import axios from "axios";
import { ProductController } from "../controllers/product.controller";
import { CustomerController } from "../controllers/customer.controller";

interface productListInterface {
  products: {
    id: number;
    quantity: number;
  }[];
}

const router = Router();

//CREATE SALE
router.post("/:customerId/create", async (req: Request, res: Response) => {
  const { products }: productListInterface = await req.body;

  const {customerId} = req.params;

  const checkCustomer = CustomerController.GetUserById(Number(customerId));


  if(!checkCustomer){
    res.status(404).send({nessage: "This customer doesn't have an account"});

    return ;
  }


  let operationList: number[] = [];
  let totalPrice = 0;

  try {
    function increaseTotalPrice(quantity: number, value: number) {
      const productValue = quantity * value;

      totalPrice += productValue;
    }

    Promise.all(
      products.map(async (product): Promise<void> => {
        const checkProduct = await ProductController.GetProductById(product.id);

        if (checkProduct) {
          const newOperation = await axios.post(
            `${process.env.URL}operation/create`,
            {
              type: "sale",
              quantity: product.quantity,
              productId: product.id,
            }
          );
          if (newOperation.status === 201) {
            operationList.push(newOperation.data.data.id);

            increaseTotalPrice(product.quantity, Number(checkProduct.price));
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
        const newPurchase = await prisma.sale.create({
          data: {
            customerId: Number(customerId),
            totalPrice: totalPrice,
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

//GET ALL SALES
router.get("/", async (req: Request, res: Response) => {


  try {
    const purchasesList =
    await prisma.sale.findMany({
      select:{
        id: true,
        operations: true,
        totalPrice: true
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


//GET ONE SALE
router.get("/:saleId", async (req: Request, res: Response) => {

  const {saleId} = req.params;



  try {
    const sales =
    await prisma.purchase.findUnique({
      where:{
        id: Number(saleId)
      },
      select:{
        id: true,
        operations: true,
        totalCost: true
      }
    })

    res.status(200).send(sales)

    
    
  } catch (error) {
    if(error instanceof PrismaExc.PrismaClientKnownRequestError){
      res.status(500).send({
        message: "the server couldn't handle this request"
      })
    }
  }


});

export default router;
