import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { prisma, PrismaExc } from "../utils/prisma";
import { CustomerController } from "../controllers/customer.controller";

const router = Router();

/**GET */

router.get("/", async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.findMany();

    if (!customer.length) {
      res.status(500).send({
        message: "Internal error",
      });
    }

    if (customer) {
      res.status(200).send(customer);

      return;
    }
  } catch (error) {
    console.error(error);

    return;
  }
});

router.get("/:customerId", async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    if (customerId) {
      const customer = await prisma.customer.findUnique({
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
  } catch (error) {
    console.error(error);

    return;
  }
});

/** POST */

router.post("/", async (req: Request, res: Response) => {
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
  const userCheck = await CustomerController.CheckUserByEmail(email);

  if (userCheck) {
    res.status(400).send({ message: "The user already exist." });

    return;
  }

  // ENCRYPTING THE PASSWORD
  const saltRounds = 12;

  const hash = bcrypt.hashSync(password, saltRounds);

  const newCustomer = {
    email: email,
    name: name,
    password: hash,
  };

  try {
    await prisma.customer.create({ data: newCustomer });

    res.status(201).send({
      message: "Customer created succefully",
      data: {
        name: newCustomer.name,
        email: newCustomer.email,
      },
    });

    return;
  } catch (error) {
    if (error instanceof PrismaExc.PrismaClientKnownRequestError) {
      res.status(500).send({
        message: "Internal Server Error",
        error: error.code,
      });

      throw error;
    }

    return;
  }
});

export default router;
