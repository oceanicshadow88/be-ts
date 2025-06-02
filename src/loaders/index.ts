const expressLoader = require('./express');
const socketLoader = require('./socket');
const serverLoader = require('./server');
const mongooseLoader = require('./mongoose');

exports.init = () => {
  const app = expressLoader();
  const { httpServer, io } = socketLoader(app);
  serverLoader(httpServer, io);
  mongooseLoader();
};
