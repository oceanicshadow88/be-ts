import { Server, Socket } from 'socket.io';

// Allocate users to the project room
function registerRetroSprintRoomHandler(io: Server, socket: Socket) {
  socket.on('join_retro_sprint_room', (sprintId: string) => {
    // eslint-disable-next-line no-console
    console.log(`User joined retro sprint room: ${sprintId}`);
    socket.join(`retro_sprint_room_${sprintId}`);
  });
}

function registerRetroItemBoardcastHandler(io: Server, socket: Socket) {
  socket.on('retro_item_boardcast', (sprintId: string) => {
    // eslint-disable-next-line no-console
    console.log(`Broadcasting retro items for sprint: ${sprintId}`);
    io.to(`retro_sprint_room_${sprintId}`).emit('retro_item_updated', sprintId);
  });
}
export { 
  registerRetroSprintRoomHandler,
  registerRetroItemBoardcastHandler,
};