import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

import { useSettingsStore } from '../stores/settingsStore';

type SfxName = 'tick' | 'correct' | 'wrong';

const SOURCES: Record<SfxName, number> = {
  tick: require('../../assets/sounds/tick.wav'),
  correct: require('../../assets/sounds/correct.wav'),
  wrong: require('../../assets/sounds/wrong.wav'),
};

let ready = false;
const players: Partial<Record<SfxName, AudioPlayer>> = {};

async function ensureReady(): Promise<void> {
  if (ready) {
    return;
  }
  await setAudioModeAsync({ playsInSilentMode: true });
  (Object.keys(SOURCES) as SfxName[]).forEach((name) => {
    players[name] = createAudioPlayer(SOURCES[name]);
  });
  ready = true;
}

function play(name: SfxName): void {
  if (!useSettingsStore.getState().soundEnabled) {
    return;
  }
  void ensureReady().then(() => {
    const player = players[name];
    if (!player) {
      return;
    }
    player.seekTo(0);
    player.play();
  });
}

export function playTickSound(): void {
  play('tick');
}

export function playCorrectSound(): void {
  play('correct');
}

export function playWrongSound(): void {
  play('wrong');
}
