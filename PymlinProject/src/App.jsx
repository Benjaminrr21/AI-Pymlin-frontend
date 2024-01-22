import { useState } from 'react'

import './App.css'
import Game from './Components/Game'
import {Navigate, Routes, Route} from 'react-router-dom'
import Setup from './Components/Setup'


function App() {
 <Routes>

 </Routes>

  return (
    <>
      <Routes>
      <Route path="/" element={<Navigate to="/setup"/>}></Route>
      <Route path="/setup" element={<Setup/>}></Route>
      <Route path="/game/:mode/:lev" element={<Game/>}></Route>
      </Routes>

    </>
     
  )
}

export default App
