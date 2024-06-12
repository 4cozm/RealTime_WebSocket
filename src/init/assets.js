import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let gameAssets = {};//전역변수로 쓸거
export const getGameAssets = () => {
  return gameAssets;
};//보안상 이렇게 쓰는거, 전역변수를 바로 export해도되긴함

const __fileName = fileURLToPath(import.meta.url); //현재파일의 절대경로
const __dirname = path.dirname(__fileName);
//최상위 경로+ assets 폴더
const basePath = path.join(__dirname, '../../assets');
//init폴더에서 뒤로 두칸가서 assets폴더를 찾아라 


//파일은 비동기 병렬로 읽을꺼임
const readFileAsync = (filename) => {
  //파일 이름을 받아서
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(basePath, filename), 'utf8', (err, data) => {
      //fs.readFile에는 3개의 인자를 받음 경로,옵션,콜백
      //경로는 assets폴더를 가리키는 basePath와 인자로 받은 파일이름을 join해서 찾음
      //옵션은 utf8
      //여기서 콜백은 프로미스를 처리하는데 썼음 에러가 발생하면 리젝트,데이터가 있으면 JSON형태로 파싱해서 함수 호출한놈한테 리턴함
      if (err) {
        reject(err);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
};

//readFileAsync 함수를 여기서 써먹을거임
//프로미스 병렬처리
export const loadGameAssets = async () => {
  try {
    const [stages, items, itemUnlocks] = await Promise.all([
      //배열안에 쓰려고 하는 함수들 넣으면댐
      //결과가 완료되면 각각 const [stage, items, itemUnlocks] 안으로 들어감
      readFileAsync('stage.json'),
      readFileAsync('item.json'),
      readFileAsync('item_unlock.json'),
    ]);
    gameAssets = { stages, items, itemUnlocks };
    //다불러왔으면 전역객체로 보냄
    return gameAssets;
  } catch (error) {
    throw new Error('오류 발생' + error.message);
  }
};



