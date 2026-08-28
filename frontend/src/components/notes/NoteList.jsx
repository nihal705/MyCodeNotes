import { Link } from 'react-router-dom'
import NoteCard from './NoteCard'

const NoteList = ({ notes, onSearch, searchQuery }) => {
  if (!notes || notes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 dark:text-gray-400">No notes found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
      {notes.map((note) => (
        <Link 
          key={note.id} 
          to={`/notes/${note.slug}`} 
          className="block w-full"
        >
          <NoteCard 
            note={note} 
            onSearch={onSearch}
            searchQuery={searchQuery}
          />
        </Link>
      ))}
    </div>
  )
}

export default NoteList