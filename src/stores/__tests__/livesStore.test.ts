jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import {
  BONUS_LIFE_FROM_AD,
  DEFAULT_LIVES,
  LIFE_REGEN_MS,
  PREMIUM_LIVES,
} from '../../constants/monetization';
import {
  getMsUntilNextLife,
  getSessionLives,
  hasLivesToPlay,
  MAX_LIVES,
  REGEN_CAP,
  useLivesStore,
} from '../livesStore';

describe('livesStore', () => {
  beforeEach(() => {
    useLivesStore.setState({ remaining: DEFAULT_LIVES, nextLifeAt: null });
  });

  it('starts with default lives', () => {
    expect(useLivesStore.getState().remaining).toBe(8);
  });

  it('loseLife decrements global pool', () => {
    expect(useLivesStore.getState().loseLife()).toBe(7);
    expect(useLivesStore.getState().loseLife()).toBe(6);
    expect(useLivesStore.getState().loseLife()).toBe(5);
    expect(useLivesStore.getState().loseLife()).toBe(4);
    expect(useLivesStore.getState().loseLife()).toBe(3);
    expect(useLivesStore.getState().loseLife()).toBe(2);
    expect(useLivesStore.getState().loseLife()).toBe(1);
    expect(useLivesStore.getState().loseLife()).toBe(0);
    expect(useLivesStore.getState().loseLife()).toBe(0);
  });

  it('starts regen timer when dropping below the natural cap', () => {
    useLivesStore.setState({ remaining: REGEN_CAP, nextLifeAt: null });
    useLivesStore.getState().loseLife();
    expect(useLivesStore.getState().nextLifeAt).not.toBeNull();
  });

  it('syncRegen adds a life after the timer elapses', () => {
    const now = Date.now();
    useLivesStore.setState({
      remaining: 0,
      nextLifeAt: now - 1,
    });
    useLivesStore.getState().syncRegen(now);
    expect(useLivesStore.getState().remaining).toBe(1);
  });

  it('syncRegen can catch up multiple lives when offline', () => {
    const now = Date.now();
    useLivesStore.setState({
      remaining: 0,
      nextLifeAt: now - LIFE_REGEN_MS * 2,
    });
    useLivesStore.getState().syncRegen(now);
    expect(useLivesStore.getState().remaining).toBe(3);
    expect(useLivesStore.getState().nextLifeAt).not.toBeNull();
  });

  it('addLife caps at max (base + ad bonus)', () => {
    useLivesStore.setState({ remaining: 0, nextLifeAt: null });
    expect(useLivesStore.getState().addLife()).toBe(BONUS_LIFE_FROM_AD);
    useLivesStore.setState({ remaining: DEFAULT_LIVES, nextLifeAt: null });
    expect(useLivesStore.getState().addLife()).toBe(MAX_LIVES);
    expect(useLivesStore.getState().addLife()).toBe(MAX_LIVES);
  });

  it('addLife clears regen timer when reaching natural cap', () => {
    const now = Date.now();
    useLivesStore.setState({
      remaining: REGEN_CAP - 1,
      nextLifeAt: now + LIFE_REGEN_MS,
    });
    useLivesStore.getState().addLife();
    expect(useLivesStore.getState().remaining).toBe(REGEN_CAP);
    expect(useLivesStore.getState().nextLifeAt).toBeNull();
  });

  it('hasLivesToPlay allows premium regardless of pool', () => {
    useLivesStore.setState({ remaining: 0, nextLifeAt: null });
    expect(hasLivesToPlay(true)).toBe(true);
    expect(hasLivesToPlay(false)).toBe(false);
  });

  it('hasLivesToPlay allows play when pool > 0', () => {
    useLivesStore.setState({ remaining: 1, nextLifeAt: null });
    expect(hasLivesToPlay(false)).toBe(true);
  });

  it('getSessionLives returns premium sentinel for subscribers', () => {
    useLivesStore.setState({ remaining: 0, nextLifeAt: null });
    expect(getSessionLives(true)).toBe(PREMIUM_LIVES);
  });

  it('getSessionLives mirrors global pool for free users', () => {
    useLivesStore.setState({ remaining: 2, nextLifeAt: null });
    expect(getSessionLives(false)).toBe(2);
  });

  it('getMsUntilNextLife returns null at natural cap', () => {
    useLivesStore.setState({ remaining: REGEN_CAP, nextLifeAt: null });
    expect(getMsUntilNextLife()).toBeNull();
  });

  it('getMsUntilNextLife returns remaining wait time', () => {
    const now = Date.now();
    useLivesStore.setState({
      remaining: 2,
      nextLifeAt: now + 90_000,
    });
    const ms = getMsUntilNextLife(now);
    expect(ms).toBeGreaterThan(89_000);
    expect(ms).toBeLessThanOrEqual(90_000);
  });
});
