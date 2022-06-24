export default function formatSeconds(duration: number): string {
  duration = Math.floor(duration);

  let hours = Math.floor(duration / 3600);
  let minutes = Math.floor((duration - hours * 3600) / 60);
  let seconds = duration - hours * 3600 - minutes * 60;

  let string = '';

  if (hours > 0) {
    string += `${hours}h`;
  }

  if (minutes > 0) {
    if (string.length > 0) {
      string += ' ';
    }
    string += `${minutes}m`;
  }

  if (seconds > 0) {
    if (string.length > 0) {
      string += ' ';
    }
    string += `${seconds}s`;
  }

  return string;
}
