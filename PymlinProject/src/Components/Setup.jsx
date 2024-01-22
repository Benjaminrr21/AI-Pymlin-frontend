import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Setup = () => {

    const [mode,setMode] = useState("");
    const [level,setLevel] = useState("");
    const [index,setIndex] = useState(0);
    const navigate = useNavigate();


    const Change = (e) => {
        console.log(e.currentTarget.innerText);
        setMode(e.currentTarget.innerText);
        //console.log(mode);
        setIndex(e.currentTarget.id);
        //document.getElementById(e.currentTarget.id).style.backgroundColor= 'white';

    }
    const Level = (e) => {
        setLevel(e.currentTarget.id);
        //document.getElementById(e.currentTarget.id).style.backgroundColor= 'white';
    }

    
  return (
    <div id='setup'>
      <div id='setup-inner'>
          <h1>PYMLIN</h1>
          <p>Izaberite rezim igre</p>
          <button id='hh' onClick={(e)=>Change(e)}>Covek protiv coveka</button>
          <button id='hc' onClick={(e)=>Change(e)}>Covek protiv racunara</button>
          <button id='cc' onClick={(e)=>Change(e)}>Racunar protiv racunara</button>
          <p>Izaberite tezinu</p>
          <button id='easy' onClick={(e)=>Level(e)}>Easy</button>
          <button id='medium' onClick={(e)=>Level(e)}>Medium</button>
          <button id='hard' onClick={(e)=>Level(e)}>Hard</button>
          <br></br>
          <button id='start' onClick={()=>navigate(`/game/${index}/${level}`)}>START</button>

          
      </div>
    </div>
  )
}

export default Setup
