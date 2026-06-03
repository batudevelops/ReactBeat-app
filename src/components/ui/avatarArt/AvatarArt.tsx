import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentType } from 'react';
import { StyleSheet, View } from 'react-native';

import { getAvatarDefinition, normalizeAvatarIndex } from '../../../constants/avatars';

interface LayerProps {
  s: number;
}

interface AvatarArtProps {
  index: number;
  size: number;
}

/** Art is authored on a 100×100 canvas; uniform scale keeps all layers proportional. */
const DESIGN_SIZE = 100;

const AVATAR_LAYERS: ComponentType<LayerProps>[] = [
  FoxLayers,
  OwlLayers,
  OctopusLayers,
  LionLayers,
  PandaLayers,
  RobotLayers,
  UnicornLayers,
  BeeLayers,
  FrogLayers,
  BrainLayers,
  CheetahLayers,
  CatLayers,
  PenguinLayers,
  DragonLayers,
  KoalaLayers,
  SharkLayers,
  MonkeyLayers,
  AlienLayers,
  GhostLayers,
  EagleLayers,
];

/** Flat cartoon mascot drawn with primitives — no external assets or licenses. */
export function AvatarArt({ index, size }: AvatarArtProps) {
  const def = getAvatarDefinition(index);
  const safeIndex = normalizeAvatarIndex(index);
  const Layer = AVATAR_LAYERS[safeIndex];
  const scale = size / DESIGN_SIZE;

  return (
    <LinearGradient
      colors={def.gradient}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={[styles.base, { width: size, height: size, borderRadius: size / 2 }]}
    >
      <View style={[styles.canvas, { transform: [{ scale }] }]}>
        {Layer ? <Layer s={1} /> : null}
      </View>
    </LinearGradient>
  );
}

function Eye({ s, x, y, large }: { s: number; x: number; y: number; large?: boolean }) {
  const w = (large ? 16 : 12) * s;
  return (
    <View
      style={[
        styles.eyeWhite,
        {
          width: w,
          height: w,
          borderRadius: w / 2,
          left: x * s,
          top: y * s,
        },
      ]}
    >
      <View
        style={[
          styles.eyePupil,
          {
            width: w * 0.45,
            height: w * 0.45,
            borderRadius: w,
          },
        ]}
      />
    </View>
  );
}

function FoxLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.ear, { left: 18 * s, top: 8 * s, backgroundColor: '#EA580C', transform: [{ rotate: '-24deg' }] }]} />
      <View style={[styles.ear, { right: 18 * s, top: 8 * s, backgroundColor: '#EA580C', transform: [{ rotate: '24deg' }] }]} />
      <View style={[styles.muzzle, { width: 44 * s, height: 30 * s, bottom: 18 * s, backgroundColor: '#FFEDD5' }]} />
      <Eye s={s} x={28} y={36} />
      <Eye s={s} x={56} y={36} />
      <View style={[styles.nose, { width: 10 * s, height: 8 * s, bottom: 34 * s, backgroundColor: '#1C1917' }]} />
    </>
  );
}

function OwlLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.earTuft, { left: 22 * s, top: 6 * s, backgroundColor: '#5B21B6' }]} />
      <View style={[styles.earTuft, { right: 22 * s, top: 6 * s, backgroundColor: '#5B21B6' }]} />
      <View style={[styles.belly, { width: 54 * s, height: 54 * s, bottom: 8 * s, backgroundColor: '#EDE9FE' }]} />
      <Eye s={s} x={24} y={34} large />
      <Eye s={s} x={52} y={34} large />
      <View style={[styles.beak, { bottom: 28 * s, borderBottomColor: '#F59E0B' }]} />
    </>
  );
}

function OctopusLayers({ s }: { s: number }) {
  return (
    <>
      <Eye s={s} x={30} y={32} large />
      <Eye s={s} x={54} y={32} large />
      <View style={[styles.smile, { bottom: 42 * s, width: 22 * s }]} />
      {[-18, -6, 6, 18].map((offset) => (
        <View
          key={offset}
          style={[
            styles.tentacle,
            {
              left: (50 + offset) * s,
              bottom: 2 * s,
              width: 10 * s,
              height: 18 * s,
              backgroundColor: '#115E59',
            },
          ]}
        />
      ))}
    </>
  );
}

function LionLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.mane, { width: 88 * s, height: 88 * s, backgroundColor: '#FDE68A' }]} />
      <View style={[styles.faceDisc, { width: 62 * s, height: 62 * s, backgroundColor: '#FCD34D' }]} />
      <Eye s={s} x={30} y={38} />
      <Eye s={s} x={56} y={38} />
      <View style={[styles.nose, { width: 12 * s, height: 10 * s, bottom: 30 * s, backgroundColor: '#78350F' }]} />
    </>
  );
}

function PandaLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.ear, { left: 16 * s, top: 10 * s, backgroundColor: '#1C1917' }]} />
      <View style={[styles.ear, { right: 16 * s, top: 10 * s, backgroundColor: '#1C1917' }]} />
      <View style={[styles.eyePatch, { left: 24 * s, top: 34 * s, backgroundColor: '#1C1917' }]} />
      <View style={[styles.eyePatch, { right: 24 * s, top: 34 * s, backgroundColor: '#1C1917' }]} />
      <View style={[styles.eyeWhite, { width: 6 * s, height: 6 * s, left: 33 * s, top: 42 * s, borderRadius: 3 * s }]} />
      <View style={[styles.eyeWhite, { width: 6 * s, height: 6 * s, right: 33 * s, top: 42 * s, borderRadius: 3 * s }]} />
      <View style={[styles.nose, { width: 10 * s, height: 8 * s, bottom: 32 * s, backgroundColor: '#1C1917' }]} />
    </>
  );
}

function RobotLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.antenna, { top: 4 * s, backgroundColor: '#BFDBFE' }]} />
      <View style={[styles.visore, { width: 68 * s, height: 24 * s, top: 28 * s, backgroundColor: '#1E3A8A' }]} />
      <Eye s={s} x={30} y={34} />
      <Eye s={s} x={56} y={34} />
      <View style={[styles.grill, { bottom: 24 * s, width: 34 * s, height: 8 * s, backgroundColor: '#1E40AF' }]} />
    </>
  );
}

function UnicornLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.horn, { top: 2 * s, borderBottomColor: '#FDE68A' }]} />
      <Eye s={s} x={30} y={38} />
      <Eye s={s} x={56} y={38} />
      <View style={[styles.blush, { left: 22 * s, top: 54 * s, backgroundColor: '#FDA4AF' }]} />
      <View style={[styles.blush, { right: 22 * s, top: 54 * s, backgroundColor: '#FDA4AF' }]} />
      <View style={[styles.smile, { bottom: 28 * s, width: 18 * s }]} />
    </>
  );
}

function BeeLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.wing, { left: 8 * s, top: 24 * s, backgroundColor: 'rgba(255,255,255,0.55)' }]} />
      <View style={[styles.wing, { right: 8 * s, top: 24 * s, backgroundColor: 'rgba(255,255,255,0.55)' }]} />
      <View style={[styles.stripe, { top: 42 * s, backgroundColor: '#1C1917' }]} />
      <View style={[styles.stripe, { top: 56 * s, backgroundColor: '#1C1917' }]} />
      <Eye s={s} x={32} y={34} />
      <Eye s={s} x={56} y={34} />
    </>
  );
}

function FrogLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.frogEyeBump, { left: 24 * s, top: 20 * s, backgroundColor: '#BBF7D0' }]} />
      <View style={[styles.frogEyeBump, { right: 24 * s, top: 20 * s, backgroundColor: '#BBF7D0' }]} />
      <Eye s={s} x={28} y={24} large />
      <Eye s={s} x={54} y={24} large />
      <View style={[styles.smile, { bottom: 26 * s, width: 28 * s, height: 6 * s, borderRadius: 8 * s }]} />
    </>
  );
}

function BrainLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.brain, { width: 64 * s, height: 52 * s, top: 24 * s, backgroundColor: '#FB923C' }]} />
      <View style={[styles.brainGroove, { left: 38 * s, top: 34 * s, backgroundColor: '#C2410C' }]} />
      <View style={[styles.brainGroove, { right: 38 * s, top: 40 * s, backgroundColor: '#C2410C' }]} />
      <Eye s={s} x={34} y={42} />
      <Eye s={s} x={54} y={42} />
      <View style={[styles.smile, { bottom: 22 * s, width: 16 * s }]} />
    </>
  );
}

