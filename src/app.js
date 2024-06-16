import express from 'express';
import { createServer } from 'http';
import initSocket from './init/socket.js';
import { loadGameAssets } from './init/assets.js';
import { readFileAsync } from './init/assets.js';

export let assets = null;

const app = express();
const server = createServer(app);

const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
initSocket(server);

app.get('/assets/:fileName', async (req, res) => {
  try {
    const data = await readFileAsync(`${req.params.fileName}.json`);
    res.json(data);
  } catch (err) {
    res.status(500).send('Error reading file');
  }
});

server.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  try {
    assets = await loadGameAssets();
    console.log(assets);
    console.log('Assets loaded successfully');
  } catch (error) {
    console.error('Failed to load game assets:', error);
  }
});
