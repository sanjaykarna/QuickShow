import React, { useEffect, useState } from 'react'
import Loading from '../components/Loading'
import BlurCircle from '../components/BlurCircle'
import timeFormat from '../lib/formatDuration'
import { dateFormat } from '../lib/dateFormat'
import { useAppContext } from '../context/AppContext'
import { Link } from 'react-router-dom'

const MyBookings = () => {
  const currency = import.meta.env.VITE_CURRENCY
  const { axios, getToken, user, image_base_url } = useAppContext()

  const [bookings, setBookings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const getMyBookings = async () => {
    try {
      const { data } = await axios.get('/api/user/bookings', {
        headers: { Authorization: `Bearer ${await getToken()}` }
      })
      if (data.success) {
        setBookings(data.bookings)
      }
    } catch (error) {
      console.log(error)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    if (user) {
      getMyBookings()
    }
  }, [user])

  return !isLoading ? (
    <div className="relative px-6 md:px-16 lg:px-40 pt-28 md:pt-32 min-h-[80vh]">
      {/* Decorative background blur */}
      <BlurCircle top="100px" left="100px" />
      <BlurCircle bottom="0px" left="600px" />

      <h1 className="text-2xl font-semibold mb-6">My Bookings</h1>

      {bookings.length > 0 ? (
        <div className="space-y-6">
          {bookings.map((item, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow max-w-4xl"
            >
              {/* Poster */}
              <img
                src={image_base_url + item.show.movie.poster_path}
                alt={item.show.movie.title}
                className="md:w-56 w-full object-cover aspect-video"
              />

              {/* Details */}
              <div className="flex flex-col justify-between pl-6 pr-4 py-4 flex-1">
                {/* Movie info */}
                <div>
                  <p className="text-lg font-semibold">{item.show.movie.title}</p>
                  <p className="text-gray-400 text-sm">
                    {timeFormat(item.show.movie.runtime)}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {dateFormat(item.show.showDateTime)}
                  </p>
                </div>

                {/* Price & seats */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold text-green-400">
                      {currency}
                      {item.amount}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-400">Total Tickets:</span>{' '}
                      {item.bookedSeats.length}
                    </p>
                    <p className="text-sm">
                      <span className="text-gray-400">Seat Number:</span>{' '}
                      {item.bookedSeats.join(', ')}
                    </p>
                  </div>

                  {!item.isPaid && (
                    <Link
                      to={item.paymentLink}
                      className="bg-red-400 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-red-900 transition"
                    >
                      Pay Now
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No bookings found.</p>
      )}
    </div>
  ) : (
    <Loading />
  )
}

export default MyBookings
