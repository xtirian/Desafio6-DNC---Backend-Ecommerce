import { prisma } from "../utils/prisma";

interface CustomerInterface {
  id: number;
  email: string;
  name: string | null;
  password: string;
}

export class CustomerController {
  static async CheckUserByEmail(
    email: string
  ): Promise<CustomerInterface | undefined> {
    const oldUser = await prisma.customer.findUnique({
      where: {
        email: email,
      },
    });

    if (oldUser) {
      return oldUser;
    } else {
      return;
    }
  }

  static async GetUserById(id: number): Promise<CustomerInterface|undefined> {
    const oldUser = await prisma.customer.findUnique({
      where: {
        id: id,
      },
    });

    if(!oldUser){
      return;
    }

    return oldUser;
  }
}
