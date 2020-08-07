/**
 * Not a true random shuffle but a modified Fisher-Yates that prevents the last
 * element from becoming the first. Therefore it won't do anything when
 * a.length < 3.
 */
export const reshuffle = (a) => {
  if (!a.length) return a;
  for (let i = a.length - 2; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // Final swap
  const last = a.length - 1;
  const i = Math.ceil(Math.random() * last);
  [a[i], a[last]] = [a[last], a[i]];
  return a;
};

/**
 * TODO the initial shuffle should be truly random.
 * True random shuffle.
 */
export const shuffle = (a) => {
  if (!a.length) return a;
  for (let i = a.length - 2; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  // Final swap
  const last = a.length - 1;
  const i = Math.ceil(Math.random() * last);
  [a[i], a[last]] = [a[last], a[i]];
  return a;
};

export const listOfIntegers = (length) => {
  return Array(length)
    .fill()
    .map((_, i) => i);
};
