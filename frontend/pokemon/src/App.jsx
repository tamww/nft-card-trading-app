import React, { useState } from 'react'
import './App.css'
import {App as AntdApp} from 'antd';
import { BrowserRouter,Route, Routes, Navigate} from "react-router-dom";
// /*import layout after login */
import Mainlayout from './pages/mainLayout/mainLayout'


function App() {
  const [count, setCount] = useState(0)

  return (
    // <div>sdasd</div>
      <AntdApp>
        <div>
          11
            <BrowserRouter>
              <Navigate from="" to="/main" />
              <Routes>
                <Route path = "/main/*" element={<Mainlayout/>}/>
              </Routes>
            </BrowserRouter>
        </div>
    </AntdApp> 
  )
}

export default App
