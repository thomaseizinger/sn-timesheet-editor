import { insertRecord, parseRecords, stopCurrentRecord } from './note';
import { Instant, OffsetDateTime, ZoneId } from '@js-joda/core';

test('can parse a record', () => {
  let record = '1,libp2p,2022-06-24T16:35:15.000Z,2022-06-24T18:35:45.000Z';

  let records = parseRecords(record);

  expect(records).toStrictEqual([
    {
      id: 1,
      project: 'libp2p',
      start: OffsetDateTime.ofInstant(
        Instant.ofEpochMilli(1656088515000),
        ZoneId.UTC
      ),
      end: OffsetDateTime.ofInstant(
        Instant.ofEpochMilli(1656095745000),
        ZoneId.UTC
      ),
    },
  ]);
});

test('can insert a new record', () => {
  let records = '1,libp2p,2022-06-24T16:35:15.000Z,2022-06-24T18:35:45.000Z';

  let newRecords = insertRecord(
    records,
    'xtra',
    OffsetDateTime.ofInstant(Instant.ofEpochMilli(1656095911000), ZoneId.UTC)
  );

  expect(newRecords).toStrictEqual(
    `2,xtra,2022-06-24T18:38:31Z,
1,libp2p,2022-06-24T16:35:15.000Z,2022-06-24T18:35:45.000Z`
  );
});

test('can insert a new record into empty note', () => {
  let records = '';

  let newRecords = insertRecord(
    records,
    'xtra',
    OffsetDateTime.ofInstant(Instant.ofEpochMilli(1656095911000), ZoneId.UTC)
  );

  expect(newRecords).toStrictEqual(
    `1,xtra,2022-06-24T18:38:31Z,
`
  );
});

test('can stop current record', () => {
  let records = `2,xtra,2022-06-24T18:38:31Z,
1,libp2p,2022-06-24T16:35:15.000Z,2022-06-24T18:35:45.000Z`;

  let newRecords = stopCurrentRecord(
    records,
    OffsetDateTime.ofInstant(Instant.ofEpochMilli(1656099911000), ZoneId.UTC)
  );

  expect(newRecords).toStrictEqual(
    `2,xtra,2022-06-24T18:38:31Z,2022-06-24T19:45:11Z
1,libp2p,2022-06-24T16:35:15.000Z,2022-06-24T18:35:45.000Z`
  );
});
