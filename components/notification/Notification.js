
function Notification({ notificationText }) {

    return (
        <div className='fixed bottom-[50px] left-1/2 transform -translate-x-1/2 z-50'>
            <div
                className='bg-dark text-orange border border-orange px-[15px] py-[7px] rounded-full animate-fade-up text-[15px] font-poppins font-medium'
                style={{
                    animation: 'fadeUp 0.3s ease-out, fadeOut 0.3s ease-in 4.7s forwards'
                }}
            >
                {notificationText}
            </div>
        </div>
    )
    
}


export default Notification