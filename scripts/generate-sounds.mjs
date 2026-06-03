/** Generates minimal WAV assets for game SFX (no ffmpeg required). */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'assets', 'sounds');
mkdirSync(outDir, { recursive: true });

function wavTone(hz, durationSec, volume = 0.25) {
  const sampleRate = 44100;
  const numSamples = Math.floor(sampleRate * durationSec);
  const data = Buffer.alloc(numSamples * 2);
  for (let i = 0; i < numSamples; i += 1) {
    const t = i / sampleRate;
    const envelope = Math.min(1, (numSamples - i) / (sampleRate * 0.02));
    const sample = Math.sin(2 * Math.PI * hz * t) * volume * envelope;
    data.writeInt16LE(Math.max(-32767, Math.min(32767, Math.floor(sample * 32767))), i * 2);
  }

  const header = Buffer.alloc(44);
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write('WAVE', 8);
  header.write('fmt ', 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write('data', 36);
  header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

writeFileSync(join(outDir, 'tick.wav'), wavTone(880, 0.07, 0.2));
writeFileSync(join(outDir, 'correct.wav'), wavTone(660, 0.1, 0.22));
writeFileSync(join(outDir, 'wrong.wav'), wavTone(220, 0.14, 0.24));
console.log('Wrote assets/sounds/*.wav');
