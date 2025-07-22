import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import BlurCircle from './BlurCircle';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const DateSelect = ({ dateTime, id }) => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const onBookHandler = ()=>{
    if(!selectedDate){
        return toast('Please Select a date')
    }
    navigate(`/movies/${id}/${selectedDate}`)
    scrollTo(0,0)
  }
  return (
    <div id="dateSelect" className="pt-30">
      <div
        className="flex flex-col md:flex-row items-center justify-between gap-10 relative p-8 border border-red-400/20 rounded-lg"
        style={{
          backgroundImage: 'linear-gradient(to top right, #2c0000, #000000)',
        }}
      >
        <BlurCircle top="-100px" left="-100px" />
        <BlurCircle bottom="100px" right="0px" />

        {/* Left section: Dates */}
        <div>
          <p className="text-lg font-semibold mb-4">Choose Date</p>
          <div className="flex items-center gap-6 text-sm mt-1">
            <ChevronLeftIcon width={28} className="cursor-pointer" />

            <span className="grid grid-cols-3 md:flex flex-wrap md:max-w-lg gap-4">
              {Object.keys(dateTime).map((date) => {
                const dateObj = new Date(date);
                const isSelected = selectedDate === date;

                return (
                  <button
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={`flex flex-col items-center justify-center h-14 w-14 rounded-md cursor-pointer transition ${
                      isSelected
                        ? 'bg-red-400 text-white'
                        : 'hover:bg-white/10 text-white/80'
                    }`}
                  >
                    <span className="text-base">{dateObj.getDate()}</span>
                    <span className="text-sm">
                      {dateObj.toLocaleDateString('en-US', {
                        month: 'short',
                      })}
                    </span>
                  </button>
                );
              })}
            </span>

            <ChevronRightIcon width={28} className="cursor-pointer" />
          </div>
        </div>

        {/* Right: Book Button */}
        <button onClick={onBookHandler} className="bg-red-400 text-white px-8 py-2 mt-6 md:mt-0 rounded hover:bg-[#F84565]/90 transition-all cursor-pointer">
          Book Now
        </button>
      </div>
    </div>
  );
};

export default DateSelect;
