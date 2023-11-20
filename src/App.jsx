import { useState } from 'react'
import './App.css'
import ProductForm from './components/ProductForm'
import ProductImageUploader from './components/AddImagesToProducts'

function App() {


  return (
    <>
      <ProductForm/>
      <div className='h-screen'>
        <ProductImageUploader />
      </div>
    </>

  )
}

export default App
