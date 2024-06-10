import {Server as SocketIO} from 'socket.io';
import registerHandler from '../handlers/register.handler';

export const initSoket = (server)=>{
    const io = new SocketIO();
    io.attach(server);

    registerHandler(io);
}

export default initSoket;