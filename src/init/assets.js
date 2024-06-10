import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __fileName = fileURLToPath(import.meta.url); //현재파일의 절대경로
const __dirname = path.dirname(__fileName);
//최상위 경로+ assets 폴더
const basePath = path.join(__dirname, '../../assets');

//파일을 읽는 함수
const readFileAsync = (filename) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, filename), 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

//프로미스 병렬처리
export const loadGameAssets = async () => {
  try {
    const [stage, items, itemUnlocks] = await Promise.all([
      readFileAsync('stage.json'),
      readFileAsync('item.json'),
      readFileAsync('item_unlock.json'),
    ]);
    gameAssets = { stage, items, itemUnlocks };
    return gameAssets;
  } catch (error) {
    throw new Error('오류 발생' + error.message);
  }
};

let gameAssets = {};

export const getGameAssets = () => {
  return gameAssets;
};
