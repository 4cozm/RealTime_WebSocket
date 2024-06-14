import { CLIENT_VERSION } from './Constants.js';
import { getScoreInstance } from './index.js';
const socket = io('http://43.201.255.34 :3000', {
  query: {
    clientVersion: CLIENT_VERSION,
  },
});

let userId = null;
socket.on('response', (data) => {
  console.log(data);
});

socket.on('highScore',(data=>{
  console.log("서버로 부터 새로운 최고기록 받음");
  const score = getScoreInstance();
  score.updateHighScore(data.highScore);
  //여기서 받아온 데이터 정보에 접촉, highscore를 바꿔줌
}))

socket.on('connection', (data) => {
  console.log('connection: ', data);
  userId = data.uuid;
  const score = getScoreInstance();
  score.updateHighScore(data.highScore);
});

const sendEvent = (handlerId, payload) => {
  socket.emit('event', {
    userId,
    clientVersion: CLIENT_VERSION,
    handlerId,
    payload,
  });
};

const sendHighScore = (score) =>{
  socket.emit('newHighScore',{score});
  console.log('서버로 최고 점수 전송');
}

export { sendEvent,sendHighScore };
