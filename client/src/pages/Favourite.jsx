import React from 'react'
import MovieCard from '../components/MovieCard'
import BlurCircle from '../components/BlurCircle'
import { useAppContext } from '../context/AppContext'

const Favourite = () => {
  const {favouriteMovies} = useAppContext()
  return favouriteMovies.length > 0 ? (
   <div className='pt-25 px-6 md:px-16 lg:px-24 x1:px-44 overflow-hidden'>
      <BlurCircle top="150px" left="0px" />
      <BlurCircle bottom="130px" right="0px" />
      <h1 className='text-lg font-medium my-4'>Your Favourite movies</h1>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8'>
        {favouriteMovies.map((movie)=>(
         <MovieCard movie={movie} key={movie._id}/>
        ))}
      </div>
    </div>
  ):(
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xl font-bold text-center'>No Movies Available</h1>
    </div>
  )
}

export default Favourite