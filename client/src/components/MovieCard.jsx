import { StarIcon } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import formatDuration from '../lib/formatDuration'
import { useAppContext } from '../context/AppContext'

const MovieCard = ({movie}) => {
    const navigate = useNavigate()
    const {image_base_url} = useAppContext()

  return (
    <div className='flex flex-col justify-between p-3 bg-gray-800 rounded-2xl transition duration-300 w-full h-full'>
      <img 
        onClick={() => { navigate(`/movies/${movie._id}`); scrollTo(0, 0) }} 
        src={image_base_url + movie.backdrop_path} 
        alt={movie.title} 
        className='rounded-lg w-full aspect-[16/10] object-cover object-center cursor-pointer'
      />

      <div className='mt-3 flex-grow'>
        <p className='font-semibold text-white truncate'>{movie.title}</p>
        <p className='text-sm text-gray-400 mt-1'>
          {new Date(movie.release_date).getFullYear()}. 
          {movie.genres.slice(0, 2).map(genre => genre.name).join(" | ")}. 
          {formatDuration(movie.runtime)}
        </p>
      </div>

      <div className='flex items-center justify-between mt-4 pb-3'>
        <button 
          onClick={() => { navigate(`/movies/${movie._id}`); scrollTo(0, 0) }} 
          className='px-6 py-2 text-sm bg-red-400 hover:bg-red-300 transition rounded-md font-medium cursor-pointer'
        >
          Buy Ticket
        </button>
        <p className='flex items-center gap-1 text-sm text-gray-400'>
          <StarIcon className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          {movie.vote_average.toFixed(1)}
        </p>
      </div>
    </div>
  )
}

export default MovieCard