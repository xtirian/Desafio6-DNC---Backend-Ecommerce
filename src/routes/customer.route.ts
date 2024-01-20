import { Router, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { prisma, PrismaExc } from "../utils/prisma";
import { CustomerController } from "../controllers/customer.controller";

const router = Router();

/**GET */

router.get("/", async (req: Request, res: Response) => {
  try {
    const customer = await prisma.customer.findMany({
      select: {
        name: true,
        email:true,
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
  } catch (error) {
    if (error instanceof PrismaExc.PrismaClientKnownRequestError) {
      res.status(500);
      throw error;
    }
  }
});

//GET WITH ID

router.get("/account/:customerId", async (req: Request, res: Response) => {
  try {
    const { customerId } = req.params;

    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: {
          id: Number(customerId),
        },
        select: {
          name: true,
          email:true,
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
  } catch (error) {
    if (error instanceof PrismaExc.PrismaClientKnownRequestError) {
      res.status(500);

      throw error;
    }
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


// PUT TO UPDATE NAME AND EMAIL
router.put("/", async (req: Request, res: Response) => {
  const { email, name } = req.body;

  //can only update the name and e-mail with this route
  const customer = await prisma.customer.update({
    where: {
      email: email,
    },
    data: {
      email: email,
      name: name,
    },
  });
});


// PUT TO UPDATE THE PASSWORD
router.put("/password/:customerId", async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const { oldPassword, newPassword } = req.body;

  const getCustomer = await CustomerController.GetUserById(Number(customerId));

  if (!getCustomer) {
    res.status(404).send({
      message: "customer not found",
    });
  }

  const bdPassword = getCustomer?.password;

  const checkOldPassword = () =>
    bdPassword && bcrypt.compareSync(oldPassword, bdPassword);

  // ENCRYPTING THE PASSWORD

  if (checkOldPassword()) {
    const saltRounds = 12;

    const hash = bcrypt.hashSync(newPassword, saltRounds);

    // Change the password

    try {
      await prisma.customer.update({
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
          name: getCustomer?.name,
          email: getCustomer?.email,
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
  }
});



//DELETE
router.delete("/account/:customerId", async (req: Request, res: Response) => {
  const { customerId } = req.params;
  const { password } = req.body;

  const getCustomer = await CustomerController.GetUserById(Number(customerId));

  if (!getCustomer) {
    res.status(404).send({
      message: "customer not found",
    });
  }

  const bdPassword = getCustomer?.password;

  const checkOldPassword = () =>
    bdPassword && bcrypt.compareSync(password, bdPassword);

  // ENCRYPTING THE PASSWORD
  if (checkOldPassword()) {
    try {
      await prisma.customer.delete({
        where: {
          id: Number(customerId),
        },
      });

      res.status(200).send({
        message: "Customer deleted succefully",
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
  }
});

export default router;
