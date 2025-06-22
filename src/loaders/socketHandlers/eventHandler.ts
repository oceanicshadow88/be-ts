import { Server, Socket } from 'socket.io';

// Allocate users to the project room
function registerRetroSprintRoomHandler(io: Server, socket: Socket) {
  socket.on('join_retro_sprint_room', (sprintId: string) => {
    socket.join(`retro_sprint_room_${sprintId}`);
  });
}

function registerRetroItemBoardcastHandler(io: Server, socket: Socket) {
  socket.on('retro_item_boardcast', (sprintId: string) => {
    io.to(`retro_sprint_room_${sprintId}`).emit('retro_item_updated', sprintId);
  });
}
export { 
  registerRetroSprintRoomHandler,
  registerRetroItemBoardcastHandler,
};