import { useEffect, useRef, useState } from 'react';
import EditorKitBase from '@standardnotes/editor-kit';

export function useNote(): [
  string,
  (newText: string) => void,
  (newPreview: string) => void
] {
  let [note, setNote] = useState('');
  let [editorKit, setEditorKit] = useState<EditorKitBase | null>(null);
  let preview = useRef<string>();

  useEffect(() => {
    let editorKit = new EditorKitBase(
      {
        setEditorRawText: (text: string) => setNote(text),
        insertRawText: (text: string) => setNote(text),
        generateCustomPreview: () => ({ plain: preview.current ?? '' }),
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
    (newPreview) => {
      preview.current = newPreview;
    },
  ];
}
