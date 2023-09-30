"use client";
import useTimer from "@/hooks/useTimer";

export default function Countdown() {
  const timer = useTimer();
  const date = new Date(parseInt(timer.millis, 10));
  const millis = date.getUTCMilliseconds();
  const tenths = Math.floor(millis / 100);
  const seconds = date.getUTCSeconds();
  const minutes = date.getUTCMinutes();
  const hours = date.getUTCHours();

  const showHours = hours > 0;
  const showTenths = timer.millis > 0 && timer.millis < 4000;

  const h = hours < 10 ? `0${hours}` : `${hours}`;
  const m = minutes < 10 && showHours ? `0${minutes}` : `${minutes}`;
  const s = seconds < 10 ? `0${seconds}` : `${seconds}`;
  let timeString = showHours ? `${h}:${m}:${s}` : `${m}:${s}`;
  if (showTenths) timeString += `.${tenths}`;

  const classes = [
    styles.timer,
    timer.isRunning ? styles.running : "",
    showTenths ? styles.warning : "",
  ].join(" ");

  return (
    <span className={classes} onClick={() => timer.toggle()}>
      {timeString}
    </span>
  );
}
