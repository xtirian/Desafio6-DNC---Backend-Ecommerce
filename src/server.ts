import express from 'express';
import { Request, Response } from 'express';
const app = express();

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'hello world with Typescript' })
})



app.listen(3333, () => 'server running on port 3333')
