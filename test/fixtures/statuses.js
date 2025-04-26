import { BOARD_SEED } from './board';

const STATUS_SEED = [
  {
    _id: '6350d443bddbe8fed0138ff4',
    name: 'to do',
    slug: 'to-do',
    order: 0,
    board: BOARD_SEED._id,
  },
  {
    _id: '6350d443bddbe8fed0138ff5',
    name: 'in progress',
    slug: 'in-progress',
    order: 1,
    board: BOARD_SEED._id,
  },
  {
    _id: '6350d443bddbe8fed0138ff6',
    name: 'review',
    slug: 'review',
    order: 2,
    board: BOARD_SEED._id,
  },
  {
    _id: '6350d443bddbe8fed0138ff7',
    name: 'done',
    slug: 'done',
    order: 3,
    board: BOARD_SEED._id,
  },
];

const STATUS_TEST = [
  {
    id: '6350d443bddbe8fed0138ff4',
    name: 'to do',
    slug: 'to-do',
    order: 0,
    board: BOARD_SEED._id,
  },
  {
    id: '6350d443bddbe8fed0138ff5',
    name: 'in progress',
    slug: 'in-progress',
    order: 1,
    board: BOARD_SEED._id,
  },
  {
    id: '6350d443bddbe8fed0138ff6',
    name: 'review',
    slug: 'review',
    order: 2,
    board: BOARD_SEED._id,
  },
  {
    id: '6350d443bddbe8fed0138ff7',
    name: 'done',
    slug: 'done',
    order: 3,
    board: BOARD_SEED._id,
  },
];

export { STATUS_SEED, STATUS_TEST };
