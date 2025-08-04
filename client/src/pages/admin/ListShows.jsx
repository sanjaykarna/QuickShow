import React, { useEffect, useState } from 'react'
import Loading from '../../components/Loading';
import Title from '../../components/admin/Title';
import { dateFormat } from '../../lib/dateFormat';
import { useAppContext } from '../../context/AppContext';

const ListShows = () => {
   
  const currency = import.meta.env.VITE_CURRENCY
  const {axios, getToken, user} = useAppContext()
  const [shows, setShows] = useState([]); 
  const[loading, setLoading] = useState(true);
  
  const getAllShows = async()=>{
    try{
      const {data} = await axios.get("/api/admin/all-shows",{
        headers:{Authorization:`Bearer ${await getToken()}`}
      });
      console.log("API Response:", data);
      setShows(data.shows || []);
      setLoading(false)
    }catch(error){
   console.error(error);
   setLoading(false) 
    }
  } 
  
  useEffect(()=>{
    if(user){
      console.log("calling getAllShows...");
       getAllShows();
    }else{
      console.log("User not avaliable yet");
    }
  },[user]);

  return !loading ?(
    <>
    <Title text1="List" text2="Shows"/>
    <div className='max-w-4xl mt-6 overflow-x-auto'>
      <table className='w-full border-collapse rounded-md overflow-hidden text-nowrap'> 
        <thead>
          <tr className='bg-red-400/20 text-left text-white'>
          <th className='py-3 px-6 font-medium pl-5'>Movie Name</th>
          <th className='py-3 px-6 font-medium'>Show Time</th>
          <th className='py-3 px-6 font-medium'>Total Bookings</th>
          <th className='py-3 px-6 font-medium'>Earnings</th>
          </tr>
        </thead>
        <tbody className='text-sm font-light'>
          {shows.map((show, index)=>(
            <tr key={index} className='border-b border-red-400/10 bg-red-400/5 even:bg-red-400/10'>
              <td className='py-3 px-6 min-w-45 pl-5'>{show.movie.title}</td> 
              <td className='py-3 px-6'>{dateFormat(show.showDateTime)}</td>
              <td className='py-3 px-6'>{Object.keys(show.occupiedSeats).length}</td>
              <td className='py-3 px-6'>{currency}{Object.keys(show.occupiedSeats).length*show.showPrice}</td>
              </tr>
          ))}
        </tbody>
      </table>
    </div>
    </>
  ):<Loading />
}

export default ListShows