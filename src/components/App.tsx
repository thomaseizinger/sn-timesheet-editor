import { useNote } from '../useNote';
import Editor from './Editor';

export default function App() {
  const [note, saveNote] = useNote();

  return <Editor note={note} saveNote={saveNote} />;
}
