import { defineStore } from 'pinia'
import { searchAssetTree } from '@/api/api'
import { defaultBreadcrumb } from '@/utils'

const zteStore = defineStore('zte', {
  state: () => {
    return {
      // assetRole: sessionStorage.getItem('assetRole') !== 'true',
      assetRole: sessionStorage.getItem('assetRole') === 'true',
      selected: '',
      breadcrumb: [],
      treeData: [],
      allTreeData: []
    }
  },
  getters: {
    lastCrumb: state => {
      const [last] = [...state.breadcrumb].reverse()
      return last
    },
    expandedKeys: state => [...state.breadcrumb.map(e => e.id)]
  },
  actions: {
    setBreadcrumb (data) {
      this.breadcrumb = data
    },
    setSelected (id) {
      this.selected = id
    },
    resetSelected () {
      this.selected = ''
    },
    async getTreeData () {
      const { results } = await searchAssetTree(defaultBreadcrumb[0].id)
      this.allTreeData = results
      const flag = [...results]
      results.forEach((_, index) => {
        flag[index].title = results[index].title || results[index].name
        results[index].nodes.forEach((_, secondIndex) => {
          flag[index].nodes[secondIndex].title = results[index].nodes[secondIndex].title || results[index].nodes[secondIndex].name
          flag[index].nodes[secondIndex].nodes.forEach((_, thirdIndex) => {
            flag[index].nodes[secondIndex].nodes[thirdIndex].nodes = []
            flag[index].nodes[secondIndex].nodes[thirdIndex].title = results[index].nodes[secondIndex].nodes[thirdIndex].title || results[index].nodes[secondIndex].nodes[thirdIndex].name
          })
        })
      })
      this.treeData = flag
    }
  }
})

export default zteStore
