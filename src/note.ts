import { DateTimeFormatter, OffsetDateTime } from '@js-joda/core';

export interface Record {
  project: string;
  start: OffsetDateTime;
  end?: OffsetDateTime;
}

export function parseRecords(note: string): Record[] {
  if (note.length == 0) {
    return [];
  }

  return note.split('\n').map((line) => {
    let [project, start, end] = line.split(',');

    return {
      project,
      start: OffsetDateTime.parse(
        start,
        DateTimeFormatter.ISO_OFFSET_DATE_TIME
      ),
      end: end
        ? OffsetDateTime.parse(end, DateTimeFormatter.ISO_OFFSET_DATE_TIME)
        : undefined,
    };
  });
}

export function insertRecord(
  note: string,
  project: string,
  start: OffsetDateTime
): string {
  const newRecord = `${project},${start.format(
    DateTimeFormatter.ISO_OFFSET_DATE_TIME
  )},`;

  return newRecord.concat('\n', note);
}
