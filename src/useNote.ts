import { useEffect, useState } from 'react';
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
