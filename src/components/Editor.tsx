import React, { useState } from 'react';
import {
  AlertTitle,
  Box,
  BoxProps,
  Button,
  Grid,
  GridItem,
  GridItemProps,
  HStack,
  Input,
  SimpleGrid,
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
              disabled={!nextProject || !!activeRecord}
            >
              Start
            </Button>
          </SimpleGrid>
        </form>
      </Box>

      {activeRecord && (
        <ActiveRecordPanel
          activeRecord={activeRecord}
          note={note}
          saveNote={saveNote}
        />
      )}

      {!activeRecord && (
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
            borderBottom={'1px solid var(--chakra-colors-chakra-border-color)'}
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
                  disabled={!!activeRecord}
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
    <Grid padding={4} templateRows={'1fr 2fr 1fr'} templateColumns={'3fr 1fr'}>
      <GridItem fontSize={'3xl'} textDecoration={'underline'}>
        <span>Project: </span>
        <Box display={'inline'}>{activeRecord.project}</Box>
      </GridItem>
      <GridItem colStart={1} alignSelf={'center'}>
        <FormattedDuration
          key={'activeDuration'}
          duration={duration}
          fontSize={'6xl'}
        />
      </GridItem>
      <GridItem
        rowStart={3}
        colStart={2}
        colSpan={2}
        alignSelf={'center'}
        justifySelf={'right'}
      >
        <Button
          key={'stopButton'}
          flexGrow={1}
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
      <GridItem rowStart={3} alignSelf={'center'}>
        <span>Started at: </span>
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
        <span>{activeRecord.start.toString()}</span>
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
