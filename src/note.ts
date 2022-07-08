import { DateTimeFormatter, OffsetDateTime } from '@js-joda/core';

export interface Record {
  id: number;
  project: string;
  start: OffsetDateTime;
  end?: OffsetDateTime;
}

export function parseRecords(note: string): Record[] {
  if (note.length === 0) {
    return [];
  }

  return note.split('\n').flatMap((record) => {
    try {
      return [parseRecord(record)];
    } catch (e) {
      return [];
    }
  });
}

function parseRecord(line: string) {
  let [id, project, start, end] = line.split(',');

  return {
    id: parseInt(id),
    project,
    start: OffsetDateTime.parse(start, DateTimeFormatter.ISO_OFFSET_DATE_TIME),
    end: end
      ? OffsetDateTime.parse(end, DateTimeFormatter.ISO_OFFSET_DATE_TIME)
      : undefined,
  };
}

export function insertRecord(
  note: string,
  project: string,
  start: OffsetDateTime
): string {
  let lastIndex;

  if (note.length === 0) {
    lastIndex = 0;
  } else {
    lastIndex = parseInt(note.slice(0, note.indexOf(',')));
  }

  const newRecord = `${lastIndex + 1},${project},${start.format(
    DateTimeFormatter.ISO_OFFSET_DATE_TIME
  )},`;

  return newRecord.concat('\n', note);
}

export function stopCurrentRecord(note: string, end: OffsetDateTime): string {
  let [first, ...remaining] = note.split('\n'); // TODO: Optimise this
  let newFirst = `${first}${end.format(
    DateTimeFormatter.ISO_OFFSET_DATE_TIME
  )}`;

  return [newFirst].concat(...remaining).join('\n');
}
