
import {Route, Routes} from "react-router-dom";
/*load all the pages */
import LandingPage from "../../pages/landingPage/landingPage.jsx"
import NotFoundPage from "../common/notFoundPage.jsx";
import CardDetailPage from "../../pages/detailPage/detailPage.jsx";

/*set of router data */
const Routesdata = [
  {
    path: "/main",
    name: "home",
    // icon: <AiIcons.AiFillHome/>,
    component: <LandingPage/>,
    layout: "/main",
    cName: "side-text"
  },
  {
    path: "/main/pageNotFound",
    name: "PageNotFound",
    component: <NotFoundPage/>,
    layout: "/main",
    cName: "side-text"
  },
  {
    path: "/main/card/:id",
    name: "CardDetailPage",
    component: <CardDetailPage />,
    layout: "/main",
    cName: "side-text",
  },
];

export default function Routing() {
    // const router = useRoutes(Routesdata);
    // return router
    return (
      <>
          <Routes>
            {/* <Routing/> */}
            <Route path='/main'>
              <Route index={true} element={<LandingPage/>}/>
              {Routesdata.map((item, index) =>
                <Route
                    path={item.path} 
                    element={item.component} 
                    key = {index}
                />
              )}
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
      </>
    );
}
