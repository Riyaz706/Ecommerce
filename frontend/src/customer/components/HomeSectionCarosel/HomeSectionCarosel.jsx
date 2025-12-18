import React from 'react'
import AliceCarousel from 'react-alice-carousel';
import HomeSectionCard from '../HomeSectionCard/HomeSectionCard';
import { Button } from '@mui/material';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import { grey } from '@mui/material/colors';

const HomeSectionCarosel = () => {

    const responsive = {
        0: { items: 1 },
        720: { items: 3 },
        1024: { items: 5.5 },
    }

    const items = [1, 1, 1, 1, 1].map((item) => <HomeSectionCard />)

    return (
        <div className='relative px-4 lg:px-8'>
            <div className='relative px-5'>
                <AliceCarousel
                    items={items}
                    disableButtonsControls
                    infinite
                    disableDotsControls
                    responsive={responsive}
                />

                <Button varient='contained' className="z-50" sx={{position: 'absolute', top: '9rem', left: '-0.5rem', transform: 'translateX(-50%)', bgcolor: "white", border: "0.5px solid grey"}} aria-label='next'> 
                    <KeyboardArrowLeftIcon sx={{color: "black"}}/>
                </Button>

                <Button varient='contained' className="z-50" sx={{position: 'absolute', top: '9rem', right: '0rem', transform: 'translateX(50%)', bgcolor: "white", border: "0.5px solid grey"}} aria-label='next'> 
                    <KeyboardArrowRightIcon sx={{color: "black"}}/>
                </Button>
            </div>
        </div>
    )
}

export default HomeSectionCarosel;