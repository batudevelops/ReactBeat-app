jest.mock('../../../lib/firebase', () => ({
  database: {},
}));
jest.mock('firebase/database', () => ({
  onValue: jest.fn(),
  ref: jest.fn(),
}));
jest.mock('../remoteConfig', () => ({
  getRemoteConfig: () => ({
    daily_leaderboard_size: 3,
  }),
}));

import {
  findRank,
  parseLeaderboardSnapshot,
  provisionalRank,
  sliceLeaderboardTop,
} from '../leaderboard';

describe('parseLeaderboardSnapshot', () => {
  it('returns an empty list for null data', () => {
    expect(parseLeaderboardSnapshot(null)).toEqual([]);
  });

  it('sorts by score descending and breaks ties with newer ts', () => {
    const entries = parseLeaderboardSnapshot({
      a: { score: 100, name: 'A', avatar: 0, ts: 100 },
      b: { score: 200, name: 'B', avatar: 1, ts: 50 },
      c: { score: 100, name: 'C', avatar: 2, ts: 200 },
    });
    expect(entries.map((e) => e.uid)).toEqual(['b', 'c', 'a']);
  });

  it('fills defaults for missing row fields', () => {
    const [entry] = parseLeaderboardSnapshot({ solo: {} });
    expect(entry).toMatchObject({
      uid: 'solo',
      score: 0,
      name: '—',
      avatar: 0,
      ts: 0,
    });
  });
});

describe('sliceLeaderboardTop', () => {
  it('limits visible rows to remote config size', () => {
    const entries = parseLeaderboardSnapshot({
      u1: { score: 40 },
      u2: { score: 30 },
      u3: { score: 20 },
      u4: { score: 10 },
    });
    expect(sliceLeaderboardTop(entries)).toHaveLength(3);
    expect(sliceLeaderboardTop(entries).map((e) => e.uid)).toEqual([
      'u1',
      'u2',
      'u3',
    ]);
  });
});

describe('findRank', () => {
  const board = parseLeaderboardSnapshot({
    first: { score: 300, ts: 1 },
    second: { score: 200, ts: 2 },
    third: { score: 100, ts: 3 },
  });

  it('returns 1-based rank for a listed uid', () => {
    expect(findRank(board, 'second')).toBe(2);
  });

  it('returns null for missing uid', () => {
    expect(findRank(board, 'ghost')).toBeNull();
    expect(findRank(board, null)).toBeNull();
  });
});

describe('provisionalRank', () => {
  const board = parseLeaderboardSnapshot({
    a: { score: 500, ts: 1 },
    b: { score: 300, ts: 2 },
    c: { score: 100, ts: 3 },
  });

  it('returns the existing rank when the user is already listed', () => {
    expect(provisionalRank(board, 'b', 999)).toBe(2);
  });

  it('estimates rank for a fresh score not yet on the board', () => {
    expect(provisionalRank(board, 'me', 350)).toBe(2);
    expect(provisionalRank(board, 'me', 50)).toBe(4);
  });

  it('returns null for zero or negative scores', () => {
    expect(provisionalRank(board, 'me', 0)).toBeNull();
  });
});
