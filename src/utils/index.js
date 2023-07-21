// baseUrl /aem
// export const baseUrl = '/aem'
export const baseUrl = '/aem'

// 素材管理tag的路径
export const assetManagementUrl = '/content/cq:tags/popular-tags'

// columnPath
export const columnPath = '/mnt/overlay/granite/ui/content/tree.0.html'

// 素材管理
export const defaultBreadcrumb = [{
  id: '/content/dam/asset-management',
  title: '素材管理'
}]

// 图库api
export const gallery = {
  label: '图库',
  key: 'gallery',
  // url: '/mnt/overlay/granite/ui/content/tree.0.html/content/dam/asset-management/copyright-images'
  url: '/content/dam/asset-management/copyright-images'
}

// 视频api
export const video = {
  label: '视频',
  key: 'video',
  // url: '/mnt/overlay/granite/ui/content/tree.0.html/content/dam/asset-management/copyright-video'
  url: '/content/dam/asset-management/copyright-video'
}

// 字体api
export const font = {
  label: '字体',
  key: 'font',
  // url: '/mnt/overlay/granite/ui/content/tree.0.html/content/dam/asset-management/copyright-fonts'
  url: '/content/dam/asset-management/copyright-fonts'
}

// 音乐api
export const music = {
  label: '音乐',
  key: 'music',
  // url: '/mnt/overlay/granite/ui/content/tree.0.html/content/dam/asset-management/copyrighted-music'
  url: '/content/dam/asset-management/copyrighted-music'
}

// 人像有无
export const portraitOptions = [{
  label: '有',
  value: '1'
}, {
  label: '无',
  value: '0'
}, {
  label: '未知',
  value: '2'
}]

//  小模特图像公开
export const minorModelImageDisclosureOptions = [{
  label: '年龄未知',
  value: 'http://ns.useplus.org/ldf/vocab/AG-UNK'
}, {
  label: '25 岁或以上',
  value: 'http://ns.useplus.org/ldf/vocab/AG-A25'
}, {
  label: '24 岁',
  value: 'http://ns.useplus.org/ldf/vocab/AG-A24 '
}, {
  label: '23 岁',
  value: 'http://ns.useplus.org/ldf/vocab/AG-A23'
}, {
  label: '22 岁',
  value: 'http://ns.useplus.org/ldf/vocab/AG-A22'
}, {
  label: '21 岁',
  value: 'http://ns.useplus.org/ldf/vocab/AG-A21'
}, {
  label: '20 岁',
  value: 'http://ns.useplus.org/ldf/vocab/AG-A20'
}, {
  label: '19 岁',
  value: 'http://ns.useplus.org/ldf/vocab/AG-A19'
}, {
  label: '18 岁',
  value: 'http://ns.useplus.org/ldf/vocab/AG-A18'
}, {
  label: '17 岁',
  value: 'http://ns.useplus.org/ldf/vocab/AG-A17'
}, {
  label: '16 岁',
  value: 'http://ns.useplus.org/ldf/vocab/AG-A16'
}, {
  label: '15 岁',
  value: 'http://ns.useplus.org/ldf/vocab/AG-A15'
}, {
  label: '14 岁或以下',
  value: 'http://ns.useplus.org/ldf/vocab/AG-A14'
}]

// 授权状态
export const releaseOptions = [{
  label: '  ',
  value: ''
}, {
  label: '无',
  value: 'http://ns.useplus.org/ldf/vocab/MR-NON'
}, {
  label: '不适用',
  value: 'http://ns.useplus.org/ldf/vocab/MR-NAP '
}, {
  label: '肖像使用授权无限制',
  value: 'http://ns.useplus.org/ldf/vocab/MR-UMR '
}, {
  label: '肖像使用授权受限或不完整',
  value: 'http://ns.useplus.org/ldf/vocab/MR-LMR '
}]

// 数字源类型
export const digitalSourceTypeOptions = [{
  label: '  ',
  value: ''
}, {
  label: '现实生活场景的原始数字拍摄',
  value: 'http://cv.iptc.org/newscodes/digitalsourcetype/digitalCapture'
}, {
  label: '通过负片进行数字化',
  value: 'http://cv.iptc.org/newscodes/digitalsourcetype/negativeFilm'
}, {
  label: '通过正片进行数字化',
  value: 'http://cv.iptc.org/newscodes/digitalsourcetype/positiveFilm'
}, {
  label: '通过不透明介质上的印刷品进行数字化',
  value: 'http://cv.iptc.org/newscodes/digitalsourcetype/print'
}, {
  label: '由软件创建',
  value: 'http://cv.iptc.org/newscodes/digitalsourcetype/softwareImage'
}]

// 来源
export const sourceOptions = [{
  label: '摄影网',
  value: 'https://cnphotos.net/'
}, {
  label: '原创',
  value: 'https://www.zte.com.cn/china/'
}, {
  label: '视觉中国',
  value: 'https://www.vcg.com/'
}, {
  label: '站酷海洛',
  value: 'https://www.hellorf.com/'
}, {
  label: '其他',
  value: 'other'
}]

//  资产授权状态
export const propertyReleaseStatusOptions = [{
  label: '有版权',
  value: 'yes'
}, {
  label: '存在风险',
  value: 'dangerous'
}, {
  label: '无版权',
  value: 'no'
}, {
  label: '未知',
  value: 'unknown'
}]

// 授权范围
export const authorizationScopeCheckBox = [{
  label: '线上',
  value: 'online'
}, {
  label: '线下',
  value: 'offline'
}, {
  label: '其他',
  value: 'other'
}]

