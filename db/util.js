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

export function randUniform(items, count = 1) {
  const tempItems = [...items];
  const selected = [];

  for (let i = 0; i < count && tempItems.length > 0; i++) {
    const index = randInt(0, tempItems.length - 1);
    const [selectedItem] = tempItems.splice(index, 1);
    selected.push(selectedItem);
  }

  return selected;
}

export function randByWeight(items, key, count = 1) {
  let totalWeight = items.reduce((sum, item) => sum + item[key], 0);
  const selected = [];
  const tempItems = [...items];

  for (let i = 0; i < count && tempItems.length > 0; i++) {
    const r = Math.random() * totalWeight;
    let countWeight = 0;
    let selectedIndex = -1;

    for (let j = 0; j < tempItems.length; j++) {
      countWeight += tempItems[j][key];
      if (countWeight >= r) {
        selectedIndex = j;
        break;
      }
    }

    if (selectedIndex !== -1) {
      const [selectedItem] = tempItems.splice(selectedIndex, 1);
      selected.push(selectedItem);
      totalWeight -= selectedItem[key];
    }
  }

  return selected;
}

export function uniqueByKey(arr, key) {
  return arr.filter(
    (item, index, self) => index === self.findIndex((t) => t[key] === item[key])
  );
}
