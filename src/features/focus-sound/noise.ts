/**
 * 집중 소리를 숫자(샘플)로 만들고 다듬는 순수 함수 모음.
 * 노이즈는 파일 없이 브라우저에서 바로 만들고, 반복 이음매는 녹음 소리에도 씁니다.
 * 샘플은 -1~1 사이 값이고, 난수(rand)를 바깥에서 받아 테스트에서 똑같이 만들 수 있습니다.
 */

export type Random = () => number;

/** 소리 샘플 (브라우저 오디오에 바로 넣을 수 있는 형태) */
export type Samples = Float32Array<ArrayBuffer>;

/** 백색소음: 모든 높이의 소리가 고르게 섞인 "치이익" */
export function whiteNoise(length: number, rand: Random): Samples {
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) out[i] = rand() * 2 - 1;
  return out;
}

/** 핑크 노이즈: 높은 소리를 조금 줄인 부드러운 "쏴아" (Paul Kellet 방식) */
export function pinkNoise(length: number, rand: Random): Samples {
  const out = new Float32Array(length);
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  for (let i = 0; i < length; i++) {
    const white = rand() * 2 - 1;
    b0 = 0.99765 * b0 + white * 0.099046;
    b1 = 0.963 * b1 + white * 0.2965164;
    b2 = 0.57 * b2 + white * 1.0526913;
    out[i] = b0 + b1 + b2 + white * 0.1848;
  }
  return out;
}

/** 브라운 노이즈: 높은 소리를 많이 줄인 낮고 묵직한 "웅웅" */
export function brownNoise(length: number, rand: Random): Samples {
  const out = new Float32Array(length);
  let last = 0;
  for (let i = 0; i < length; i++) {
    // 조금씩 쌓되 0 쪽으로 천천히 돌아오게 해서 한쪽으로 치우치지 않음
    last = (last + 0.02 * (rand() * 2 - 1)) / 1.02;
    out[i] = last;
  }
  return out;
}

/** 소리 크기(RMS)를 맞추고, 넘치는 값은 -1~1로 자릅니다. */
export function normalize(samples: Samples, targetRms: number) {
  let sum = 0;
  for (const s of samples) sum += s * s;
  const rms = Math.sqrt(sum / samples.length) || 1;
  const scale = targetRms / rms;
  for (let i = 0; i < samples.length; i++) {
    samples[i] = Math.max(-1, Math.min(1, samples[i] * scale));
  }
}

/**
 * 끝과 처음이 이어지게 만들어 반복해도 끊기는 곳이 없게 합니다.
 * 마지막 fade개 샘플을 처음 부분에 서서히 겹쳐서, 결과 길이는 fade만큼 짧아집니다.
 * (결과의 끝 다음이 원래 흐름의 다음 샘플이 되어 자연스럽게 이어짐)
 */
export function loopSeamlessly(samples: Samples, fade: number): Samples {
  const length = samples.length - fade;
  const out = samples.slice(0, length);
  for (let i = 0; i < fade; i++) {
    // 노이즈끼리 겹치므로 소리 크기가 일정하게 유지되는 곡선으로 겹침
    const head = Math.sin(((i / fade) * Math.PI) / 2);
    const tail = Math.cos(((i / fade) * Math.PI) / 2);
    out[i] = samples[i] * head + samples[length + i] * tail;
  }
  return out;
}
