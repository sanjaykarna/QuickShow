import { ArrowRight } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from './BlurCircle'
import MovieCard from './MovieCard'
import { useAppContext } from '../context/AppContext'

const FeaturedSection = () => {
    const navigate = useNavigate()
    const {shows} = useAppContext()
  return (
    <div className='px-6 md:px-16 lg:px-24 x1:px-44 overflow-hidden'>
        <div className='relative flex items-center justify-between pt-20 pb-10'>
            <BlurCircle top = '0' right='-80px'/>
            <p className='text-gray-300 font-medium text-lg'>Now Showing</p>
            <button onClick={()=>navigate('/movies')} className='group flex items-center gap-2 text-sm text-gray-300 cursor-pointer'>View All 
                <ArrowRight className='group-hover:translate-x-0.5 transition w-4.5 h-4.5'/></button>
        </div>
          
       <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 mt-8'>
       {shows.slice(0, 4).map((show) => (
       <MovieCard key={show._id} movie={show} />
       ))}
      </div>

        <div className='flex justify-center mt-20'>
          <button onClick={()=>{navigate('/movies');scrollTo(0,0)}}
          className='px-10 py-3 text-sm bg-red-500 hover:bg-red-900 transition 
                   rounded-md font-medium cursor-pointer text-white'>Show more</button>
        </div>
    </div>
  )
}

export default FeaturedSection