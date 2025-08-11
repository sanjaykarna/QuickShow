import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dummyDateTimeData, dummyShowsData } from '../assets/assets'
import BlurCircle from '../components/BlurCircle'
import { Heart, PlayCircleIcon, StarIcon } from 'lucide-react'
import timeFormat from '../lib/formatDuration'
import DateSelect from '../components/DateSelect'
import MovieCard from '../components/MovieCard'
import Loading from '../components/Loading'
import { useAppContext } from '../context/AppContext'
import toast from 'react-hot-toast'


const MovieDetails = () => {
  const navigate = useNavigate()
  const {id} = useParams()
  const [show, setShow] = useState(null)

  const {shows, axios, getToken, user, fetchFavouriteMovies, favouriteMovies, image_base_url} = useAppContext()

  const getShow = async()=>{
    try{
      const {data} = await axios.get(`/api/show/${id}`)
      if (data.success) {
      setShow({
      movie: data.movie,
      dateTime: data.dateTime
  });
}
    }catch(error){
      console.log(error)
    }
}

const handleFavourite = async () => {
  try {
    console.log("Favourite button clicked");
    if (!user) return toast.error("Please login to proceed");

    const { data } = await axios.post(
      '/api/user/update-favourite',
      { movieId: id },
      { headers: { Authorization: `Bearer ${await getToken()}` } }
    );

    await fetchFavouriteMovies(); 
    toast.success(data.message); 
  } catch (error) {
    console.log(error);
    toast.error("Something went wrong");
  }
};


  useEffect(()=>{
    getShow()
  },[id])

  useEffect(()=>{
    if(show){
      console.log("cast data", show.movie.casts);
    }
  },[show])

  return show ?(
    <div className='px-6 md:px-16 lg:px-40 pt-28 md:pt-32'>
      <div className='flex flex-col md:flex-row gap-8 max-w-6xl mx-auto'>

        {/* Fixed poster image sizing */}
        <img 
          src={image_base_url + show.movie.poster_path} 
          alt={show.movie.title} 
          className='max-md:mx-auto rounded-xl w-72 md:w-80 h-96 md:h-[450px] object-cover flex-shrink-0' 
        />

        <div className='relative flex flex-col gap-4 flex-1 min-w-0'>
          <BlurCircle top='100px' left='-100px' />
          <p className='text-primary text-sm font-medium'>ENGLISH</p>

          {/* Better title styling */}
          <h1 className='text-3xl md:text-4xl font-bold leading-tight text-white'>{show.movie.title}</h1>
          
          {/* Rating with better spacing */}
          <div className='flex items-center gap-2 text-gray-300'>
            <StarIcon className='w-5 h-5 text-yellow-400 fill-yellow-400'/>
            <span className='font-medium'>{show.movie.vote_average.toFixed(1)}</span>
            <span className='text-sm'>User Rating</span>
          </div> 

          {/* Better overview styling */}
          <p className='text-gray-300 text-sm md:text-base leading-relaxed'>{show.movie.overview}</p>
          
          {/* Movie details with better formatting */}
          <div className='flex flex-wrap items-center gap-2 text-sm text-gray-400'>
            <span>{timeFormat(show.movie.runtime)}</span>
            <span>•</span>
            <span>{show.movie.genres.map(genre=>genre.name).join(", ")}</span>
            <span>•</span>
            <span>{show.movie.release_date.split("-")[0]}</span>
          </div>

          {/* Better button layout */}
          <div className='flex items-center flex-wrap gap-3 mt-6'>
            <button className='flex items-center gap-2 px-6 py-3 text-sm bg-gray-800 hover:bg-gray-700 transition rounded-lg font-medium cursor-pointer active:scale-95'>
              <PlayCircleIcon className='w-5 h-5'/>
              Watch Trailer
            </button>
            <a href="#dateSelect" className='px-8 py-3 text-sm bg-red-400 hover:bg-red-900 transition rounded-lg font-medium cursor-pointer active:scale-95 text-white'>
              Buy Tickets
            </a>
            <button onClick={handleFavourite} className='bg-gray-700 hover:bg-gray-600 p-3 rounded-full transition cursor-pointer active:scale-95'>
              <Heart className={`w-5 h-5 ${favouriteMovies.find(movie => movie._id === id)? 'fill-red-400 text-red-400': 'text-gray-300'}`}/>
            </button>
          </div>     
        </div>
      </div>

      {/* Cast section */}
      <div className='mt-16'>
        <p className='text-xl font-semibold mb-6'>Cast</p>
        <div className='overflow-x-auto no-scrollbar pb-4'>
          <div className='flex items-center gap-6 w-max'>
            {show.movie.casts.slice(0,12).map((cast,index)=>(
              <div key={index} className='flex flex-col items-center text-center min-w-[80px]'>
                <img 
                  src={image_base_url + cast.profile_path} 
                  alt={cast.name} 
                  className='rounded-full w-16 h-16 md:w-20 md:h-20 object-cover'
                />
                <p className='font-medium text-xs mt-2 text-center max-w-[80px] leading-tight'>{cast.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Date selection */}
      <div id="dateSelect" className="scroll-mt-28">
      <DateSelect dateTime={show.dateTime} id={id}/>
      </div>
    
      {/* Related movies */}
      <div className='mt-16'>
        <p className='text-xl font-semibold mb-6'>You may also like</p>
        <div className='flex flex-wrap max-sm:justify-center gap-6'>
          {shows.slice(0,4).map((movie,index)=>(
            <MovieCard key={index} movie={movie}/>
          ))}
        </div> 
        <div className='flex justify-center mt-12'>
          <button 
            onClick={()=>{navigate('/movies');scrollTo(0,0)}} 
            className='px-8 py-3 text-sm bg-red-400 hover:bg-red-900 transition rounded-lg font-medium cursor-pointer text-white'
          >
            Show more
          </button>
        </div>
      </div>
    </div>
  ):<Loading />
}

export default MovieDetails