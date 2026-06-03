jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { useProgressStore } from '../progressStore';

describe('progressStore', () => {
  beforeEach(() => {
    useProgressStore.setState({
      levelByMode: {
        reflex: 1,
        memory: 1,
        pattern: 1,
        colorConflict: 1,
        oddOneOut: 1,
        mathSnap: 1,
        direction: 1,
        mix: 1,
      },
    });
  });

  it('recordLevel keeps the highest level reached for a mode', () => {
    useProgressStore.getState().recordLevel('reflex', 8);
    expect(useProgressStore.getState().getLevel('reflex')).toBe(8);
    useProgressStore.getState().recordLevel('reflex', 5);
    expect(useProgressStore.getState().getLevel('reflex')).toBe(8);
    useProgressStore.getState().recordLevel('reflex', 12);
    expect(useProgressStore.getState().getLevel('reflex')).toBe(12);
  });

  it('resetLevel drops a mode back to level 1', () => {
    useProgressStore.getState().recordLevel('memory', 20);
    useProgressStore.getState().resetLevel('memory');
    expect(useProgressStore.getState().getLevel('memory')).toBe(1);
  });

  it('resetLevel only affects the chosen mode', () => {
    useProgressStore.getState().recordLevel('pattern', 15);
    useProgressStore.getState().recordLevel('mix', 9);
    useProgressStore.getState().resetLevel('mix');
    expect(useProgressStore.getState().getLevel('mix')).toBe(1);
    expect(useProgressStore.getState().getLevel('pattern')).toBe(15);
  });

  it('can climb again after a reset', () => {
    useProgressStore.getState().recordLevel('oddOneOut', 10);
    useProgressStore.getState().resetLevel('oddOneOut');
    useProgressStore.getState().recordLevel('oddOneOut', 3);
    expect(useProgressStore.getState().getLevel('oddOneOut')).toBe(3);
  });
});
