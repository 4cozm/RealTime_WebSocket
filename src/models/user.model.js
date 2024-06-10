//메모리에 새로 등록한 사람들
//users라는 배열만 관리하는 파일임

import { Socket } from 'socket.io';

//실제 UUID를 부여하는 그런 행위들은 핸들러에서 하는게 맞다
const users = [];
export const addUser = (user) => {
  users.push(user);
};

//유저가 자리를 비우거나 하면 제거할수 있게
export const removeUser = (SocketId) => {
  const index = users.findIndex((user) => user.SocketId === SocketId);
  if(index !== -1){
    return users.splice(index,1)[0];
  }
};

export const getUser = () => {
  return users;
};
