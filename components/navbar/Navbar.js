import Image from 'next/image'
import Link from 'next/link'
import { IoMdArrowDropdown } from 'react-icons/io'

import NavbarToggleMenu from './NavbarToggleMenu'


function NavLink({ text, redirect }) {

    return (
        <Link href={redirect} className='hover:cursor-pointer hover:text-blue'>{text}</Link>
    )

}


function NavDropdown({ text, redirect }) {

    return (
        <div className='flex flex-row gap-[10px] items-center justify-center hover:cursor-pointer'>
            <span className=''>{text}</span>
            <IoMdArrowDropdown />
        </div>
    )
    
}


function Navbar () {

    return (
        <div className='px-[20px] 
                        sm:px-[50px] 
                        lg:px-[144px] 
                        h-[80px]
                        bg-dark
                        border-b border-white/[0.3]'>

            {/* Outer Div */}
            <div className='flex flex-row justify-between items-center h-full'>
                <Image
                    src='/images/logo.png'
                    alt='logo'
                    height={30}
                    width={200}
                />

                {/* Links */}
                <div className='hidden lg:flex 
                                h-fit 
                                flex-row gap-[50px] 
                                items-center justify-center
                                text-white font-roboto text-[17px]'>
                                    
                    <NavLink text='HOME' redirect='/' />
                    <NavLink text='ARTICLES' redirect='/articles' />
                    <NavDropdown text='CATEGORIES' />
                    <NavLink text='ABOUT US' redirect='/about' />
                    <NavLink text='CONTACT US' redirect='/contact' />

                </div>

                {/* Navbar Toggle Menu */}
                <NavbarToggleMenu />
            </div>
            
        </div>
    )
}


export default Navbar