import { Router, Request, Response } from "express";
import { prisma, PrismaExc } from "../utils/prisma";
import { ProductController } from "../controllers/product.controller";

//CREATE PRODUCT
const router = Router();

router.post("/", async (req: Request, res: Response): Promise<void> => {
  const { name, price, cost, quantity } = req.body;

  if (!name || !price || !cost || !quantity) {
    res.status(400).send({
      message: "can't handle this request",
    });
  }

  const productCheck = await ProductController.CheckProductExist(name);

  if (productCheck?.length) {
    res.status(400).send({
      message: "product already exist",
    });
  }

  try {
    // PRISMA ALREADY VERIFY THE DATA TYPE AND IF ALL DATA EXISTS
    const newProduct = await prisma.product.create({
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
  } catch (error) {
    if (error instanceof PrismaExc.PrismaClientKnownRequestError) {
      res.status(500).send({
        message: "Internal error",
      });

      throw error;
    }
  }
});

//GET PRODUCT
router.get("/", async (req: Request, res: Response) => {
  const product = await prisma.product.findMany({
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
});

// GET PRODUCT BY ID
router.get("/:productId", async (req: Request, res: Response) => {
  const {productId} = req.params;

  const product = await prisma.product.findMany({
    where:{
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
});

//GET PRODUCTS BY NAME
router.get("/name=:productName", async (req: Request, res: Response) => {
  let { productName } = req.params;

  productName = productName.replace(/-/g, " ");

  try {
    const products = await prisma.product.findMany({
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
  } catch (error) {
    if (error instanceof PrismaExc.PrismaClientKnownRequestError) {
      res.status(500).send({
        message: "Couldn't handle the request.",
      });

      throw error;
    }
  }
});

// UDATE
router.put("/:productId/update", async (req: Request, res: Response) => {
  const { productId } = req.params;
  const { name, price, cost } = req.body;
  let { quantity } = req.body;

  //REQUEST THE PRODUCT FROM DATA BASE
  const savedProduct = await ProductController.GetProductById(
    Number(productId)
  );

  if (!savedProduct) {
    res.status(400).send({
      message: "Can't find this product in our database",
    });
  }

  // CHECK IF THE NAME IS ALREADY USED IN DATABASE
  const checkName = await ProductController.CheckProductExist(name);

  if (checkName?.length) {
    res.status(400).send({
      message: "the name already exist, please, choose other name",
    });
    return;
  }

  if (!quantity) {
    quantity = savedProduct?.quantity;
  }

  try {
    await ProductController.UpdateProductQuantity(
      Number(productId),
      name,
      cost,
      price,
      quantity
    );

    res.status(200).send({
      message: `Product ${savedProduct?.name} updated to ${name}`,
      data: {
        name: name,
        price: price,
        cost: cost,
        quantity: quantity,
      },
    });
  } catch (error) {
    console.log(error);

    if (error instanceof PrismaExc.PrismaClientInitializationError) {
      res.status(500).send({ message: "Couldn't handle the request." });
    }

    throw error;
  }
});

//DELETE
router.delete("/:productId/delete", async (req: Request, res: Response) => {
  const { productId } = req.params;

  const productCheck = await ProductController.GetProductById(
    Number(productId)
  );

  if (!productCheck) {
    res.status(400).send({
      message: "The product ID doesn't exist",
    });

    return;
  }

  try {
    const deleteProduct = await prisma.product.delete({
      where: { id: Number(productId) },
    });

    res.status(200).send({ message: `Product ${deleteProduct?.name} deleted` });
  } catch (error) {
    if (error instanceof PrismaExc.PrismaClientInitializationError) {
      res.status(500).send({ message: "Couldn't handle the request." });
    }

    throw error;
  }
});

export default router;
