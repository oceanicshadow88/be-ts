import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import registerSocketHandlers from './socketHandlers';
import config from '../app/config/app';

module.exports = (httpServer: HttpServer, io: SocketIOServer) => {
  registerSocketHandlers(io);

  httpServer.listen(config.port, () => {
  // eslint-disable-next-line no-console
    console.log(`⚡️[server]: Server is running at http://localhost:${config.port}`);
  }).on('error', (e:any) => {
  // eslint-disable-next-line no-console
    console.log('Error', e);
  });
};