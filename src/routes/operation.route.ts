import { Router, Request, Response } from "express";
import { prisma, PrismaExc } from "../utils/prisma";
import { ProductController } from "../controllers/product.controller";
import { OperationController } from "../controllers/operation.controller";

const router = Router();

//CREATE
router.post("/create", async (req: Request, res: Response) => {
  const { type, quantity, productId } = req.body;

  // check type operation
  if (type !== "sale") {
    if (type !== "purchase") {
      res.status(400).send({
        message: "types alloweds are 'sale' or 'purchase'.",
      });

      return;
    }
  }

  //check if the product exist in db
  const checkProduct = await ProductController.GetProductById(
    Number(productId)
  );

  if (!checkProduct) {
    res.status(400).send({
      message: "Couldn't find the product in our database. Check the id.",
    });

    return;
  }

  // check if the quantity avaliable match if the operation's need. If the type is sale and the sale and the avaliability don't fulfill the operation need, will return a message that can't generate this operation

  const quantityCheck = OperationController.CheckPorductAvaliability(
    type,
    quantity,
    checkProduct.quantity
  );

  if (quantityCheck < 0) {
    res.status(400).send({
      message: "This operation exceed the quantity avaliable in the stock.",
    });

    return;
  }

  try {
    const createOperation = await prisma.operation.create({
      data: {
        type: type,
        quantity: quantity,
        productId: productId,
      },
    });

    if (createOperation) {
      await ProductController.UpdateProductQuantity(
        productId,
        checkProduct.name,
        checkProduct.cost,
        checkProduct.price,
        quantityCheck
      );
    }

    res.status(201).send({
      message: "Operation created!",
      data: {
        id: createOperation.id,
        product: checkProduct.name,
        productId: createOperation.productId,
        quantity: quantity,
        price: checkProduct.price,
        cost: checkProduct.cost
      },
    });

    return;
  } catch (error) {
    if (error instanceof PrismaExc.PrismaClientKnownRequestError) {
      res.status(500).send({
        message: "Internal Server Error",
        error: error.code,
      });
    }

    throw error;
  }
});

// READ

router.get("/", async (req: Request, res: Response) => {
  try {
    const allOperations = await prisma.operation.findMany();

    res.status(200).send(allOperations);
  } catch (error) {
    if (error instanceof PrismaExc.PrismaClientKnownRequestError) {
      res.status(500).send({
        message: "Internal Server Error",
        error: error.code,
      });
    }

    throw error;
  }
});

// UPDATE

router.put("/:operationId/update", async (req: Request, res: Response) => {
  const { operationId } = req.params;

  const { newQuantity } = req.body;

  const checkOperation = OperationController.undoOperation(
    Number(operationId),
    newQuantity
  );

  if (!checkOperation) {
    res.status(400).send({
      message: "Can't find the operation, verify the Id you want",
    });

    return;
  }

  try {
    const operationUpdate = await prisma.operation.update({
      where: {
        id: Number(operationId),
      },
      data: {
        quantity: newQuantity,
      },
    });

    res.status(200).send({ message: "operation umpdated succefully" });
  } catch (error) {
    res.status(500).send(error);

    throw error;
  }
});

// DELETE
router.delete("/:operationId/delete", async (req: Request, res: Response) => {
  const { operationId } = req.params;

  try {
    await prisma.operation.delete({
      where: {
        id: Number(operationId),
      },
    });
  } catch (error) {
    if (error instanceof PrismaExc.PrismaClientKnownRequestError) {
      res.status(500).send(error);
    }

    throw error;
  }
});

export default router;
