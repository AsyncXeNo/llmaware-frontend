'use client'

import { useState } from 'react'


function NavbarToggleMenu() {
    const [open, setOpen] = useState(false)
    const toggleMenu = () => setOpen(!open)

    return (
        <div className='flex lg:hidden'>

        </div>
    )
}


export default NavbarToggleMenu