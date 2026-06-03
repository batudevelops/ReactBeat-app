import { useState } from 'react';

import { OutOfLivesModal } from '../../components/game/OutOfLivesModal';
import { showRewardedAd } from '../../services/monetization';
import { useGameStore, useLivesStore, useUserStore } from '../../stores';

/** Shown during a run when global lives hit zero (GameScreen only). */
export function GameOutOfLivesModal() {
  const status = useGameStore((s) => s.status);
  const adContinueUsed = useGameStore((s) => s.adContinueUsed);
  const isPremium = useUserStore((s) => s.isPremium);
  const addLife = useLivesStore((s) => s.addLife);
  const resumeWithOneLife = useGameStore((s) => s.resumeWithOneLife);
  const endGame = useGameStore((s) => s.endGame);
  const [adBusy, setAdBusy] = useState(false);

  const visible = !isPremium && status === 'outOfLives';

  async function handleWatchAd() {
    setAdBusy(true);
    try {
      const earned = await showRewardedAd();
      if (earned) {
        addLife();
        resumeWithOneLife();
      }
    } finally {
      setAdBusy(false);
    }
  }

  return (
    <OutOfLivesModal
      visible={visible}
      loading={adBusy}
      showWatchAd={!adContinueUsed}
      onWatchAd={() => void handleWatchAd()}
      onEnd={endGame}
    />
  );
}
