import { ArrowRight } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import BlurCircle from './BlurCircle'
import MovieCard from './MovieCard'
import { useAppContext } from '../context/AppContext'

const FeaturedSection = () => {
    const navigate = useNavigate()
    const { shows } = useAppContext()

    const handleShowMore = () => {
        navigate('/movies')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleViewAll = () => {
        navigate('/movies')
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className='px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden'>
            {/* Header Section */}
            <div className='relative flex items-center justify-between pt-20 pb-10'>
                <BlurCircle top='0' right='-80px'/>
                
                {/* Enhanced Now Showing */}
                <div className='flex items-center gap-3'>
                    <div className='w-1 h-8 bg-red-400 rounded-full'></div>
                    <div>
                        <p className='text-white font-semibold text-xl tracking-wide'>Now Showing</p>
                        <div className='w-16 h-0.5 bg-gradient-to-r from-red-400 to-transparent mt-1'></div>
                    </div>
                </div>
                
                {/* Enhanced View All Button */}
                <button 
                    onClick={handleViewAll}
                    className='group flex items-center gap-2 text-sm text-gray-400 hover:text-red-400
                              transition-all duration-300 cursor-pointer px-4 py-2 rounded-lg
                             border border-gray-700 hover:border-red-500/50 hover:bg-red-500/10'
                >
                    View All 
                    <ArrowRight className='group-hover:translate-x-1 transition-transform duration-300 w-4 h-4'/>
                </button>
            </div>
            
            {/* Movie Grid - MORE AGGRESSIVE FIX */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-16 mt-8 p-8'>
                {shows.slice(0, 4).map((show) => (
                    <div 
                        key={show._id}
                        className='relative group cursor-pointer min-h-[400px] flex flex-col'
                    >
                        {/* Constrained container */}
                        <div className='relative h-full overflow-hidden rounded-lg'>
                            {/* Card with NO scaling for now */}
                            <div className='h-full w-full relative z-10 group-hover:z-20 
                                          transition-all duration-300 group-hover:brightness-110 
                                          group-hover:-translate-y-1'>
                                <MovieCard movie={show} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Show More Button */}
            <div className='flex justify-center mt-20'>
                <button 
                    onClick={handleShowMore}
                    className='px-12 py-3 text-sm bg-red-400 hover:bg-red-900 active:bg-red-700
                             transition-all duration-200 rounded-md font-medium cursor-pointer text-white
                             transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-red-500/30'
                >
                    Show More
                </button>
            </div>

            {/* Loading state */}
            {shows.length === 0 && (
                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-12 mt-8'>
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className='animate-pulse'>
                            <div className='bg-gray-700/50 rounded-lg h-96 mb-4'></div>
                            <div className='bg-gray-700/50 rounded h-4 mb-2'></div>
                            <div className='bg-gray-700/50 rounded h-3 w-3/4'></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default FeaturedSection