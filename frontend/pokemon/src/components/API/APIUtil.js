import axios from "axios";
import Cookies from "universal-cookie";

const metalGpApi = "/metal-groups"
const HOST = "http://localhost:1337";

/**
 * Get the full path of the backend server API.
 * @param {string} path without the host 
 * @returns a string
 */
function getFullPath(path) {
  if (path[0] === "/"){
    return HOST + path;
  }
  return HOST +  "/" + path;
}

/**
 * Get a API config object with auth. header.
 * The jwt is stored in the cookies.
 * @returns a API config object
 */
function getAPICallConfig() {
  let cookies = new Cookies();
  let jwt_cookie = cookies.get("jwt");
  if (jwt_cookie) {
    return {
      headers: {
        Authorization: "Bearer " + jwt_cookie,
      },
    };
  } else {
    return {};
  }
}

/**
 * Get all metal group info. The response from sever will contain a list of metal group information
 */
async function get_trait(url){
    let config = getAPICallConfig();
    let reply = ''

    await axios.get(url, config).then((response)=>{
        // console.log(response)
        reply = response
    }).catch(err => {
        reply =  err.response
    })
    return reply
}


export {
    get_trait
}
