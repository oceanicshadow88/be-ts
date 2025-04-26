const BOARD_SEED = {
  _id: '6350d443bddbe8fed0138ffd',
  title: 'test board',
  statuses: [
    '6350d443bddbe8fed0138ff4',
    '6350d443bddbe8fed0138ff5',
    '6350d443bddbe8fed0138ff6',
    '6350d443bddbe8fed0138ff7',
  ],
};

const BOARD_TEST = {
  id: '6358beaba662585de524593d',
  title: 'kitman-test',
  createdAt: '2022-10-26T04:59:23.945Z',
  updatedAt: '2022-10-26T04:59:23.945Z',
};

const BOARD_BY_LABELS = {
  id: '6358beaba662585de524593d',
  title: 'kitman-test',
  statuses: [
    {
      id: '6358beaba662585de5245935',
      name: 'to do',
      slug: 'to-do',
      order: 0,
    },
    {
      id: '6358beaba662585de5245936',
      name: 'in progress',
      slug: 'in-progress',
      order: 1,
    },
    { id: '6358beaba662585de5245937', name: 'review', slug: 'review', order: 2 },
    { id: '6358beaba662585de5245938', name: 'done', slug: 'done', order: 3 },
  ],
  createdAt: expect.any(String),
  updatedAt: expect.any(String),
};

export { BOARD_SEED, BOARD_TEST, BOARD_BY_LABELS };
