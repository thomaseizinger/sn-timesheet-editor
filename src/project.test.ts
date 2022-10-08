import { Record } from './note';
import { Duration, OffsetDateTime, ZoneOffset } from '@js-joda/core';
import { parseProjects } from './project';

test('should sum time records of projects', () => {
  let timeRecords: Record[] = [
    {
      id: 1,
      project: 'foo',
      start: aTimestamp(0),
      end: aTimestamp(2),
    },
    {
      id: 2,
      project: 'bar',
      start: aTimestamp(2),
      end: aTimestamp(4),
    },
    {
      id: 3,
      project: 'foo',
      start: aTimestamp(4),
      end: aTimestamp(7),
    },
  ];

  const projects = parseProjects(timeRecords);

  expect(projects).toStrictEqual([
    {
      name: 'foo',
      totalTime: Duration.ofHours(5),
    },
    {
      name: 'bar',
      totalTime: Duration.ofHours(2),
    },
  ]);
});

test('should ignore records without end time', () => {
  let timeRecords: Record[] = [
    {
      id: 1,
      project: 'foo',
      start: aTimestamp(0),
      end: aTimestamp(2),
    },
    {
      id: 2,
      project: 'bar',
      start: aTimestamp(2),
      end: aTimestamp(4),
    },
    {
      id: 3,
      project: 'foo',
      start: aTimestamp(4),
    },
  ];

  const projects = parseProjects(timeRecords);

  expect(projects).toStrictEqual([
    {
      name: 'foo',
      totalTime: Duration.ofHours(2),
    },
    {
      name: 'bar',
      totalTime: Duration.ofHours(2),
    },
  ]);
});

test('should sort records based on duration', () => {
  let timeRecords: Record[] = [
    {
      id: 1,
      project: 'foo',
      start: aTimestamp(0),
      end: aTimestamp(2),
    },
    {
      id: 2,
      project: 'bar',
      start: aTimestamp(2),
      end: aTimestamp(7),
    },
    {
      id: 3,
      project: 'foo',
      start: aTimestamp(7),
      end: aTimestamp(8),
    },
  ];

  const projects = parseProjects(timeRecords);

  expect(projects).toStrictEqual([
    {
      name: 'bar',
      totalTime: Duration.ofHours(5),
    },
    {
      name: 'foo',
      totalTime: Duration.ofHours(3),
    },
  ]);
});

function aTimestamp(hour: number) {
  return OffsetDateTime.of(2022, 10, 8, hour, 0, 0, 0, ZoneOffset.UTC);
}
