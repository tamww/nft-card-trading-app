import React from "react";
/*load all the pages */
import LandingPage from "../../pages/landingPage/landingPage.jsx"
// import HomePage from "../../../pages/homePage/homePage.jsx"

/*set of router data */
export const Routesdata = [
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


