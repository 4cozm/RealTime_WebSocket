import { getUsers, removeUser } from '../models/user.model.js';
import { CLIENT_VERSION } from '../constants.js';
import handlerMappings from './handlerMapping.js';
import { createStage } from '../models/stage.model.js';
import { getScore, setScore } from '../models/highScore.model.js';

export const handleConnection = (socket, userUUID) => {
  console.log(`New user connected: ${userUUID} with socket ID ${socket.id}`);
  console.log('Current users:', getUsers());

  // 스테이지 빈 배열 생성
  createStage(userUUID);

  socket.emit('connection', { uuid: userUUID , highScore:getScore()});
};

export const handleDisconnect = (socket, uuid) => {
  removeUser(socket.id); // 사용자 삭제
  console.log(`User disconnected: ${socket.id}`);
  console.log('Current users:', getUsers());
};

export const handleEvent = (io, socket, data) => {
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    socket.emit('response', { status: 'fail', message: 'Client version mismatch' });
    return;
  }

  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', { status: 'fail', message: 'Handler not found' });
    return;
  }

  const response = handler(data.userId, data.payload);
  if (response.broadcast) {
    io.emit('response', response.payload);
    return;
  }
  socket.emit('response', response);
};
 
export const handleHighScore = (io,data) =>{
  console.log("최고점수 받음 데이터 반영!");
  console.log(data);
  console.log(data.score , getScore()+ "잘나오나용");
    if (data.score > getScore()) {
        setScore(data.score);
        console.log("모든 클라에게 새 점수 보내기")
        io.emit('highScore', { highScore:data.score });
    }
}
