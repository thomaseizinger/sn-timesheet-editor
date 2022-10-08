import { DateTimeFormatter, OffsetDateTime } from '@js-joda/core';

export interface CompletedRecord {
  id: number;
  project: string;
  start: OffsetDateTime;
  end: OffsetDateTime;
}

export interface ActiveRecord {
  id: number;
  project: string;
  start: OffsetDateTime;
}

export function parseRecords(
  note: string
): [CompletedRecord[], ActiveRecord | undefined] {
  if (note.length === 0) {
    return [[], undefined];
  }

  let completedRecords = [];

  let activeRecord;

  for (const line of note.split('\n')) {
    try {
      let record = parseRecord(line);
      if (!('end' in record)) {
        activeRecord = record;
      } else {
        completedRecords.push(record);
      }
    } catch (e) {}
  }

  return [completedRecords, activeRecord];
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

  const newRecord = printActiveRecord({
    id: lastIndex + 1,
    project,
    start,
  });

  return newRecord.concat('\n', note);
}

export function stopCurrentRecord(note: string, end: OffsetDateTime): string {
  let [first, ...remaining] = note.split('\n'); // TODO: Optimise this

  let newFirst = printCompletedRecord({
    ...parseRecord(first),
    end,
  });

  return [newFirst].concat(...remaining).join('\n');
}

function parseRecord(line: string): CompletedRecord | ActiveRecord {
  let [id, project, start, end] = line.split(',');

  if (!end) {
    return {
      id: parseInt(id),
      project,
      start: OffsetDateTime.parse(
        start,
        DateTimeFormatter.ISO_OFFSET_DATE_TIME
      ),
    };
  } else {
    return {
      id: parseInt(id),
      project,
      start: OffsetDateTime.parse(
        start,
        DateTimeFormatter.ISO_OFFSET_DATE_TIME
      ),
      end: OffsetDateTime.parse(end, DateTimeFormatter.ISO_OFFSET_DATE_TIME),
    };
  }
}

function printActiveRecord(record: ActiveRecord): string {
  const id = record.id;
  const project = record.project;

  const start = record.start.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);

  return `${id},${project},${start},`;
}

function printCompletedRecord(record: CompletedRecord): string {
  const id = record.id;
  const project = record.project;

  const start = record.start.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
  const end = record.end.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);

  return `${id},${project},${start},${end}`;
}
