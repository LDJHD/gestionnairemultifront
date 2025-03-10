'use user'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import Modifiepassword from '../form/modifiepassword'

export  function Modaleditpassword({handletoast,userId}) {
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
    className="w-4 text-blue-600 rounded-full flex items-center justify-center"
>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 10V7a4 4 0 1 0-8 0v3M5 10h14a1 1 0 0 1 1 1v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a1 1 0 0 1 1-1Zm7 4v4m-2-2h4" />
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
                <Modifiepassword userId={userId} handletoast={handletoast} handleformclick={handleformclick} />
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

export default Modaleditpassword;
