import { Express, Router } from "express";
import CustomerRoute from './routes/customer.route'
import ProductRouter from './routes/product.route'
import OperationRouter from './routes/operation.route'

function routes(server: Express): void {
  try {    

    server.use("/customer", CustomerRoute);
    server.use("/product", ProductRouter);
    server.use("/operation", OperationRouter);

    return;
  } catch (error) {
    throw error;
  }
}

export default routes;