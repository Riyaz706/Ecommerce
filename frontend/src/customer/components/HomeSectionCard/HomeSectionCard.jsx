import React from 'react'

const HomeSectionCard = () => {
  return (
    <div className='cursor-pointer flex flex-col items-center bg-white rounded-lg shadow-lg overflow-hidden w-[15rem] mx-3'>
        <div className='h-[13rem] w-[10rem]'>
            <img className='object-cover object-top w-full h-full' src="https://www.ethnicplus.in/cdn/shop/files/wedding_gown_copy_1948f786-0e03-403f-9c9f-42dc53f70922_1920x.jpg?v=1764177416" alt="wedding gown" />
        </div>

        <div className='p-4'>
            <h3 className='text-lg font-medium text-gray-900'>Nofitler</h3>
            <p className='mt-2 text-sm text-gray-500'>Men Solid Pure Cotton Straight Kurtha</p>
        </div>
    </div>
  )
}

export default HomeSectionCard;