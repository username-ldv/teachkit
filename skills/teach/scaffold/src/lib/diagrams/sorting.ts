/**
 * The elementary sorts, instrumented — the model behind <SortLab>.
 *
 * This lives outside the component on purpose: a lesson that quotes these
 * numbers imports them from here, so the table in the prose and the counter
 * under the figure come from the same code and cannot drift apart. Re-derive
 * them by running this module rather than by trusting a table. `comps` counts element-to-element
 * comparisons; `writes` counts assignments into the array, so a swap is 2.
 */

export type Algo = 'bubble' | 'selection' | 'insertion';
export const ALGOS: Algo[] = ['bubble', 'selection', 'insertion'];

export type PresetName = 'shuffled' | 'nearly sorted' | 'one turtle' | 'reversed';

export const PRESETS: Record<PresetName, number[]> = {
  shuffled: [5, 2, 9, 1, 7, 3, 8, 4],
  'nearly sorted': [1, 2, 4, 3, 5, 6, 8, 7],
  // One small value stranded at the far end: bubble sort's worst nightmare
  // and insertion sort's easiest non-trivial input. This is the preset that
  // turns "both are quadratic" into a visible difference.
  'one turtle': [2, 3, 4, 5, 6, 7, 8, 1],
  reversed: [8, 7, 6, 5, 4, 3, 2, 1]
};

export const PRESET_NAMES = Object.keys(PRESETS) as PresetName[];

export type Step = {
  arr: number[];
  /** The two indices being compared, if this step is a comparison. */
  cmp?: [number, number];
  /** Indices just written to. */
  wrote?: number[];
  /** Inclusive range that is finished and will not move again. */
  done?: [number, number];
  note: string;
  comps: number;
  writes: number;
};

export function bubble(src: readonly number[]): Step[] {
  const a = [...src];
  const n = a.length;
  const steps: Step[] = [];
  let comps = 0;
  let writes = 0;
  const tail = (k: number): [number, number] | undefined => (k >= n ? undefined : [k, n - 1]);
  steps.push({ arr: [...a], note: 'start', comps, writes });
  for (let pass = 0; pass < n - 1; pass++) {
    let swapped = false;
    for (let j = 0; j < n - 1 - pass; j++) {
      comps++;
      steps.push({
        arr: [...a],
        cmp: [j, j + 1],
        done: tail(n - pass),
        note: `pass ${pass + 1}: is ${a[j]} > ${a[j + 1]}?`,
        comps,
        writes
      });
      if (a[j] > a[j + 1]) {
        const t = a[j];
        a[j] = a[j + 1];
        a[j + 1] = t;
        writes += 2;
        swapped = true;
        steps.push({
          arr: [...a],
          wrote: [j, j + 1],
          done: tail(n - pass),
          note: 'yes — swap, so the larger one keeps moving right',
          comps,
          writes
        });
      }
    }
    steps.push({
      arr: [...a],
      done: tail(n - 1 - pass),
      note: `end of pass ${pass + 1}: ${a[n - 1 - pass]} is now in its final place`,
      comps,
      writes
    });
    if (!swapped) {
      steps.push({
        arr: [...a],
        done: [0, n - 1],
        note: 'a whole pass with no swap — already sorted, stop',
        comps,
        writes
      });
      return steps;
    }
  }
  steps.push({ arr: [...a], done: [0, n - 1], note: 'sorted', comps, writes });
  return steps;
}

export function selection(src: readonly number[]): Step[] {
  const a = [...src];
  const n = a.length;
  const steps: Step[] = [];
  let comps = 0;
  let writes = 0;
  const head = (k: number): [number, number] | undefined => (k <= 0 ? undefined : [0, k - 1]);
  steps.push({ arr: [...a], note: 'start', comps, writes });
  for (let k = 0; k < n - 1; k++) {
    let min = k;
    for (let j = k + 1; j < n; j++) {
      comps++;
      steps.push({
        arr: [...a],
        cmp: [min, j],
        done: head(k),
        note: `smallest in ${k}…${n - 1} so far is ${a[min]}: is ${a[j]} smaller?`,
        comps,
        writes
      });
      if (a[j] < a[min]) min = j;
    }
    const already = min === k;
    if (!already) {
      const t = a[k];
      a[k] = a[min];
      a[min] = t;
      writes += 2;
    }
    steps.push({
      arr: [...a],
      wrote: already ? [] : [k, min],
      done: head(k + 1),
      note: already
        ? `${a[k]} was already the smallest — no swap at all`
        : `swap the smallest into slot ${k} — exactly one swap this pass`,
      comps,
      writes
    });
  }
  steps.push({ arr: [...a], done: [0, n - 1], note: 'sorted', comps, writes });
  return steps;
}

export function insertion(src: readonly number[]): Step[] {
  const a = [...src];
  const n = a.length;
  const steps: Step[] = [];
  let comps = 0;
  let writes = 0;
  steps.push({
    arr: [...a],
    done: [0, 0],
    note: 'start — a one-element prefix is trivially sorted',
    comps,
    writes
  });
  for (let k = 1; k < n; k++) {
    const key = a[k];
    let j = k - 1;
    steps.push({
      arr: [...a],
      cmp: [k, k],
      done: [0, k - 1],
      note: `lift ${key} out and walk it left through the sorted prefix`,
      comps,
      writes
    });
    while (j >= 0) {
      comps++;
      steps.push({
        arr: [...a],
        cmp: [j, k],
        done: [0, k - 1],
        note: `is ${a[j]} > ${key}?`,
        comps,
        writes
      });
      if (a[j] <= key) break;
      a[j + 1] = a[j];
      writes++;
      steps.push({
        arr: [...a],
        wrote: [j + 1],
        done: [0, k - 1],
        note: `yes — shift ${a[j]} one slot right`,
        comps,
        writes
      });
      j--;
    }
    a[j + 1] = key;
    writes++;
    steps.push({
      arr: [...a],
      wrote: [j + 1],
      done: [0, k],
      note: `drop ${key} into the gap — prefix 0…${k} is sorted`,
      comps,
      writes
    });
  }
  steps.push({ arr: [...a], done: [0, n - 1], note: 'sorted', comps, writes });
  return steps;
}

export const RUNNERS: Record<Algo, (src: readonly number[]) => Step[]> = {
  bubble,
  selection,
  insertion
};

/** Number of pairs (i, j) with i < j and a[i] > a[j] — insertion sort's real cost driver. */
export function inversions(a: readonly number[]): number {
  let count = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      if (a[i] > a[j]) count++;
    }
  }
  return count;
}
