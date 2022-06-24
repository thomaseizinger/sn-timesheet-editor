import React, { useEffect, useRef, useState } from 'react';
import EditorKit from '@standardnotes/editor-kit';

export function useNote(): [string, (newText: string) => void] {
  let [note, setNote] = useState('');
  let editorKitReference = useRef<EditorKit>();

  useEffect(() => {
    editorKitReference.current = new EditorKit(
      {
        setEditorRawText: (text: string) => setNote(text),
      },
      {
        mode: 'plaintext',
      }
    );
  }, []);

  return [
    note,
    (newText: string) => {
      editorKitReference.current?.onEditorValueChanged(newText);
      setNote(newText);
    },
  ];
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
