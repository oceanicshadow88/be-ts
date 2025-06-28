import { Server, Socket } from 'socket.io';
import { 
  registerRetroSprintRoomHandler,
  registerRetroItemBoardcastHandler,
} from './eventHandler';

export default function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    registerRetroSprintRoomHandler(io, socket);
    registerRetroItemBoardcastHandler(io, socket);
    
    socket.on('disconnect', () => {
    });
  });
}