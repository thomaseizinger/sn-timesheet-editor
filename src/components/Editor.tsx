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
import { insertRecord, parseRecords } from '../note';
import { Duration, OffsetDateTime, ZoneId } from '@js-joda/core';
import formatSeconds from '../formatSeconds';
import { parseProjects } from '../project';

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
  let projects = parseProjects(records);

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
              </Tr>
            </Thead>
            <Tbody>
              {projects.map((project) => (
                <Tr key={project.name}>
                  <Td>{project.name}</Td>
                  <Td>
                    <FixedDuration duration={project.totalTime} />
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
