import { defaults, hasXMLHttpRequest } from './utils.js'
import * as fetchNode from './getFetch.cjs'

let fetchApi
if (typeof fetch === 'function') {
  if (typeof global !== 'undefined' && global.fetch) {
    fetchApi = global.fetch
  } else if (typeof window !== 'undefined' && window.fetch) {
    fetchApi = window.fetch
  } else {
    fetchApi = fetch
  }
}
let XmlHttpRequestApi
if (hasXMLHttpRequest()) {
  if (typeof global !== 'undefined' && global.XMLHttpRequest) {
    XmlHttpRequestApi = global.XMLHttpRequest
  } else if (typeof window !== 'undefined' && window.XMLHttpRequest) {
    XmlHttpRequestApi = window.XMLHttpRequest
  }
}
let ActiveXObjectApi
if (typeof ActiveXObject === 'function') {
  if (typeof global !== 'undefined' && global.ActiveXObject) {
    ActiveXObjectApi = global.ActiveXObject
  } else if (typeof window !== 'undefined' && window.ActiveXObject) {
    ActiveXObjectApi = window.ActiveXObject
  }
}
if (!fetchApi && fetchNode && !XmlHttpRequestApi && !ActiveXObjectApi) fetchApi = fetchNode.default || fetchNode // because of strange export
if (typeof fetchApi !== 'function') fetchApi = undefined

const addQueryString = (url, params) => {
  if (params && typeof params === 'object') {
    let queryString = ''
    // Must encode data
    for (const paramName in params) {
      queryString += '&' + encodeURIComponent(paramName) + '=' + encodeURIComponent(params[paramName])
    }
    if (!queryString) return url
    url = url + (url.indexOf('?') !== -1 ? '&' : '?') + queryString.slice(1)
  }
  return url
}

const fetchIt = (url, fetchOptions, callback) => {
  fetchApi(url, fetchOptions).then((response) => {
    if (!response.ok) return callback(response.statusText || 'Error', { status: response.status })
    response.text().then((data) => {
      callback(null, { status: response.status, data })
    }).catch(callback)
  }).catch(callback)
}

let omitFetchOptions = false

// fetch api stuff
const requestWithFetch = (options, url, payload, callback) => {
  if (options.queryStringParams) {
    url = addQueryString(url, options.queryStringParams)
  }
  const headers = defaults({}, typeof options.customHeaders === 'function' ? options.customHeaders() : options.customHeaders)
  if (payload) headers['Content-Type'] = 'application/json'
  const reqOptions = typeof options.requestOptions === 'function' ? options.requestOptions(payload) : options.requestOptions
  const fetchOptions = defaults({
    method: payload ? 'POST' : 'GET',
    body: payload ? options.stringify(payload) : undefined,
    headers
  }, omitFetchOptions ? {} : reqOptions)
  try {
    fetchIt(url, fetchOptions, callback)
  } catch (e) {
    if (!reqOptions || Object.keys(reqOptions).length === 0 || !e.message || e.message.indexOf('not implemented') < 0) {
      return callback(e)
    }
    try {
      Object.keys(reqOptions).forEach((opt) => {
        delete fetchOptions[opt]
      })
      fetchIt(url, fetchOptions, callback)
      omitFetchOptions = true
    } catch (err) {
      callback(err)
    }
  }
}

// xml http request stuff
const requestWithXmlHttpRequest = (options, url, payload, callback) => {
  if (payload && typeof payload === 'object') {
    // if (!cache) payload._t = Date.now()
    // URL encoded form payload must be in querystring format
    payload = addQueryString('', payload).slice(1)
  }

  if (options.queryStringParams) {
    url = addQueryString(url, options.queryStringParams)
  }

  try {
    let x
    if (XmlHttpRequestApi) {
      x = new XmlHttpRequestApi()
    } else {
      x = new ActiveXObjectApi('MSXML2.XMLHTTP.3.0')
    }
    x.open(payload ? 'POST' : 'GET', url, 1)
    if (!options.crossDomain) {
      x.setRequestHeader('X-Requested-With', 'XMLHttpRequest')
    }
    x.withCredentials = !!options.withCredentials
    if (payload) {
      x.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded')
    }
    if (x.overrideMimeType) {
      x.overrideMimeType('application/json')
    }
    let h = options.customHeaders
    h = typeof h === 'function' ? h() : h
    if (h) {
      for (const i in h) {
        x.setRequestHeader(i, h[i])
      }
    }
    x.onreadystatechange = () => {
      x.readyState > 3 && callback(x.status >= 400 ? x.statusText : null, { status: x.status, data: x.responseText })
    }
    x.send(payload)
  } catch (e) {
    console && console.log(e)
  }
}

const request = (options, url, payload, callback) => {
  if (typeof payload === 'function') {
    callback = payload
    payload = undefined
  }
  callback = callback || (() => {})

  if (fetchApi) {
    // use fetch api
    return requestWithFetch(options, url, payload, callback)
  }

  if (hasXMLHttpRequest() || typeof ActiveXObject === 'function') {
    // use xml http request
    return requestWithXmlHttpRequest(options, url, payload, callback)
  }

  callback(new Error('No fetch and no xhr implementation found!'))
}

export default request