function CheetahLayers({ s }: { s: number }) {
  return (
    <>
      {[
        [30, 28],
        [58, 34],
        [44, 52],
        [68, 56],
      ].map(([x, y]) => (
        <View
          key={`${x}-${y}`}
          style={[
            styles.spot,
            {
              left: x * s,
              top: y * s,
              width: 8 * s,
              height: 8 * s,
              backgroundColor: '#881337',
            },
          ]}
        />
      ))}
      <Eye s={s} x={30} y={36} />
      <Eye s={s} x={56} y={36} />
      <View style={[styles.nose, { width: 10 * s, height: 8 * s, bottom: 30 * s, backgroundColor: '#4C0519' }]} />
    </>
  );
}

function CatLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.wizardHat, { top: 0, backgroundColor: '#4338CA' }]} />
      <View style={[styles.ear, { left: 18 * s, top: 22 * s, backgroundColor: '#6366F1' }]} />
      <View style={[styles.ear, { right: 18 * s, top: 22 * s, backgroundColor: '#6366F1' }]} />
      <Eye s={s} x={30} y={40} />
      <Eye s={s} x={56} y={40} />
      <View style={[styles.nose, { width: 8 * s, height: 7 * s, bottom: 32 * s, backgroundColor: '#312E81' }]} />
    </>
  );
}

function PenguinLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.belly, { width: 48 * s, height: 58 * s, bottom: 6 * s, backgroundColor: '#F8FAFC' }]} />
      <View style={[styles.scarf, { top: 38 * s, backgroundColor: '#EF4444' }]} />
      <Eye s={s} x={32} y={28} />
      <Eye s={s} x={54} y={28} />
      <View style={[styles.beak, { bottom: 46 * s, borderBottomColor: '#F59E0B' }]} />
    </>
  );
}

function DragonLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.dragonHorn, { left: 26 * s, top: 6 * s, backgroundColor: '#FDE68A' }]} />
      <View style={[styles.dragonHorn, { right: 26 * s, top: 6 * s, backgroundColor: '#FDE68A' }]} />
      <View style={[styles.snout, { width: 36 * s, height: 22 * s, bottom: 24 * s, backgroundColor: '#059669' }]} />
      <Eye s={s} x={30} y={34} large />
      <Eye s={s} x={54} y={34} large />
      <View style={[styles.nostril, { left: 42 * s, bottom: 36 * s, backgroundColor: '#064E3B' }]} />
      <View style={[styles.nostril, { right: 42 * s, bottom: 36 * s, backgroundColor: '#064E3B' }]} />
    </>
  );
}

function KoalaLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.roundEar, { left: 10 * s, top: 14 * s, backgroundColor: '#78716C' }]} />
      <View style={[styles.roundEar, { right: 10 * s, top: 14 * s, backgroundColor: '#78716C' }]} />
      <View style={[styles.koalaNose, { bottom: 34 * s, backgroundColor: '#292524' }]} />
      <Eye s={s} x={32} y={38} />
      <Eye s={s} x={56} y={38} />
    </>
  );
}

function SharkLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.fin, { top: 8 * s, backgroundColor: '#64748B' }]} />
      <Eye s={s} x={28} y={36} large />
      <View style={[styles.sharkSnout, { bottom: 22 * s, backgroundColor: '#94A3B8' }]} />
      <View style={[styles.toothRow, { bottom: 28 * s }]} />
    </>
  );
}

function MonkeyLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.roundEar, { left: 8 * s, top: 18 * s, backgroundColor: '#B45309' }]} />
      <View style={[styles.roundEar, { right: 8 * s, top: 18 * s, backgroundColor: '#B45309' }]} />
      <View style={[styles.monkeyFace, { width: 52 * s, height: 44 * s, bottom: 16 * s, backgroundColor: '#FDE68A' }]} />
      <Eye s={s} x={32} y={36} />
      <Eye s={s} x={56} y={36} />
      <View style={[styles.smile, { bottom: 26 * s, width: 20 * s }]} />
    </>
  );
}

function AlienLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.antenna, { left: 32 * s, top: 2 * s, backgroundColor: '#A3E635' }]} />
      <View style={[styles.antennaBall, { left: 29 * s, top: 0, backgroundColor: '#EC4899' }]} />
      <View style={[styles.antenna, { right: 32 * s, top: 2 * s, backgroundColor: '#A3E635' }]} />
      <View style={[styles.antennaBall, { right: 29 * s, top: 0, backgroundColor: '#EC4899' }]} />
      <Eye s={s} x={26} y={36} large />
      <Eye s={s} x={52} y={36} large />
      <View style={[styles.smile, { bottom: 24 * s, width: 14 * s }]} />
    </>
  );
}

function GhostLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.ghostSheet, { width: 72 * s, height: 78 * s, bottom: 4 * s, backgroundColor: 'rgba(255,255,255,0.88)' }]} />
      <Eye s={s} x={32} y={34} large />
      <Eye s={s} x={54} y={34} large />
      <View style={[styles.smile, { bottom: 32 * s, width: 16 * s, backgroundColor: '#7C3AED' }]} />
    </>
  );
}

function EagleLayers({ s }: { s: number }) {
  return (
    <>
      <View style={[styles.eagleCrest, { top: 4 * s, backgroundColor: '#FFFFFF' }]} />
      <Eye s={s} x={30} y={36} />
      <Eye s={s} x={56} y={36} />
      <View style={[styles.eagleBeak, { bottom: 32 * s, borderBottomColor: '#F59E0B' }]} />
    </>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  canvas: {
    width: DESIGN_SIZE,
    height: DESIGN_SIZE,
  },
  ear: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 8,
  },
  muzzle: {
    position: 'absolute',
    borderRadius: 20,
    alignSelf: 'center',
  },
  nose: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 6,
  },
  eyeWhite: {
    position: 'absolute',
    backgroundColor: '#FAFAF9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyePupil: {
    backgroundColor: '#1C1917',
  },
  earTuft: {
    position: 'absolute',
    width: 10,
    height: 16,
    borderRadius: 6,
  },
  belly: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 40,
  },
  beak: {
    position: 'absolute',
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  smile: {
    position: 'absolute',
    alignSelf: 'center',
    height: 4,
    borderRadius: 4,
    backgroundColor: 'rgba(28,25,23,0.65)',
  },
  tentacle: {
    position: 'absolute',
    borderRadius: 8,
  },
  mane: {
    position: 'absolute',
    alignSelf: 'center',
    top: 6,
    borderRadius: 999,
  },
  faceDisc: {
    position: 'absolute',
    alignSelf: 'center',
    top: 18,
    borderRadius: 999,
  },
  eyePatch: {
    position: 'absolute',
    width: 18,
    height: 22,
    borderRadius: 12,
  },
  antenna: {
    position: 'absolute',
    alignSelf: 'center',
    width: 4,
    height: 14,
    borderRadius: 4,
  },
  visore: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 6,
    opacity: 0.35,
  },
  grill: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 4,
  },
  horn: {
    position: 'absolute',
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 18,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  blush: {
    position: 'absolute',
    width: 10,
    height: 6,
    borderRadius: 8,
    opacity: 0.8,
  },
  wing: {
    position: 'absolute',
    width: 22,
    height: 30,
    borderRadius: 20,
  },
  stripe: {
    position: 'absolute',
    alignSelf: 'center',
    width: 56,
    height: 6,
    borderRadius: 4,
    opacity: 0.35,
  },
  frogEyeBump: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  brain: {
    position: 'absolute',
    alignSelf: 'center',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  brainGroove: {
    position: 'absolute',
    width: 4,
    height: 16,
    borderRadius: 4,
    opacity: 0.45,
  },
  spot: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.55,
  },
  wizardHat: {
    position: 'absolute',
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 24,
    borderRightWidth: 24,
    borderBottomWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  scarf: {
    position: 'absolute',
    alignSelf: 'center',
    width: 52,
    height: 8,
    borderRadius: 4,
  },
  dragonHorn: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  snout: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 14,
  },
  nostril: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  roundEar: {
    position: 'absolute',
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  koalaNose: {
    position: 'absolute',
    alignSelf: 'center',
    width: 16,
    height: 12,
    borderRadius: 10,
  },
  fin: {
    position: 'absolute',
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  sharkSnout: {
    position: 'absolute',
    alignSelf: 'center',
    width: 44,
    height: 20,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  toothRow: {
    position: 'absolute',
    alignSelf: 'center',
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#F8FAFC',
  },
  monkeyFace: {
    position: 'absolute',
    alignSelf: 'center',
    borderRadius: 22,
  },
  antennaBall: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  ghostSheet: {
    position: 'absolute',
    alignSelf: 'center',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  eagleCrest: {
    position: 'absolute',
    alignSelf: 'center',
    width: 20,
    height: 14,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  eagleBeak: {
    position: 'absolute',
    alignSelf: 'center',
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
});
