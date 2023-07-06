import { get, post } from '@/api/index'
import { assetManagementUrl, baseUrl } from '@/utils'

// CSRF-Token
export const getToken = () => get('/libs/granite/csrf/token.json')

// check
export const getJSON = (url) => get(`${url}.1.json`)

// 查询标签
export const searchTag = (tagName, tagPath = assetManagementUrl) => get(`/bin/tag/search?tagName=${tagName}&tagPath=${tagPath}`)
export const searchPopularTag = (tagPath = '/content/cq:tags/popular-tags') => get(`/bin/zte/tag/popular?tagPath=${tagPath}`)

// 标签新增
export const addTag = (url, formData) => post(url, formData)

// 查询资产
export const searchAsset = params => get('/bin/zte/asset/search', params)

// 查询资产文件夹树
export const searchTree = params => get('/bin/zte/asset/folder/tree', params)

// /bin/assetsRequestRedirectServlet
export const assetsRequestRedirectServlet = params => get('/bin/assetsRequestRedirectServlet', params)

// 查看树结构
export const getTree = columnPath => get(`${columnPath}?columnPath=/mnt/overlay/dam/gui/content/assets/jcr%3acontent/views/list`)

// 查询资产文件夹数
export const folderTree = filePath => get(`/bin/zte/asset/folder/tree?filePath=${filePath}`)

// 下载资产
export const downloadByPort = filePath => get(`/bin/zte/asset/download?filePath=${filePath}`)

// 资产文件夹新建
export const createFolder = ({
  filePath,
  folderName,
  folderTitle
}) => post('/bin/zte/asset/folder/create', {
  filePath,
  folderName,
  folderTitle
})

export const createFolderByAem = (url, formData) => post(url, formData)

// 资产删除
export const command = (formData) => post('/bin/wcmcommand', formData)

// /bin/asset/tree
export const searchAssetTree = filePath => get(`/bin/zte/asset/tree?filePath=${filePath}`)

// 上传资产
export const uploadAsset = formData => post('/bin/zte/asset/upload', formData)

export const uploadUrl = `${baseUrl}/bin/zte/asset/upload`

// 判断相关
export const checkRelated = item => get(`/libs/dam/gui/content/assets/bulkrelateasset.manageReferences.html?_charset_=utf-8&ck=${new Date().getTime()}&item=${item}`)

// 资产关联
export const relateAsset = formData => post('/bin/zte/asset/relate', formData)

// 资产取消关联
export const unrelatedAsset = formData => post('/bin/zte/asset/unrelated', formData)

// 查询资产详情
export const assetDetail = filePath => get(`/bin/zte/asset/detail?filePath=${filePath}`)

// 资产属性修改
export const assetEdit = data => post('/bin/zte/asset/edit', JSON.stringify(data), false)

// 文件夹 文件夹修改标题
export const editFolder = (url, formData) => post(url, formData)

// 系统登出
export const loginOut = () => get('/system/sling/logout.html')

// 批量资产属性修改
export const assetBatchEdit = data => post('/bin/zte/asset/batch/edit', JSON.stringify(data), false)

// 查询资产详情
export const detailByAssetId = id => get(`/bin/zte/asset/id/detail?assetId=${id}`)

// 多资产打包下载
export const downloadZip = url => post(`${url}`, {}, true, true)
