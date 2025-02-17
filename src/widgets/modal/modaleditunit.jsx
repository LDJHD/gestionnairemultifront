'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import Modifieunit  from '../form/modifieunit'

export  function ModaleditUnit({handletoast,unitId}) {
  const [open, setOpen] = useState(false);

  

   const handleformclick =()=>{
    setOpen(false);
    window.location.reload(); // Actualise la page
   }

  return (
            <div >
   
   <button
   onClick={() => setOpen(true)}
        type="button"
        class="w-4 text-blue-600 rounded-full flex items-center justify-center">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="">
        <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>

</button>
 
    <Dialog open={open} onClose={()=>{}} className="relative  z-100">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className=" px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <Modifieunit unitId={unitId} handletoast={handletoast} handleformclick={handleformclick} />
              </div>
            </div>
            <div className="bg-gray-50 px-4  sm:flex sm:flex-row-reverse sm:px-6">
           
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
    </div>
  )
}

export default ModaleditUnit;
