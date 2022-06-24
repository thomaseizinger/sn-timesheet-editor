import { DateTimeFormatter, OffsetDateTime } from '@js-joda/core';

export interface Record {
  id: number;
  project: string;
  start: OffsetDateTime;
  end?: OffsetDateTime;
}

export function parseRecords(note: string): Record[] {
  if (note.length == 0) {
    return [];
  }

  return note.split('\n').map(parseRecord);
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
  let lastIndex = parseInt(note.slice(0, note.indexOf(',')));

  const newRecord = `${lastIndex + 1},${project},${start.format(
    DateTimeFormatter.ISO_OFFSET_DATE_TIME
  )},`;

  return newRecord.concat('\n', note);
}
