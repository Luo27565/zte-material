import axios from 'axios'
import { getToken } from '@/api/api'
import { baseUrl } from '@/utils'

document.cookie = 'login-token=28314397-c981-410f-9d33-3959f006cd8d%3aa8a93117-480f-4615-8b32-1159ecdd760e_695131bffb6dd66a4887973c09dccd8f%3acrx.default;path=/'
const service = axios.create({
  baseURL: baseUrl,
  withCredentials: true,
  timeout: 8000
})

export const get = (url, params = {}) => {
  return new Promise((resolve, reject) => {
    service.get(url, {
      params: { ...params }
    }).then(res => {
      resolve(res.data)
    }).catch(err => {
      reject(err.data)
    })
  })
}

const setToken = async () => {
  const { token } = await getToken()
  return token
}

export const post = async (url, params, contentType = true, isBlob = false) => {
  const token = await setToken()
  return new Promise((resolve, reject) => {
    service.post(url, params, isBlob ? {
      headers: {
        'Content-Type': contentType ? 'application/x-www-form-urlencoded' : 'application/json',
        'CSRF-Token': token
      },
      responseType: 'blob'
    } : {
      headers: {
        'Content-Type': contentType ? 'application/x-www-form-urlencoded' : 'application/json',
        'CSRF-Token': token
      }
    }).then(res => {
      resolve(res.data)
    }).catch(err => {
      if (err.response && err.response.data) {
        reject(err.response.data)
      } else {
        reject(err)
      }
    })
  })
}

export const downloadByGet = async (url, fileName = '') => {
  const a = document.createElement('a')
  document.body.appendChild(a)
  a.href = `${baseUrl}${url}`
  a.download = fileName
  a.click()
  await get(`/bin/zte/asset/download?filePath=${url}`)
  document.body.removeChild(a)
}
