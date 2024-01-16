import { Express, Router } from "express";
import CustomerRoute from './routes/customer.route'

function routes(server: Express): void {
  try {
    

    server.use("/customer", CustomerRoute);

    return;
  } catch (error) {
    console.error(error);
  }
}

export default routes;