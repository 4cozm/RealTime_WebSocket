import express from 'express';
import { createServer } from 'http';
import initSoket from './init/socket.js';
import { loadGameAssets } from './init/assets.js';

const app = express();
const server = createServer(app);

const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
initSoket(server);


server.listen(PORT,async () => {
  console.log('서버가 3000포트에서 열렸습니다');

  //파일 미리 로드
  try{
    const assets =await loadGameAssets();
    console.log(assets);
  }catch(error){
    console.error(error);
  }
});
