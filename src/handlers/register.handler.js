//유저등록하는 핸들러?
import { addUser } from '../models/user.model.js';
import { v4 as uuidv4 } from 'uuid';
import { handleConnection, handleDisconnect, handlerEvent } from './helper.js';

const registerHandler = (io) => {
  io.on('connection', (socket) => {
    //io.on은 서버에서 'connection'이 일어나는 모든 유저를 대상으로 이벤트 처리
    //유저관리니까 UUID나 소켓ID를 저장해줘야함
    //저장하는 저장소를 하나 만들던지 해야함

    const userUUID = uuidv4();
    addUser({ uuid: userUUID, socketid: socket.id });

    handleConnection(socket , userUUID);
    


    socket.on('event',()=>handlerEvent(io,socket,data));//'event'가 들어오면 여기서 처리해
    //유저가 접속 해제시 이벤트
    //socket.on은 하나의 유저를 대상으로 일어나는 이벤트
    socket.on('disconnect', (socket) => handleDisconnect(socket,userUUID));
    //handleDisconnect에서 현재는 쓰진 않지만 userUUID를 일단은 넘김(원래 자주씀)
  });
};

export default registerHandler;
