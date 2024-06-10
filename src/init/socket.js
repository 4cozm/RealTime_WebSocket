import {Server as SocketIO} from 'socket.io';

export const initSoket = (server)=>{
    const io = new SocketIO();
    io.attach(server);
}

export default initSoket;