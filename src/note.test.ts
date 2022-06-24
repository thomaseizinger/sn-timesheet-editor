import { insertRecord, parseRecords } from './note';
import { Instant, OffsetDateTime, ZoneId } from '@js-joda/core';

test('can parse a record', () => {
  let record = 'libp2p,2022-06-24T16:35:15.000Z,2022-06-24T18:35:45.000Z';

  let records = parseRecords(record);

  expect(records).toStrictEqual([
    {
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
  let records = 'libp2p,2022-06-24T16:35:15.000Z,2022-06-24T18:35:45.000Z';

  let newRecords = insertRecord(
    records,
    'xtra',
    OffsetDateTime.ofInstant(Instant.ofEpochMilli(1656095911000), ZoneId.UTC)
  );

  expect(newRecords).toStrictEqual(
    `xtra,2022-06-24T18:38:31Z,
libp2p,2022-06-24T16:35:15.000Z,2022-06-24T18:35:45.000Z`
  );
});
