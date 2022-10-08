import { useNote } from '../useNote';
import Editor from './Editor';

export default function App() {
  const [note, saveNote, setPreview] = useNote();

  return <Editor note={note} saveNote={saveNote} setPreview={setPreview} />;
}
