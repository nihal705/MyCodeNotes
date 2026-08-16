import { Link } from 'react-router-dom'
import NoteCard from './NoteCard'

const NoteList = ({ notes }) => {
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No notes found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map((note) => (
        <Link key={note.id} to={`/notes/${note.slug}`}>
          <NoteCard note={note} />
        </Link>
      ))}
    </div>
  )
}

export default NoteList