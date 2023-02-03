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
      if (isCompletedRecord(record)) {
        completedRecords.push(record);
      } else {
        activeRecord = record;
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

export function renameCurrentRecord(note: string, newName: string): string {
  let [first, ...remaining] = note.split('\n'); // TODO: Optimise this

  let record = parseRecord(first);

  if (isCompletedRecord(record)) {
    throw new Error('Cannot change completed record');
  }

  const newFirst = printActiveRecord({
    ...record,
    project: newName,
  });

  return [newFirst].concat(...remaining).join('\n');
}
export function discardCurrentRecord(note: string): string {
  let [first, ...remaining] = note.split('\n'); // TODO: Optimise this

  let record = parseRecord(first);

  if (isCompletedRecord(record)) {
    return note;
  }

  return remaining.join('\n');
}

export function changeStartOfCurrentRecord(
  note: string,
  start: OffsetDateTime
): string {
  let [first, ...remaining] = note.split('\n'); // TODO: Optimise this

  if (isBeforeEndOfLastCompleted(note, start)) {
    throw new Error('Cannot predate record to before end of last record');
  }

  let newFirst = printActiveRecord({
    ...parseRecord(first),
    start,
  });

  return [newFirst].concat(...remaining).join('\n');
}

export function isBeforeEndOfLastCompleted(
  note: string,
  start: OffsetDateTime
) {
  let maybeLastCompleted = note.split('\n')[1];

  if (maybeLastCompleted != null && maybeLastCompleted !== '') {
    let previousRecord = parseRecord(maybeLastCompleted);

    if (isCompletedRecord(previousRecord)) {
      return start.isBefore(previousRecord.end);
    }
  }

  return false;
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

function isCompletedRecord(
  record: ActiveRecord | CompletedRecord
): record is CompletedRecord {
  return 'end' in record;
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
