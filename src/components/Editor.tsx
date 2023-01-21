import React, { useState } from 'react';
import {
  Box,
  Button,
  HStack,
  Input,
  SimpleGrid,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import {
  ActiveRecord,
  changeStartOfCurrentRecord,
  insertRecord,
  isBeforeEndOfLastCompleted,
  parseRecords,
  stopCurrentRecord,
} from '../note';
import { Duration, Instant, OffsetDateTime, ZoneId } from '@js-joda/core';
import formatSeconds from '../formatSeconds';
import { parseProjects } from '../project';
import { useInterval } from 'usehooks-ts';

export enum HtmlElementId {
  snComponent = 'sn-component',
  textarea = 'textarea',
}

interface Props {
  note: string;
  saveNote: (newNote: string) => void;
  setPreview: (newPreview: string) => void;
}

export default function Editor({ note, saveNote, setPreview }: Props) {
  const [nextProject, setNextProject] = useState('');

  let [completedRecords, activeRecord] = parseRecords(note);
  let projects = parseProjects(completedRecords);
  let sumAllProjects = projects.reduce(
    (sum, project) => sum.plus(project.totalTime),
    Duration.ZERO
  );
  setPreview(`Total: ${formatSeconds(sumAllProjects.toMillis() / 1000)}`);

  return (
    <div
      className={HtmlElementId.snComponent}
      id={HtmlElementId.snComponent}
      tabIndex={0}
    >
      <Box
        borderBottom={'1px solid var(--chakra-colors-chakra-border-color)'}
        paddingTop={'1px'}
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
              border={'0px'}
              borderRadius={0}
              onChange={(event) => setNextProject(event.target.value)}
            />
            <Button
              padding="2rem"
              type="submit"
              borderRadius={0}
              disabled={!nextProject}
            >
              Start timer
            </Button>
          </SimpleGrid>
        </form>
      </Box>
      <TableContainer>
        <Table size="lg">
          <Thead>
            <Tr>
              <Th>Project</Th>
              <Th>Time</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activeRecord && (
              <ActiveRecordRow
                activeRecord={activeRecord}
                note={note}
                saveNote={saveNote}
              />
            )}
            {projects.map((project) => (
              <Tr key={project.name}>
                <Td>{project.name}</Td>
                <Td>
                  <FormattedDuration duration={project.totalTime} />
                </Td>
                <Td>
                  <Button
                    width="100%"
                    disabled={!!activeRecord}
                    onClick={() => {
                      let newNote = insertRecord(
                        note,
                        project.name,
                        OffsetDateTime.now(ZoneId.UTC)
                      );
                      saveNote(newNote);
                    }}
                  >
                    Start timer
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </div>
  );
}

interface FixedDurationProps {
  duration: Duration;
}

function FormattedDuration({ duration }: FixedDurationProps) {
  return <span>{formatSeconds(duration.toMillis() / 1000)}</span>;
}

interface ActiveRecordProps {
  activeRecord: ActiveRecord;
  note: string;
  saveNote: (newNote: string) => void;
}

function ActiveRecordRow({ activeRecord, note, saveNote }: ActiveRecordProps) {
  const duration = useDynamicDuration(activeRecord.start);
  const isLessThanOneMinute = duration.compareTo(Duration.ofMinutes(1)) < 0;

  const startMinus1m = activeRecord.start.minus(Duration.ofMinutes(1));
  const startPlus1m = activeRecord.start.plus(Duration.ofMinutes(1));

  return (
    <Tr key="active" backgroundColor="green.50">
      <Td>{activeRecord.project}</Td>
      <Td>
        <FormattedDuration duration={duration} />
      </Td>
      <Td>
        <HStack gap={'1'}>
          <Button
            disabled={isBeforeEndOfLastCompleted(note, startMinus1m)}
            onClick={() => {
              let newNote = changeStartOfCurrentRecord(note, startMinus1m);
              saveNote(newNote);
            }}
          >
            +1m
          </Button>
          <Button
            flexGrow={1}
            onClick={() => {
              let newNote = stopCurrentRecord(
                note,
                OffsetDateTime.now(ZoneId.UTC)
              );
              saveNote(newNote);
            }}
          >
            Stop
          </Button>
          <Button
            disabled={isLessThanOneMinute}
            onClick={() => {
              let newNote = changeStartOfCurrentRecord(note, startPlus1m);
              saveNote(newNote);
            }}
          >
            -1m
          </Button>
        </HStack>
      </Td>
    </Tr>
  );
}

function useDynamicDuration(start: OffsetDateTime) {
  let [end, setEnd] = useState(Instant.now());
  useInterval(() => {
    setEnd(Instant.now());
  }, 1000);

  return Duration.between(start, OffsetDateTime.ofInstant(end, ZoneId.UTC));
}
