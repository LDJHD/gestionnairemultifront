'use client'

import { useState } from 'react'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import AjoutProduit from '../form/ajoutproduit'

export  function Modal({handletoast}) {
  const [open, setOpen] = useState(false)

   const handleformclick =()=>{
    setOpen(false);
    window.location.reload(); // Actualise la page
   }

  return (
            <div >
                 <button
    type="button"
    onClick={() => setOpen(true)}
    className="text-white-500 p-1 bg-white rounded-full font-bold text-black text-xl w-6 h-6 flex items-center justify-center"
  >
    +
  </button>
    {/* <Dialog open={open} onClose={()=>{}} className="relative w-full z-50">
      <DialogBackdrop
        transition
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel
            transition
            className="relative w-full transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
          >
            <div className=" px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <AjoutProduit handletoast={handletoast} handleformclick={handleformclick} />
              </div>
            </div>
            <div className="bg-gray-50 px-4  sm:flex sm:flex-row-reverse sm:px-6">
           
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog> */}
    <Dialog open={open} onClose={() => {}} className="relative w-full z-50">
  <DialogBackdrop
    transition
    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
  />
  <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
    <div className="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">
      <DialogPanel
        transition
        className="relative w-full h-full transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
      >
        <div className="px-4 pb-4 pt-5 sm:p-6 sm:pb-4 h-full">
          <div className="h-full">
            <AjoutProduit handletoast={handletoast} handleformclick={handleformclick} />
          </div>
        </div>
      </DialogPanel>
    </div>
  </div>
</Dialog>

    </div>
  )
}

export default Modal;
