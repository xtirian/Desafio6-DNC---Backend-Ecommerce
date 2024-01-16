import { prisma } from "../utils/prisma";

export class CustomerController {
  static async CheckUserByEmail(email: string): Promise<Object | null> {
    const oldUser = await prisma.customer.findUnique({
      where: {
        email: email,
      },
    });
    
    return oldUser
  }
}
