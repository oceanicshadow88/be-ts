import { Server, Socket } from 'socket.io';
import { registerProjectRoomHandler, registerTicketEventHandler } from './eventHandler';

export default function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    registerProjectRoomHandler(io, socket);
    registerTicketEventHandler(io, socket);
    
    socket.on('disconnect', () => {
    });
  });
}