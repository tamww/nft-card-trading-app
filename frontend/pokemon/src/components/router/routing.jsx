
import {Route, Routes} from "react-router-dom";
/*load all the pages */
import LandingPage from "../../pages/landingPage/landingPage.jsx"
import NotFoundPage from "../common/notFoundPage.jsx";
import CardDetailPage from "../../pages/detailPage/detailPage.jsx";
import TradePage from "../../pages/tradePage/tradePage.jsx";
import AuctionPage from "../../pages/AuctionPage/AuctionPage.jsx";
import CreatePage from "../../pages/createPage/createPage.jsx";
import MyCardPage from "../../pages/myCardPage/myCardPage.jsx";
import { UserProvider } from "../Context/UserContext.js";
import {
  useAccount,
  useReadContract,
  useReadContracts    
} from 'wagmi'

import * as CONSTANT_POKE from "../common/CONSTANT.js"
import NotExistToken from "../common/notExistToken.jsx";
import AdminAction from "../../pages/adminPage/adminAction.jsx";
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
    path: "/main/tokenNotFound",
    name: "TokenNotFound",
    component: <NotExistToken/>,
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
  {
    path: "/main/trade",
    name: "TradePage",
    component: <TradePage />,
    layout: "/main",
    cName: "side-text",
  },
  {
    path: "/main/auction",
    name: "AuctionPage",
    component: <AuctionPage />,
    layout: "/main",
    cName: "side-text",
  },
  {
    path: "/main/create",
    name: "AuctionPage",
    component: <CreatePage />,
    layout: "/main",
    cName: "side-text",
  },
  {
    path: "/main/myCard",
    name: "AuctionPage",
    component: <MyCardPage />,
    layout: "/main",
    cName: "side-text",
  },
  {
    path: "/main/admin",
    name: "AdminPage",
    component: <AdminAction />,
    layout: "/main",
    cName: "side-text",
  },
];

export default function Routing() {
    // const router = useRoutes(Routesdata);
    // return router
    const { address } = useAccount(); // Ensure address is available

    const { data: isPaused, isError, isLoading } = useReadContract({
        address: CONSTANT_POKE.POKEMONCARD_CONTRACT,
        abi: CONSTANT_POKE.ABI_POKE_CARD,
        chainId: CONSTANT_POKE.HARDHAT_ID,
        functionName: "paused",
        watch:true
    });
    const { data: isAdmin, isErrorAdmin, isLoadingAdmin } = useReadContract({
      address: CONSTANT_POKE.POKEMONCARD_CONTRACT,
      abi: CONSTANT_POKE.ABI_POKE_CARD,
      chainId: CONSTANT_POKE.HARDHAT_ID,
      functionName: "isAdmin",
      watch:true,
      args:[address]
    });
 
    return (
      <>
          <UserProvider value = {{address, isPaused, isAdmin}}>
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
          </UserProvider>
      </>
    );
}
