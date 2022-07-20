import React, { useState } from 'react';
import {
  Button,
  Input,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useInterval,
} from '@chakra-ui/react';
import { insertRecord, parseRecords, stopCurrentRecord } from '../note';
import {
  ChronoField,
  DateTimeFormatterBuilder,
  Duration,
  Instant,
  OffsetDateTime,
  ZoneId,
} from '@js-joda/core';
import formatSeconds from '../formatSeconds';

export enum HtmlElementId {
  snComponent = 'sn-component',
  textarea = 'textarea',
}

interface Props {
  note: string;
  saveNote: (newNote: string) => void;
}

export default function Editor({ note, saveNote }: Props) {
  const [nextProject, setNextProject] = useState('');

  let records = parseRecords(note);

  return (
    <>
      <div
        className={HtmlElementId.snComponent}
        id={HtmlElementId.snComponent}
        tabIndex={0}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            let newNote = insertRecord(
              note,
              nextProject,
              OffsetDateTime.now(ZoneId.UTC)
            );
            setNextProject('');
            saveNote(newNote);
          }}
        >
          <SimpleGrid columns={2}>
            <Input
              height="100%"
              placeholder={'What are you working on?'}
              value={nextProject}
              onChange={(event) => setNextProject(event.target.value)}
            />
            <Button
              width="100%"
              padding="2rem"
              type="submit"
              disabled={!nextProject}
            >
              Start timer
            </Button>
          </SimpleGrid>
        </form>
        <TableContainer>
          <Table variant="simple" size="lg">
            <Thead>
              <Tr>
                <Th>Project</Th>
                <Th>Start</Th>
                <Th>End</Th>
                <Th>Duration</Th>
              </Tr>
            </Thead>
            <Tbody>
              {records.map((record) => (
                <Tr key={record.id}>
                  <Td>{record.project}</Td>
                  <Td>
                    <FormattedDatetime timestamp={record.start} />
                  </Td>
                  <Td>
                    {record.end ? (
                      <FormattedDatetime timestamp={record.end} />
                    ) : (
                      <Button
                        width="100%"
                        onClick={() => {
                          let newNote = stopCurrentRecord(
                            note,
                            OffsetDateTime.now(ZoneId.UTC)
                          );
                          saveNote(newNote);
                        }}
                      >
                        Stop timer
                      </Button>
                    )}
                  </Td>
                  <Td>
                    {record.end ? (
                      <FixedDuration start={record.start} end={record.end} />
                    ) : (
                      <DynamicDuration start={record.start} />
                    )}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
}

interface FormattedDateTimeProps {
  timestamp: OffsetDateTime;
}

function FormattedDatetime({ timestamp }: FormattedDateTimeProps) {
  const formatted = timestamp
    .atZoneSameInstant(ZoneId.systemDefault())
    .format(
      new DateTimeFormatterBuilder()
        .appendValue(ChronoField.YEAR)
        .appendLiteral('-')
        .appendValue(ChronoField.MONTH_OF_YEAR, 2)
        .appendLiteral('-')
        .appendValue(ChronoField.DAY_OF_MONTH, 2)
        .appendLiteral(' ')
        .appendValue(ChronoField.HOUR_OF_DAY, 2)
        .appendLiteral(':')
        .appendValue(ChronoField.MINUTE_OF_HOUR, 2)
        .appendLiteral(':')
        .appendValue(ChronoField.SECOND_OF_MINUTE, 2)
        .toFormatter()
    );

  return <span>{formatted}</span>;
}

interface FixedDurationProps {
  start: OffsetDateTime;
  end: OffsetDateTime;
}

function FixedDuration({ start, end }: FixedDurationProps) {
  return (
    <span>{formatSeconds(Duration.between(start, end).toMillis() / 1000)}</span>
  );
}

interface DynamicDurationProps {
  start: OffsetDateTime;
}

function DynamicDuration({ start }: DynamicDurationProps) {
  let [end, setEnd] = useState(Instant.now());
  useInterval(() => {
    setEnd(Instant.now());
  }, 1000);

  return (
    <FixedDuration
      start={start}
      end={OffsetDateTime.ofInstant(end, ZoneId.UTC)}
    />
  );
}
