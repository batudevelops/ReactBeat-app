jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
jest.mock('../../engine/antiCheat', () => ({
  createSession: (mode: string, level: number) => ({
    sessionId: 'test',
    mode,
    level,
    startTime: 0,
    endTime: 0,
    deviceFingerprint: 'jest',
    events: [],
  }),
}));
jest.mock('../../engine/levelConfig', () => ({
  getLevelConfig: () => ({ timeLimit: 5000, comboBonus: 1 }),
}));
jest.mock('../../engine/scorer', () => ({
  calculateScore: () => 100,
}));

import { DEFAULT_LIVES, PREMIUM_LIVES } from '../../constants/monetization';
import { useGameStore } from '../gameStore';
import { MAX_LIVES, useLivesStore } from '../livesStore';

describe('gameStore lives integration', () => {
  beforeEach(() => {
    useLivesStore.setState({ remaining: DEFAULT_LIVES, nextLifeAt: null });
    useGameStore.getState().reset();
  });

  it('starts a run with lives taken from the global pool', () => {
    useLivesStore.setState({ remaining: 2 });
    useGameStore.getState().startGame('reflex', 1, 2);

    const state = useGameStore.getState();
    expect(state.lives).toBe(2);
    expect(state.maxLives).toBe(DEFAULT_LIVES);
    expect(state.unlimitedLives).toBe(false);
  });

  it('shows six heart slots when the ad bonus filled the pool', () => {
    useLivesStore.setState({ remaining: MAX_LIVES });
    useGameStore.getState().startGame('memory', 1, MAX_LIVES);

    const state = useGameStore.getState();
    expect(state.lives).toBe(MAX_LIVES);
    expect(state.maxLives).toBe(MAX_LIVES);
  });

  it('tapWrong decrements both session and global lives', () => {
    useLivesStore.setState({ remaining: 3 });
    useGameStore.getState().startGame('reflex', 1, 3);
    useGameStore.getState().tapWrong();

    expect(useGameStore.getState().lives).toBe(2);
    expect(useLivesStore.getState().remaining).toBe(2);
  });

  it('sets outOfLives when the run runs out of hearts', () => {
    useLivesStore.setState({ remaining: 2 });
    useGameStore.getState().startGame('reflex', 1, 2);
    useGameStore.getState().tapWrong();
    useGameStore.getState().tapWrong();

    expect(useGameStore.getState().status).toBe('outOfLives');
    expect(useGameStore.getState().lives).toBe(0);
    expect(useLivesStore.getState().remaining).toBe(0);
  });

  it('resumeWithOneLife continues after the out-of-lives modal', () => {
    useLivesStore.setState({ remaining: 1 });
    useGameStore.getState().startGame('reflex', 1, 1);
    useGameStore.getState().tapWrong();
    expect(useGameStore.getState().status).toBe('outOfLives');

    useGameStore.getState().resumeWithOneLife();
    expect(useGameStore.getState().status).toBe('playing');
    expect(useGameStore.getState().lives).toBe(1);
    expect(useGameStore.getState().adContinueUsed).toBe(true);
  });

  it('bumpRunLevel increases run level without resetting the session', () => {
    useGameStore.getState().startGame('reflex', 3, 2);
    useGameStore.getState().bumpRunLevel();
    useGameStore.getState().bumpRunLevel();

    const state = useGameStore.getState();
    expect(state.level).toBe(5);
    expect(state.score).toBe(0);
    expect(state.session?.mode).toBe('reflex');
  });

  it('resumeWithOneLife keeps the current run level', () => {
    useGameStore.getState().startGame('reflex', 4, 1);
    useGameStore.getState().bumpRunLevel();
    useGameStore.getState().tapWrong();
    expect(useGameStore.getState().level).toBe(5);

    useGameStore.getState().resumeWithOneLife();
    expect(useGameStore.getState().level).toBe(5);
  });

  it('allows only one in-run ad continue per session', () => {
    useGameStore.getState().startGame('reflex', 1, 1);
    useGameStore.getState().tapWrong();
    useGameStore.getState().resumeWithOneLife();
    useGameStore.getState().tapWrong();

    expect(useGameStore.getState().status).toBe('outOfLives');
    expect(useGameStore.getState().adContinueUsed).toBe(true);
  });

  it('resets ad continue flag on a new run', () => {
    useGameStore.getState().startGame('reflex', 1, 1);
    useGameStore.getState().tapWrong();
    useGameStore.getState().resumeWithOneLife();
    useGameStore.getState().reset();
    useGameStore.getState().startGame('reflex', 1, 1);

    expect(useGameStore.getState().adContinueUsed).toBe(false);
  });

  it('premium runs never drain the global pool', () => {
    useGameStore.getState().startGame('reflex', 1, PREMIUM_LIVES);
    useGameStore.getState().tapWrong();
    useGameStore.getState().tapWrong();

    expect(useGameStore.getState().unlimitedLives).toBe(true);
    expect(useLivesStore.getState().remaining).toBe(DEFAULT_LIVES);
    expect(useGameStore.getState().status).toBe('playing');
  });

  it('endGame moves to finished without restoring global lives', () => {
    useLivesStore.setState({ remaining: 2 });
    useGameStore.getState().startGame('reflex', 1, 2);
    useGameStore.getState().tapWrong();
    useGameStore.getState().endGame();

    expect(useGameStore.getState().status).toBe('finished');
    expect(useLivesStore.getState().remaining).toBe(1);
  });
});
