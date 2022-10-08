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
      </div>
    </>
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
  let [end, setEnd] = useState(Instant.now());
  useInterval(() => {
    setEnd(Instant.now());
  }, 1000);

  return (
    <FixedDuration
      duration={Duration.between(
        start,
        OffsetDateTime.ofInstant(end, ZoneId.UTC)
      )}
    />
  );
}
