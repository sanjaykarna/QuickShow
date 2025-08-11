import React, { useState } from 'react'
import {Link, useNavigate} from 'react-router-dom'
import { assets } from '../assets/assets'
import {MenuIcon, SearchIcon, TicketPlus, XIcon} from 'lucide-react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { useAppContext } from '../context/AppContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const {user} = useUser()
  const {openSignIn} = useClerk()
  const navigate = useNavigate()
  const {favouriteMovies} = useAppContext()

  const handleNavClick = () => {
    scrollTo(0,0)
    setIsOpen(false)
  }

  return (
    <nav className='fixed top-0 left-0 z-50 w-full backdrop-blur-md bg-black/80 border-b border-gray-800/50'>
      <div className='flex items-center justify-between px-6 md:px-16 lg:px-36 py-4'>
        
        {/* Logo */}
        <Link to='/' className='flex-shrink-0'>
          <img src={assets.logo} alt="QuickShow" className='w-32 md:w-36 h-auto'/>
        </Link>
        
        {/* Desktop & Mobile Navigation */}
        <div className={`
          max-md:fixed max-md:inset-0 max-md:bg-black/95 max-md:backdrop-blur-lg
          flex flex-col md:flex-row items-center justify-center
          gap-6 md:gap-8 text-white font-medium
          transition-all duration-300 ease-in-out z-40
          ${isOpen ? 'max-md:opacity-100 max-md:visible' : 'max-md:opacity-0 max-md:invisible'}
          md:bg-white/10 md:backdrop-blur-sm md:border md:border-white/20 
          md:rounded-full md:px-8 md:py-3
        `}>
          
          {/* Mobile Close Button */}
          <button 
            className='md:hidden absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors' 
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <XIcon className='w-6 h-6'/>
          </button>
          
          {/* Navigation Links */}
          <Link 
            onClick={handleNavClick} 
            to='/' 
            className='hover:text-red-400 transition-colors duration-200 text-lg md:text-base py-2 md:py-0'
          >
            Home
          </Link>
          <Link 
            onClick={handleNavClick} 
            to='/movies' 
            className='hover:text-red-400 transition-colors duration-200 text-lg md:text-base py-2 md:py-0'
          >
            Movies
          </Link>
          <Link 
            onClick={handleNavClick} 
            to='/' 
            className='hover:text-red-400 transition-colors duration-200 text-lg md:text-base py-2 md:py-0'
          >
            Theaters
          </Link>
          <Link 
            onClick={handleNavClick} 
            to='/' 
            className='hover:text-red-400 transition-colors duration-200 text-lg md:text-base py-2 md:py-0'
          >
            Releases
          </Link>
          {favouriteMovies.length > 0 && (
            <Link 
              onClick={handleNavClick} 
              to='/favourite' 
              className='hover:text-red-400 transition-colors duration-200 text-lg md:text-base py-2 md:py-0 relative'
            >
              Favourites
              {favouriteMovies.length > 0 && (
                <span className='absolute -top-1 -right-2 bg-red-400 text-xs text-white rounded-full w-5 h-5 flex items-center justify-center'>
                  {favouriteMovies.length}
                </span>
              )}
            </Link>
          )}
        </div>
        
        {/* Right Side Actions */}
        <div className='flex items-center gap-4 md:gap-6'>
          
          {/* Search Icon - Desktop Only */}
          <button 
            className='max-md:hidden p-2 hover:bg-white/10 rounded-full transition-colors duration-200' 
            aria-label="Search"
          >
            <SearchIcon className='w-5 h-5 text-white hover:text-red-400 transition-colors'/>
          </button>
          
          {/* Auth Section */}
          {!user ? (
            <button 
              onClick={openSignIn}
              className='px-4 py-2 md:px-6 md:py-2.5 bg-red-400 hover:bg-red-500 text-white 
                       transition-all duration-200 rounded-full font-medium text-sm md:text-base
                       active:scale-95 shadow-lg hover:shadow-red-400/25'
            >
              Login
            </button>
          ) : (
            <div className='relative'>
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-9 h-9 md:w-10 md:h-10 ring-2 ring-red-400/50 hover:ring-red-400 transition-all"
                  }
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Action 
                    label="My Bookings" 
                    labelIcon={<TicketPlus width={15}/>} 
                    onClick={() => navigate('/my-bookings')}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          )}
          
          {/* Mobile Menu Button */}
          <button 
            className='md:hidden p-2 hover:bg-white/10 rounded-full transition-colors duration-200' 
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <MenuIcon className='w-6 h-6 text-white'/>
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar