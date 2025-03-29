import Image from 'next/image'
import Link from 'next/link'


function NavLink({ text, redirect }) {

    return (
        <Link href={redirect} className='hover:cursor-pointer hover:text-blue'>{text}</Link>
    )

}


function AdminNavbar () {

    return (
        <div className='px-[20px] 
                        sm:px-[50px] 
                        lg:px-[144px] 
                        h-[80px] w-full
                        bg-dark
                        border-b border-white/[0.3]'>

            {/* Outer Div */}
            <div className='flex flex-row justify-between items-center h-full'>
                <Image
                    src='/images/logo.png'
                    alt='logo'
                    height={30}
                    width={150}
                />

                {/* Links */}
                <div className='h-fit 
                                flex flex-row gap-[50px] 
                                items-center justify-center
                                text-white font-roboto text-[17px]'>

                    <NavLink text='BACK TO HOMEPAGE' redirect='/' />           
                    <NavLink text='ARTICLES' redirect='/admin/articles' />
                    <NavLink text='AUTHORS' redirect='/admin/authors' />
                    <NavLink text='TAGS AND CATEGORIES' redirect='/admin/tags_categories' />

                </div>
            </div>
            
        </div>
    )
}


export default AdminNavbar