import Entity from 'core/Entity';
import { val2pct, db2mag } from 'utils/math';
import { FFT_SIZE, SAMPLE_RATE } from 'view/constants';

export default class SpectrumParser extends Entity {
  static defaultProperties = {
    fftSize: FFT_SIZE,
    sampleRate: SAMPLE_RATE,
    smoothingTimeConstant: 0.5,
    minDecibels: -100,
    maxDecibels: 0,
    minFrequency: 0,
    maxFrequency: SAMPLE_RATE / 2,
    normalize: false,
    bins: 0,
  };

  constructor(properties) {
    super('SpectrumParser', { ...SpectrumParser.defaultProperties, ...properties });

    this.setBinRange();
  }

  setBinRange() {
    const { fftSize, sampleRate, minFrequency, maxFrequency } = this.properties;

    const range = sampleRate / fftSize;

    this.minBin = ~~(minFrequency / range);
    this.maxBin = ~~(maxFrequency / range);
    this.totalBins = this.maxBin - this.minBin;
  }

  getDb(fft) {
    const { minDecibels, maxDecibels, normalize } = this.properties;
    const db = -100 * (1 - fft / 256);

    if (normalize) {
      return val2pct(db2mag(db), db2mag(minDecibels), db2mag(maxDecibels));
    }

    return val2pct(db, -100, maxDecibels);
  }

  update(properties) {
    const changed = super.update(properties);

    if (changed) {
      this.setBinRange();
    }

    return changed;
  }

  parseFFT(fft) {
    let { output, buffer } = this;
    const { minBin, maxBin, totalBins } = this;
    const { smoothingTimeConstant, bins } = this.properties;
    const size = bins || totalBins;

    // Resize data arrays
    if (output === undefined || output.length !== size) {
      output = new Float32Array(size);
      buffer = new Float32Array(size);
      this.output = output;
      this.buffer = buffer;
    }

    // Straight conversion
    if (size === totalBins) {
      for (let i = minBin, k = 0; i < maxBin; i += 1, k += 1) {
        output[k] = this.getDb(fft[i]);
      }
    }
    // Compress data
    else if (size < totalBins) {
      const step = totalBins / size;

      for (let i = minBin, k = 0; i < maxBin; i += 1, k += 1) {
        const start = ~~(i * step);
        const end = ~~(start + step);
        let max = 0;

        // Find max value within range
        for (let j = start, n = ~~(step / 10) || 1; j < end; j += n) {
          const val = fft[j];

          if (val > max) {
            max = val;
          } else if (-val > max) {
            max = -val;
          }
        }

        output[k] = this.getDb(max);
      }
    }
    // Expand data
    else if (size > totalBins) {
      const step = size / totalBins;

      for (let i = minBin, j = 0; i < maxBin; i += 1, j += 1) {
        const val = this.getDb(fft[i]);
        const start = ~~(j * step);
        const end = start + step;

        for (let k = start; k < end; k += 1) {
          output[k] = val;
        }
      }
    }

    // Apply smoothing
    if (smoothingTimeConstant > 0) {
      for (let i = 0; i < size; i += 1) {
        output[i] = buffer[i] * smoothingTimeConstant + output[i] * (1.0 - smoothingTimeConstant);
        buffer[i] = output[i];
      }
    }

    return output;
  }
}
