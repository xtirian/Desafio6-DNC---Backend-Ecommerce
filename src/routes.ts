import { Express, Router } from 'express';

function routes(server:Express):void {
  
  const userRouter: Router = require('./routes/customer.ts');
  server.use('/users', userRouter);

  return;
}

export default routes;