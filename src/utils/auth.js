import Cookies from 'js-cookie'

export function getToken(tokenname) {
  return Cookies.get(tokenname)
}

export function setToken(tokenname, tokendata) {
  console.log(tokenname, tokendata);
  return Cookies.set(tokenname, tokendata)
}

export function removeToken(tokenname) {
  return Cookies.remove(tokenname)
}
