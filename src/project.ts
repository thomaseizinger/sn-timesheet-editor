import { CompletedRecord } from './note';
import { Duration } from '@js-joda/core';

/// Consolidated data of all records for a single project.
export interface Project {
  name: string;
  // firstEntry: OffsetDateTime;
  // lastEntry: OffsetDateTime;
  totalTime: Duration;
}

export function parseProjects(records: CompletedRecord[]): Project[] {
  const projects: Project[] = [];

  records
    .reduce((projects, record) => {
      const newDuration = Duration.between(record.start, record.end);
      const existingDuration = projects.get(record.project) ?? Duration.ZERO;

      projects.set(record.project, existingDuration.plus(newDuration));

      return projects;
    }, new Map())
    .forEach((duration, project) => {
      projects.push({
        name: project,
        totalTime: duration,
      });
    });

  projects.sort((a, b) => b.totalTime.compareTo(a.totalTime));

  return projects;
}

export function printProjects(projects: Project[]): string {
  return projects
    .map((project) => {
      return `${project.name},${project.totalTime.seconds()}`;
    })
    .join('\n');
}
