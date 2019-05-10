// converts the GET parameters from the URL into an object
export default function getGetParams(locationSearch){
  let getParamsString = locationSearch.substr(1).split("&")
  let getParams = {}
  for(let param of getParamsString){
    let paramArr = param.split("=")
    getParams[paramArr[0]] = paramArr[1]
  }

  return getParams
}
