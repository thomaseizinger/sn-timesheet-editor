import React, { useEffect, useRef, useState } from 'react';
import EditorKit from '@standardnotes/editor-kit';
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
import { insertRecord, parseRecords } from '../note';
import {
  DateTimeFormatter,
  Duration,
  Instant,
  OffsetDateTime,
  ZoneId,
} from '@js-joda/core';
import formatSeconds from '../formatSeconds';

export function useNote(): [string, (newText: string) => void] {
  let [note, setNote] = useState('');
  let editorKitReference = useRef<EditorKit>();

  useEffect(() => {
    editorKitReference.current = new EditorKit(
      {
        setEditorRawText: (text: string) => setNote(text),
        insertRawText: (text: string) => setNote(text),
      },
      {
        mode: 'plaintext',
        supportsFileSafe: false,
      }
    );
  }, []);

  return [
    note,
    (newText: string) => {
      editorKitReference.current!.onEditorValueChanged(newText);
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

  let records = parseRecords(note);

  return (
    <>
      <div
        className={HtmlElementId.snComponent}
        id={HtmlElementId.snComponent}
        tabIndex={0}
      >
        <textarea
          id={HtmlElementId.textarea}
          name="text"
          className={'sk-input contrast textarea'}
          placeholder="Type here. Text in this textarea is automatically saved in Standard Notes"
          rows={15}
          value={note}
          onChange={(event) => saveNote(event.target.value)}
        />
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
                  <Input />
                </Td>
                <Td>
                  <Button
                    width="100%"
                    onClick={() => {
                      let newNote = insertRecord(
                        note,
                        'test',
                        OffsetDateTime.now(ZoneId.UTC)
                      );
                      saveNote(newNote);
                    }}
                  >
                    Start
                  </Button>
                </Td>
                <Td>
                  <Button width="100%" disabled>
                    Stop
                  </Button>
                </Td>
                <Td>-</Td>
              </Tr>
              {records.map((record) => (
                <Tr>
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
                      <Button width="100%">Stop</Button>
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
