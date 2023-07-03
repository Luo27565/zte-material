import Vue from 'vue'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import { authorizationScopeCheckBox, sourceOptions } from '@/utils/index'

dayjs.locale('zh-cn')

dayjs.extend(relativeTime)

Vue.filter('formatSize', size => {
  if (!size) return ''
  const num = 1024.00 // byte
  if (size < num) {
    return size + 'B'
  }
  if (size < Math.pow(num, 2)) {
    return (size / num).toFixed(1) + ' KB'
  } // kb
  if (size < Math.pow(num, 3)) {
    return (size / Math.pow(num, 2)).toFixed(1) + ' MB'
  } // M
  if (size < Math.pow(num, 4)) {
    return (size / Math.pow(num, 3)).toFixed(1) + ' G'
  } // G
  return (size / Math.pow(num, 4)).toFixed(1) + ' T' // T
})

Vue.filter('formatName', name => name ? name.substring(0, name.lastIndexOf('.')) : '')

Vue.filter('formatType', type => {
  if (type) {
    const str = type.substring(0, type.lastIndexOf('/')).toUpperCase()
    const last = type.substring(type.lastIndexOf('/') + 1, type.length)
    if (last.includes('x-font')) {
      return last.substring(last.lastIndexOf('-') + 1, last.length).toUpperCase()
    } else {
      let flag = {}
      flag[str] = str
      flag = {
        ...flag,
        APPLICATION: 'DOCUMENT',
        VIDEO: 'MULTIMEDIA',
        AUDIO: 'MULTIMEDIA'
      }
      return flag[str]
    }
  } else {
    return '文件夹'
  }
})

Vue.filter('formatLastModifiedTime', time => {
  if (!time) return
  const hour = dayjs(time).format('HH')
  let flag
  if (hour < 6) {
    flag = '凌晨'
  } else if (hour < 12) {
    flag = '上午'
  } else if (hour < 18) {
    flag = '下午'
  } else if (hour < 24) {
    flag = '晚上'
  }
  return dayjs(time).format(`YYYY年M月D日 ${flag}hh:mm:ss`)
})

Vue.filter('formatTime', time => dayjs(time).format('YYYY-MM-DD HH:MM'))

Vue.filter('formatAuthorizationScope', authorizationScope => authorizationScope ? authorizationScope.split(';').filter(k => k).map(e => authorizationScopeCheckBox.find(i => i.value === e).label).join('；') : '')

Vue.filter('formatSource', value => value ? sourceOptions.find(e => e.value === value).label : '')

Vue.filter('formatDate', date => {
  let ret = ''
  let fmt = 'YYYY-mm-dd HH:MM'
  if (!date) return ''
  date = new Date(date)
  const opt = {
    'Y+': date.getFullYear().toString(), // 年
    'm+': (date.getMonth() + 1).toString(), // 月
    'd+': date.getDate().toString(), // 日
    'H+': date.getHours().toString(), // 时
    'M+': date.getMinutes().toString(), // 分
    'S+': date.getSeconds().toString() // 秒
  }
  for (const k in opt) {
    ret = new RegExp('(' + k + ')').exec(fmt)
    if (ret) {
      fmt = fmt.replace(
        ret[1],
        ret[1].length === 1 ? opt[k] : opt[k].padStart(ret[1].length, '0')
      )
    }
  }
  return fmt
})

Vue.filter('formatDownloadManagement', downloadManagement => downloadManagement ? downloadManagement.split('/').at(-1) : '')
