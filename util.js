export function timerSettingsToSeconds({ h, m, s }) {
  const seconds = Number(h) * 60 * 60 + Number(m) * 60 + Number(s);
  return seconds;
}
