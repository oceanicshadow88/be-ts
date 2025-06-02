import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import express from 'express';

module.exports = (app: express.Application) => {
	const httpServer = http.createServer(app);

	const io = new SocketIOServer(httpServer, {
		cors: {
		origin: '*',
		methods: ['GET', 'POST'],
		credentials: true,
		}
	});

	return { httpServer, io };
};