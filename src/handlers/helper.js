//특정 기능을 하는건 아니지만 꼭필요한 함수

import { CLIENT_VERSION } from '../constants';
import { getGameAssets } from '../init/assets';
import { setStage, getStage } from '../models/stage.model';
import { getUser, removeUser } from '../models/user.model';
import handlerMappings from './handlerMapping';

export const handleDisconnect = (socket, uuid) => {
  removeUser(socket.id);
  console.log('유저 연결이 해제되었습니다');
  console.log('남은 유저수 ', getUser());
};
//uuid는 나중에 쓸일 있으므로 일단 놔둠

//레지스터 핸들러에서 실행될 초기 스테이지 관련
export const handleConnection = (socket, uuid) => {
  console.log(`새로운 유저 연결됨 ${uuid} 소켓아이디:${socket.id}`);
  console.log('현재 접속중 유저:', getUser());


  socket.emit('connection', { uuid });
};

export const handlerEvent = (io, socket, data) => {
  //커넥션이 이루어졌을때 호출
  if (!CLIENT_VERSION.includes(data.clientVersion)) {
    socket.emit('response', {
      status: 'fail',
      message: '클라이언트 버전이 다릅니다',
    });
    return;
    //response는 임의로 지은거임 http랑은 조금 다름
  }
  const handler = handlerMappings[data.handlerId];
  if (!handler) {
    socket.emit('response', { status: 'fail' });
    return;
  }

  const response = handler(data.userId, data.payload);

  if (response.broadcast) {
    //모든 유저에게 보내려면 emit에 붙어있는 broadcast를 쓰면됨
    io.emit('response', 'broadcast');
    return;
  }
  socket.emit('response', response);
};
