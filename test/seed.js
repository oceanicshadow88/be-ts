const Board = require('../src/app/model/board');
const Status = require('../src/app/model/status');
const Ticket = require('../src/app/model/ticket');
const Sprint = require('../src/app/model/sprint');
const { BOARD_SEED } = require('./fixtures/board');
const { STATUS_SEED } = require('./fixtures/statuses');
const { getTickets } = require('./fixtures/ticketet');
const { SPRINT_SEED } = require('./fixtures/sprint');

module.exports = async (dbConnection) => {
  await Board.getModel(dbConnection).create(BOARD_SEED);
  await Status.getModel(dbConnection).create(STATUS_SEED);
  await Ticket.getModel(dbConnection).create(getTickets());
  await Sprint.getModel(dbConnection).create(SPRINT_SEED);
};
