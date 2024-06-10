import express from 'express';
import { createServer } from 'http';
import initSoket from './init/socket.js';

const app = express();
const server = createServer(app);

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
initSoket(server);
server.listen(PORT, () => {
  console.log('서버가 3000포트에서 열렸습니다');
});
