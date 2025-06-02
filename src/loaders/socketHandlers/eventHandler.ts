import { Server, Socket } from "socket.io";

// Allocate users to the project room
function registerProjectRoomHandler(io: Server, socket: Socket) {
  socket.on("join_project", (projectId: string) => {
    socket.join(`project-${projectId}`);
    console.log(`👤 ${socket.id} joined room: project-${projectId}`);
  });
}

// Update ticket to all users in the project room
function registerTicketEventHandler(io: Server, socket: Socket) {
  socket.on("ticket_updated", (data) => {
    const { projectId, ticket } = data;
    if (!projectId) return;
    io.to(`project-${projectId}`).emit("ticket_updated", ticket);
  });
}

export {registerProjectRoomHandler, registerTicketEventHandler};