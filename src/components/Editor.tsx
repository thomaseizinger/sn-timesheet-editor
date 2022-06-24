import React, { useRef, useState } from 'react';
import EditorKit, { EditorKitDelegate } from '@standardnotes/editor-kit';

export function useNote(): [string, (newText: string) => void] {
  let [note, setNote] = useState('');
  const delegate: EditorKitDelegate = {
    /** This loads every time a different note is loaded */
    setEditorRawText: (text: string) => {
      setNote(text);
    },
    insertRawText: (text: string) => {
      setNote(text);
    },
    clearUndoHistory: () => {},
    getElementsBySelector: () => [],
  };

  let editorKitReference = useRef(
    new EditorKit(delegate, {
      mode: 'plaintext',
      supportsFileSafe: false,
    })
  );

  const updateNote = (newText: string) => {
    console.log('Saving note ...');
    editorKitReference.current.onEditorValueChanged(newText);
    setNote(newText);
  };

  return [note, updateNote];
}

export enum HtmlElementId {
  snComponent = 'sn-component',
  textarea = 'textarea',
}

export default function Editor() {
  const [note, setNote] = useNote();
  const keyMapReference = useRef(new Map());

  function onKeyDown(e: React.KeyboardEvent | KeyboardEvent) {
    keyMapReference.current.set(e.key, true);
    // Do nothing if 'Control' and 's' are pressed
    if (
      keyMapReference.current.get('Control') &&
      keyMapReference.current.get('s')
    ) {
      e.preventDefault();
    }
  }

  function onKeyUp(e: React.KeyboardEvent | KeyboardEvent) {
    keyMapReference.current.delete(e.key);
  }

  return (
    <div
      className={HtmlElementId.snComponent}
      id={HtmlElementId.snComponent}
      tabIndex={0}
    >
      <p>
        Edit <code>src/components/Editor.tsx</code> and save to reload.
      </p>
      <p>
        Visit the{' '}
        <a
          href="https://docs.standardnotes.org/extensions/intro"
          target="_blank"
          rel="noopener noreferrer"
        >
          Standard Notes documentation
        </a>{' '}
        to learn how to work with the Standard Notes API or{' '}
        <a href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
        .
      </p>
      <textarea
        id={HtmlElementId.textarea}
        name="text"
        className={'sk-input contrast textarea'}
        placeholder="Type here. Text in this textarea is automatically saved in Standard Notes"
        rows={15}
        spellCheck="true"
        value={note}
        onChange={(event) => setNote(event.target.value)}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
      />
    </div>
  );
}