//  文件类型
export const fileTypeOptions = [{
  label: '全部',
  className: 'select-all',
  value: '',
  type: ''
}, {
  label: '图片',
  className: 'select-image',
  value: 'image',
  type: 'image/jpeg;image/gif;image/png;image/pjpeg;image/tiff;image/vnd.adobe.photoshop;image/x-xcf;image/x-bmp;image/vnd.microsoft.icon;image/bmp;image/x-ppm;image/x-pbm;image/pbm;application/postscript;application/vnd.oasis.opendocument.graphics;image/svg+xml;image/x-adobe-dng;image/x-dcraw;image/x-dcraw;image/x-raw-nikon'
}, {
  label: '视频',
  className: 'select-video',
  value: 'video',
  type: 'application/x-dvi;video/x-flv;video/mp4;video/mpeg;video/ogg;video/quicktime;video/x-ms-wmv;application/x-shockwave-flash;application/vnd.adobe.air-application-installer-package+zip'
}, {
  label: '音乐',
  className: 'select-music',
  value: 'music',
  type: 'audio/x-aac;audio/midi;audio/3gpp;audio/mp3;audio/mp4;audio/mpeg;audio/mpeg;audio/vorbis;audio/vnd.rn-realaudio;audio/x-wav;audio/x-ms-wma;'
}, {
  label: '字体',
  className: 'select-font',
  value: 'font',
  type: 'application/msword;application/vnd.openxmlformats-officedocument.wordprocessingml.document;application/vnd.oasis.opendocument.text;application/pdf;text/html;text/rtf;text/plain;application/vnd.openxmlformats-officedocument.wordprocessingml.document;text/csv;application/vnd.oasis.opendocument.presentation;application/vnd.ms-excel;application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;application/vnd.oasis.opendocument.presentation;application/vnd.ms-powerpoint;application/vnd.openxmlformats-officedocument.presentationml.presentation;application/x-indesign;application/postscript;application/pdf;application.vnd.quark.quarkxpress;application/x-tar-gz;application/java-archive;application/x-tar;application/zip;application/x-rar-compressed'
}, {
  label: '文件',
  className: 'select-file',
  value: 'file',
  type: ''
}]

// 图片视频字体音乐
export const selectOptions = [{
  label: '图片',
  value: 'image'
}, {
  label: '视频',
  value: 'video'
}, {
  label: '字体',
  value: 'font'
}, {
  label: '音乐',
  value: 'music'
}]

// show
export const showOptions = [{
  label: '文件',
  value: 'file'
}, {
  label: '文件夹',
  value: 'folder'
}, {
  label: '文件和文件夹',
  value: 'fileAndFolder'
}]

// 色彩
export const colorOptions = [{
  label: '红色系列',
  value: 'red'
}, {
  label: '橙色系列',
  value: 'orange'
}, {
  label: '黄色系列',
  value: 'yellow'
}, {
  label: '绿色系列',
  value: 'green'
}, {
  label: '青色系列',
  value: 'cyan'
}, {
  label: '蓝色系列',
  value: 'blue'
}, {
  label: '紫色系列',
  value: 'purple'
}, {
  label: '黑白系列',
  value: 'blackAndWhite'
}]

// 是否推荐
export const whetherRecommendedOptions = [{
  label: '是',
  value: 'true'
}, {
  label: '否',
  value: 'false'
}]

// 版权类型
export const typeOfCopyrightOptions = [{
  label: '全用途',
  value: 'all'
}, {
  label: '媒体用途',
  value: 'media'
}]

// 构图
export const compositionOptions = [{
  label: '横图',
  value: '1'
}, {
  label: '竖图',
  value: '2'
}, {
  label: '方图',
  value: '3'
}, {
  label: '',
  value: ''
}]

// filter
export const types = {
  image: 'image/bmp;image/jpeg;image/png;image/tiff;image/gif;image/vnd.adobe.photoshop;image/webp',
  video: 'application/vnd.rn-realmedia-vbr;video/mp4;application/vnd.rn-realmedia;video/3gpp;video/x-m4v;video/x-ms-vob;video/x-matroska;video/x-flv;video/quicktime;video/x-msvideo;video/3gpp',
  music: 'audio/x-ms-wma;audio/x-aac;audio/x-flac;audio/x-wav;audio/mpeg',
  font: 'application/x-font-woff;application/x-font-ttf',
  file: 'application/zip;application/pdf'
}

const imageType = types.image.split(';').reduce((obj, item) => {
  obj[item] = 'image'
  return obj
}, {})
const videoType = types.video.split(';').reduce((obj, item) => {
  obj[item] = 'video'
  return obj
}, {})
const musicType = types.music.split(';').reduce((obj, item) => {
  obj[item] = 'music'
  return obj
}, {})
const fontType = types.font.split(';').reduce((obj, item) => {
  obj[item] = 'font'
  return obj
}, {})
const fileType = types.file.split(';').reduce((obj, item) => {
  obj[item] = 'file'
  return obj
}, {})

export const needType = { ...imageType, ...videoType, ...musicType, ...fontType, ...fileType }

// 排序
export const sortOptions = [{
  label: '下载',
  value: 'download'
}]

// 搜索的文件类型
export const searchFileType = [{
  label: '图片',
  value: 'image'
}, {
  label: '视频',
  value: 'video'
}, {
  label: '音频',
  value: 'music'
}, {
  label: '字体',
  value: 'font'
}, {
  label: '文件',
  value: 'file'
}]
