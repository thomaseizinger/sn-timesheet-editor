import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import Editor from './Editor';

test('UI renders table headers', () => {
  render(<LocalStateEditor />);

  expect(
    screen.getByRole('columnheader', { name: 'Project' })
  ).toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: 'Start' })
  ).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'End' })).toBeInTheDocument();
  expect(
    screen.getByRole('columnheader', { name: 'Duration' })
  ).toBeInTheDocument();
});

test('UI renders start but not stop button', () => {
  render(<LocalStateEditor />);

  let startButton = screen.getByRole('button', { name: 'Start' });

  expect(startButton).toBeInTheDocument();
});

test('UI renders stop button after clicking', () => {
  render(<LocalStateEditor />);

  let startButton = screen.getByRole('button', { name: 'Start' });
  let projectInput = screen.getByRole('textbox'); // TODO: Add name here

  fireEvent.change(projectInput, {
    target: { value: 'Test' },
  });
  fireEvent.click(startButton);

  let stopButton = screen.getByRole('button', { name: 'Stop' });

  expect(stopButton).toBeInTheDocument();
});

function LocalStateEditor() {
  let [note, saveNote] = useState('');

  return <Editor note={note} saveNote={saveNote} />;
}
