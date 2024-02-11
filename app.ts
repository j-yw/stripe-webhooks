// app.ts
import express, { Request, Response } from 'express';

const app = express();
const port = 3000; // Choose the port you want to run your server on

app.get('/', (req: Request, res: Response) => {
  res.send('Hello, Express with TypeScript!');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});

