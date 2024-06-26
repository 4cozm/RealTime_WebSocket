// assets.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const basePath = path.join(__dirname, '../../assets');
let gameAssets = {}; // 전역함수로 선언

export const readFileAsync = (filename) => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(basePath, filename);
    console.log(`Reading file: ${filePath}`);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        console.error(`Error reading file: ${filePath}`, err);
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

export const loadGameAssets = async () => {
  try {
    const [stages, items, itemUnlocks] = await Promise.all([
      readFileAsync('stage.json'),
      readFileAsync('item.json'),
      readFileAsync('item_unlock.json'),
    ]);
    gameAssets = { stages, items, itemUnlocks };
    return gameAssets;
  } catch (error) {
    throw new Error('Failed to load game assets: ' + error.message);
  }
};

export const getGameAssets = () => {
  return gameAssets;
};
