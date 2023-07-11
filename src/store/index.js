import { defineStore } from 'pinia'
import { searchAssetTree } from '@/api/api'
import { defaultBreadcrumb } from '@/utils'

const zteStore = defineStore('zte', {
  state: () => {
    return {
      assetRole: sessionStorage.getItem('assetRole') !== 'true',
      // assetRole: sessionStorage.getItem('assetRole') === 'true',
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
        flag[index].sortBy = flag[index].sort ? new Date(flag[index].sort).getTime() : 0
        results[index].nodes.forEach((_, secondIndex) => {
          flag[index].nodes[secondIndex].title = results[index].nodes[secondIndex].title || results[index].nodes[secondIndex].name
          flag[index].nodes[secondIndex].sortBy = results[index].nodes[secondIndex].sort ? new Date(results[index].nodes[secondIndex].sort).getTime() : 0
          flag[index].nodes[secondIndex].nodes.forEach((_, thirdIndex) => {
            flag[index].nodes[secondIndex].nodes[thirdIndex].nodes = []
            flag[index].nodes[secondIndex].nodes[thirdIndex].title = results[index].nodes[secondIndex].nodes[thirdIndex].title || results[index].nodes[secondIndex].nodes[thirdIndex].name
            flag[index].nodes[secondIndex].nodes[thirdIndex].sortBy = results[index].nodes[secondIndex].nodes[thirdIndex].sort ? new Date(results[index].nodes[secondIndex].nodes[thirdIndex].sort).getTime() : 0
          })
        })
      })

      function sortChildrenBySortProperty (arr) {
        arr.forEach(item => {
          item.nodes.sort((a, b) => b.sortBy - a.sortBy)
          if (item.nodes.length > 0) {
            sortChildrenBySortProperty(item.nodes)
          }
        })
      }

      sortChildrenBySortProperty(flag)
      this.treeData = flag
    }
  }
})

export default zteStore
