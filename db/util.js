export function attachReverseWeights(items, key, revKey) {
  let sorted = items.map((i) => ({ ...i })).sort((a, b) => a[key] - b[key]);
  let sortedRev = items.map((i) => ({ ...i })).sort((a, b) => b[key] - a[key]);
  return sorted.map((item, index) => ({
    ...item,
    [revKey]: sortedRev[index][key],
  }));
}

export function mask(arr) {
  return Array(arr.length).fill("?").join();
}

export function randInt(min, max) {
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randByWeight(items, key) {
  let totalWeight = 0;
  for (const item of items) totalWeight += item[key];
  const r = Math.random() * totalWeight;
  let countWeight = 0;
  for (const item of items) {
    countWeight += item[key];
    if (countWeight >= r) return item;
  }
}
