import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
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
import { insertRecord, parseRecords, stopCurrentRecord } from '../note';
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
}

export default function Editor({ note, saveNote }: Props) {
  const [nextProject, setNextProject] = useState('');

  let [completedRecords, activeRecord] = parseRecords(note);
  let projects = parseProjects(completedRecords);
  let sumAllProjects = projects.reduce(
    (sum, project) => sum.plus(project.totalTime),
    Duration.ZERO
  );

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
              <Th>Duration</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {activeRecord && (
              <Tr key="active" backgroundColor="green.50">
                <Td>{activeRecord.project}</Td>
                <Td>
                  <DynamicDuration start={activeRecord.start} />
                </Td>
                <Td>
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
                </Td>
              </Tr>
            )}
            {projects.map((project) => (
              <Tr key={project.name}>
                <Td>{project.name}</Td>
                <Td>
                  <FixedDuration duration={project.totalTime} />
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
      {projects.length > 0 && (
        <Box
          padding={'var(--chakra-space-5) var(--chakra-space-8)'}
          textAlign={'right'}
        >
          Total:&nbsp;
          <FixedDuration duration={sumAllProjects} />
        </Box>
      )}
    </div>
  );
}

interface FixedDurationProps {
  duration: Duration;
}

function FixedDuration({ duration }: FixedDurationProps) {
  return <span>{formatSeconds(duration.toMillis() / 1000)}</span>;
}

interface DynamicDurationProps {
  start: OffsetDateTime;
}

function DynamicDuration({ start }: DynamicDurationProps) {
  const duration = useDynamicDuration(start);

  return <FixedDuration duration={duration} />;
}

function useDynamicDuration(start: OffsetDateTime) {
  let [end, setEnd] = useState(Instant.now());
  useInterval(() => {
    setEnd(Instant.now());
  }, 1000);

  return Duration.between(start, OffsetDateTime.ofInstant(end, ZoneId.UTC));
}
