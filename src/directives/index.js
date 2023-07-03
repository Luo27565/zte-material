import permission from '@/directives/permission'

const directives = {
  permission
}

const install = Vue => {
  Object.keys(directives).forEach(key => {
    Vue.directive(key, directives[key])
  })
}

export default install
