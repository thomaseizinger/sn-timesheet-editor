import React, { useEffect, useState } from 'react';
import {
  Button,
  Input,
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
  DateTimeFormatter,
  Duration,
  Instant,
  OffsetDateTime,
  ZoneId,
} from '@js-joda/core';
import formatSeconds from '../formatSeconds';
import EditorKitBase from '@standardnotes/editor-kit';

export function useNote(): [string, (newText: string) => void] {
  let [note, setNote] = useState('');
  let [editorKit, setEditorKit] = useState<EditorKitBase | null>(null);

  useEffect(() => {
    let editorKit = new EditorKitBase(
      {
        setEditorRawText: (text: string) => setNote(text),
        insertRawText: (text: string) => setNote(text),
      },
      {
        mode: 'plaintext',
        supportsFileSafe: false,
      }
    );
    setEditorKit(editorKit);
  }, [setEditorKit]);

  return [
    note,
    (newText: string) => {
      editorKit?.onEditorValueChanged(newText);
      setNote(newText);
    },
  ];
}

export enum HtmlElementId {
  snComponent = 'sn-component',
  textarea = 'textarea',
}

export default function Editor() {
  const [note, saveNote] = useNote();
  const [nextProject, setNextProject] = useState('');

  let records = parseRecords(note);

  return (
    <>
      <div
        className={HtmlElementId.snComponent}
        id={HtmlElementId.snComponent}
        tabIndex={0}
      >
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
              <Tr>
                <Td>
                  <Input
                    value={nextProject}
                    onChange={(event) => setNextProject(event.target.value)}
                  />
                </Td>
                <Td>
                  <Button
                    width="100%"
                    onClick={() => {
                      let newNote = insertRecord(
                        note,
                        nextProject,
                        OffsetDateTime.now(ZoneId.UTC)
                      );
                      setNextProject('');
                      saveNote(newNote);
                    }}
                  >
                    Start
                  </Button>
                </Td>
                <Td>-</Td>
                <Td>-</Td>
              </Tr>
              {records.map((record) => (
                <Tr key={record.id}>
                  <Td>{record.project}</Td>
                  <Td>
                    {record.start.format(
                      DateTimeFormatter.ISO_OFFSET_DATE_TIME
                    )}
                  </Td>
                  <Td>
                    {record.end ? (
                      record.end.format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
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
                        Stop
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
