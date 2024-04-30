import Image from 'next/image'
import Link from 'next/link'

const Navbar = () => {
  return (
    <header className="w-full">
      <nav className="navigation_bar">
        <Link href="/" className="flex items-center gap-1">
          <Image 
            src="/assets/icons/money-icon.svg"
            width={27}
            height={27}
            alt="logo"
          />

          <p className="navigation_bar-logo">
            Price<span className='text-blue-600'>Watcher</span>
          </p>
        </Link>
      </nav>
    </header>
  )
}

export default Navbar