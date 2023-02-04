import React, { useState } from 'react';
import {
  Box,
  BoxProps,
  Button,
  Grid,
  GridItem,
  GridItemProps,
} from '@chakra-ui/react';
import {
  ActiveRecord,
  changeStartOfCurrentRecord,
  discardCurrentRecord,
  insertRecord,
  isBeforeEndOfLastCompleted,
  parseRecords,
  renameCurrentRecord,
  stopCurrentRecord,
} from '../note';
import {
  DateTimeFormatter,
  Duration,
  Instant,
  OffsetDateTime,
  ZoneId,
} from '@js-joda/core';
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
      {activeRecord && (
        <ActiveRecordPanel
          activeRecord={activeRecord}
          note={note}
          saveNote={saveNote}
        />
      )}

      {!activeRecord && (
        <>
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
            <Grid padding={4} templateRows={'1fr'} templateColumns={'3fr 1fr'}>
              <GridItem>
                <input
                  placeholder={'What are you working on?'}
                  style={{ width: '100%', height: '100%' }}
                  value={nextProject}
                  onChange={(e) => {
                    setNextProject(e.target.value);
                  }}
                />
              </GridItem>
              <GridItem colStart={2} justifySelf={'right'} alignSelf={'center'}>
                <Button type={'submit'} fontSize={'xl'}>
                  Start recording
                </Button>
              </GridItem>
            </Grid>
          </form>
          <Grid
            templateRows={'auto 1fr'}
            templateColumns={'2fr minmax(50px, auto) 1fr'}
            columnGap={5}
            rowGap={5}
            alignItems={'center'}
          >
            <GridItem colSpan={3} />

            <Heading text={'Project'} paddingLeft={5} />
            <Heading text={'Duration'} />
            <Heading text={'Action'} paddingRight={5} />

            <GridItem
              colSpan={3}
              borderBottom={
                '1px solid var(--chakra-colors-chakra-border-color)'
              }
            />

            {projects.map((project) => (
              <>
                <ProjectName
                  key={`project-${project.name}`}
                  name={project.name}
                  paddingLeft={5}
                />
                <FormattedDuration
                  key={`duration-${project.name}`}
                  duration={project.totalTime}
                />
                <GridItem paddingRight={5}>
                  <Button
                    key={`actions-${project.name}`}
                    width="100%"
                    fontSize={'xl'}
                    onClick={() => {
                      let newNote = insertRecord(
                        note,
                        project.name,
                        OffsetDateTime.now(ZoneId.UTC)
                      );
                      saveNote(newNote);
                    }}
                  >
                    Start
                  </Button>
                </GridItem>
              </>
            ))}
          </Grid>
        </>
      )}
    </div>
  );
}

interface HeadingProps {
  text: string;
}

function Heading({ text, ...other }: HeadingProps & GridItemProps) {
  return (
    <GridItem
      role={'columnheader'}
      textTransform={'uppercase'}
      fontSize={'sm'}
      textColor={'gray.500'}
      fontWeight={'bold'}
      {...other}
    >
      {text}
    </GridItem>
  );
}

interface ProjectNameProps {
  name: string;
}

function ProjectName({ name, ...other }: ProjectNameProps & BoxProps) {
  return (
    <Box
      textOverflow={'ellipsis'}
      overflow={'hidden'}
      whiteSpace={'nowrap'}
      {...other}
    >
      {name}
    </Box>
  );
}

interface FixedDurationProps {
  duration: Duration;
}

function FormattedDuration({
  duration,
  ...other
}: FixedDurationProps & BoxProps) {
  return <Box {...other}>{formatSeconds(duration.toMillis() / 1000)}</Box>;
}

interface ActiveRecordProps {
  activeRecord: ActiveRecord;
  note: string;
  saveNote: (newNote: string) => void;
}

function ActiveRecordPanel({
  activeRecord,
  note,
  saveNote,
}: ActiveRecordProps) {
  const duration = useDynamicDuration(activeRecord.start);
  const isLessThanOneMinute = duration.compareTo(Duration.ofMinutes(1)) < 0;

  const startMinus1m = activeRecord.start.minus(Duration.ofMinutes(1));
  const startPlus1m = activeRecord.start.plus(Duration.ofMinutes(1));

  return (
    <Grid
      padding={4}
      templateRows={'1fr auto 2fr auto 1fr auto 1fr'}
      templateColumns={'3fr 1fr'}
      rowGap={'1'}
    >
      <GridItem fontSize={'3xl'}>
        <input
          placeholder={'What are you working on?'}
          style={{ width: '100%' }}
          value={activeRecord.project}
          onChange={(e) => {
            saveNote(renameCurrentRecord(note, e.target.value));
          }}
        />
      </GridItem>
      <GridItem
        colStart={2}
        justifySelf={'right'}
        alignSelf={'center'}
        textColor={'gray.500'}
        textTransform={'uppercase'}
      >
        <Box display={'inline'}>project</Box>
      </GridItem>

      <GridItem
        colSpan={2}
        borderBottom={'1px'}
        borderStyle={'dotted'}
        borderColor={'gray.500'}
      />

      <GridItem colStart={1} alignSelf={'center'}>
        <FormattedDuration
          key={'activeDuration'}
          duration={duration}
          fontSize={'6xl'}
        />
      </GridItem>
      <GridItem
        colStart={2}
        justifySelf={'right'}
        alignSelf={'center'}
        textColor={'gray.500'}
        textTransform={'uppercase'}
      >
        <Box display={'inline'}>duration</Box>
      </GridItem>

      <GridItem
        colSpan={2}
        borderBottom={'1px'}
        borderStyle={'dotted'}
        borderColor={'gray.500'}
      />

      <GridItem
        alignSelf={'center'}
        display={'flex'}
        alignItems={'center'}
        gap={2}
      >
        <Button
          display={'inline'}
          key={'plus1mButton'}
          disabled={isBeforeEndOfLastCompleted(note, startMinus1m)}
          onClick={() => {
            let newNote = changeStartOfCurrentRecord(note, startMinus1m);
            saveNote(newNote);
          }}
        >
          &lt; 1m
        </Button>
        <span>
          {activeRecord.start
            .atZoneSameInstant(ZoneId.SYSTEM)
            .format(DateTimeFormatter.ofPattern('dd.MM.yyyy HH:mm:ss'))}
        </span>
        <Button
          display={'inline'}
          key={'minus1mButton'}
          disabled={isLessThanOneMinute}
          onClick={() => {
            let newNote = changeStartOfCurrentRecord(note, startPlus1m);
            saveNote(newNote);
          }}
        >
          1m &gt;
        </Button>
      </GridItem>
      <GridItem
        colStart={2}
        justifySelf={'right'}
        alignSelf={'center'}
        textColor={'gray.500'}
        textTransform={'uppercase'}
      >
        <Box display={'inline'}>started at</Box>
      </GridItem>

      <GridItem
        colSpan={2}
        borderBottom={'1px'}
        borderStyle={'dotted'}
        borderColor={'gray.500'}
      />

      <GridItem colSpan={2} justifySelf={'right'} alignSelf={'center'}>
        <Button
          fontSize={'xl'}
          onClick={() => saveNote(discardCurrentRecord(note))}
        >
          Discard
        </Button>
        &nbsp;
        <Button
          disabled={activeRecord.project === ''}
          fontSize={'xl'}
          onClick={() => {
            let newNote = stopCurrentRecord(
              note,
              OffsetDateTime.now(ZoneId.UTC)
            );
            saveNote(newNote);
          }}
        >
          Stop recording
        </Button>
      </GridItem>
    </Grid>
  );
}

function useDynamicDuration(start: OffsetDateTime) {
  let [end, setEnd] = useState(Instant.now());
  useInterval(() => {
    setEnd(Instant.now());
  }, 1000);

  return Duration.between(start, OffsetDateTime.ofInstant(end, ZoneId.UTC));
}
