import React from 'react'
import annAi from "../../src/assets/AnnAI.png";


export default function Header() {
  return (
    <section className='p-7'>
      <div className='flex gap-4 items-end'><img src={annAi} alt='logo' width={`100px`} />
      <span className='text-[#757575] text-[15px] '>
              Recruitment Augmentor
            </span>
      </div>
  </section>
  )
}
