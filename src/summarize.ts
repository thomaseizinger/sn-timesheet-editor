import { parse } from 'papaparse';

export default function summarize(inputCSV: string): string {
  const parsedCSV = parse<string[]>(inputCSV, {
    header: false,
    skipEmptyLines: true,
  });

  const durations: Record<string, number> = {};

  parsedCSV.data.forEach((row) => {
    const [_, task, start, end] = row;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const duration = (endDate.getTime() - startDate.getTime()) / 1000;

    if (durations.hasOwnProperty(task)) {
      durations[task] += duration;
    } else {
      durations[task] = duration;
    }
  });

  const sortedDurations = Object.entries(durations).sort(
    ([_taskA, durationA], [_taskB, durationB]) => durationB - durationA
  );

  const outputCSV =
    'Item,Duration\n' +
    sortedDurations
      .map(([task, duration]) => `${task},${duration.toFixed(0)}`)
      .join('\n');

  return outputCSV;
}
