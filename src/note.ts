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

function printRecord(record: Record): string {
  const id = record.id;
  const project = record.project;

  const start = record.start.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
  const end = record.end
    ? record.end.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
    : '';

  return `${id},${project},${start},${end}`;
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

  const newRecord = printRecord({
    id: lastIndex + 1,
    project,
    start,
  });

  return newRecord.concat('\n', note);
}

export function stopCurrentRecord(note: string, end: OffsetDateTime): string {
  let [first, ...remaining] = note.split('\n'); // TODO: Optimise this

  let newFirst = printRecord({
    ...parseRecord(first),
    end,
  });

  return [newFirst].concat(...remaining).join('\n');
}
