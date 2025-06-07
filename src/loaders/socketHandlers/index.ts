import { Server, Socket } from 'socket.io';
import { registerRetroSprintRoomHandler } from './eventHandler';

export default function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    // eslint-disable-next-line no-console
    console.log(`Socket connected: ${socket.id}`);
    registerRetroSprintRoomHandler(io, socket);
    
    socket.on('disconnect', () => {
      // eslint-disable-next-line no-console
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });
}