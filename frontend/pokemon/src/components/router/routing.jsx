import React from "react";
import { Route, Routes } from "react-router-dom";
// import {Routesdata} from './routes.js';
/*load all the pages */
import LandingPage from "../../pages/landingPage/landingPage.jsx"
// import HomePage from "../../../pages/homePage/homePage.jsx"

/*set of router data */
const Routesdata = [
    // {
    //     path: "/main/homePage",
    //     name: "homePage",
    //     // icon: <AiIcons.AiFillHome/>,
    //     component: <HomePage/>,
    //     layout: "/main",
    //     cName: "side-text",
    // }
  {
    path: "/main/home",
    name: "home",
    // icon: <AiIcons.AiFillHome/>,
    component: <LandingPage/>,
    layout: "/main",
    cName: "side-text"
  }
];

export default function Routing() {
    return (
        <Routes>
             {Routesdata.map((item, index) =>
                <Route
                    exact path={item.path} 
                    element={item.component} 
                    key = {index}
                />
            )}
        </Routes >
    );
}
