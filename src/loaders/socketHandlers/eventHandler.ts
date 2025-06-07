import { Server, Socket } from 'socket.io';

// Allocate users to the project room
function registerRetroSprintRoomHandler(io: Server, socket: Socket) {
  socket.on('join_retro_sprint_room', (sprintId: string) => {
    socket.join(`retro_sprint_room_${sprintId}`);
  });
}

export { 
  registerRetroSprintRoomHandler,
};