import { useNote } from '../useNote';
import Editor from './Editor';

export default function App() {
  const [note, isMobile, saveNote, setPreview] = useNote();

  return (
    <Editor
      note={note}
      isMobile={isMobile}
      saveNote={saveNote}
      setPreview={setPreview}
    />
  );
}
