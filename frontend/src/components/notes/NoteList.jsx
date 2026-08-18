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
    <div className="flex flex-wrap justify-center gap-6 w-full px-0">
      {notes.map((note) => (
        <Link 
          key={note.id} 
          to={`/notes/${note.slug}`} 
          className="block w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-0.8rem)] xl:w-[calc(25%-0.9rem)] max-w-sm"
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