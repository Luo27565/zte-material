<template>
  <el-drawer :title="title" @open="init" :visible="drawer" :with-header="withHeader" :modal-append-to-body="false"
             :append-to-body="true"
             :direction="direction" :size="size">
    <div class="drawer-top">
      <span>{{ titleText }}资产</span>
      <div>
        <el-button @click="closeDrawer">取消</el-button>
        <el-button type="primary" :disabled="disabled" @click="finish">{{ titleText }}</el-button>
      </div>
    </div>
    <div class="column-content" v-loading="loading" element-loading-text="加载中">
      <div class="column-item" @click="handleNext(index)" v-for="(column,index) in columnData" :key="index">
        <div v-for="item in column" :key="item.id"
             :class="{'item':true,'choose-item':item.id===id||selectPath.some(e=>e===item.id)}"
             @click.stop="setPath(item.id,index,item.nodes.length)">
          <div :class="[item.id===id?'is-choose':'icon-folder']" @click.stop="chooseFolder(item.id,index)">
            <i class="el-icon-folder"/>
          </div>
          <div :class="[item.nodes.length?'item-content':'item-content-text']">{{ item.title || item.name }}</div>
        </div>
      </div>
      <div v-if="showFolderInfo&&info" class="column-item">
        <div class="info-item">
          <div class="info-img">
            <img :src="`${baseUrl}${info.path}.folderthumbnail.jpg`"/>
          </div>
          <template v-if="info.title">
            <div class="info-label">标题</div>
            <div class="info-value">{{ info.title }}</div>
          </template>
          <template v-if="info.name">
            <div class="info-label">名称</div>
            <div class="info-value">{{ info.name }}</div>
          </template>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import zteStore from '@/store'
import { baseUrl, defaultBreadcrumb } from '@/utils'
import { mapState, mapActions } from 'pinia'
import { command, searchAssetTree, searchTree } from '@/api/api'

export default {
  name: 'Drawer',
  props: {
    drawer: {
      type: Boolean,
      default: false
    },
    withHeader: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: 'move'
    },
    destroyOnClose: {
      type: Boolean,
      default: true
    },
    direction: {
      type: String,
      default: 'rtl'
    },
    size: {
      type: [String, Number],
      default: '100%'
    },
    selectData: {
      type: Array,
      default: () => []
    },
    fileName: {
      type: String,
      default: ''
    }
  },
  computed: {
    ...mapState(zteStore, ['breadcrumb']),
    titleText: function () {
      const flag = {
        move: '移动',
        copy: '复制'
      }
      return flag[this.title]
    },
    showFolderInfo: function () {
      const [last] = [...this.selectPath].reverse()
      return this.recursionData.some(e => e.path === last) ? this.recursionData.find(e => e.path === last).nodes.length === 0 : false
    },
    info: function () {
      return (this.columnData.at(-1) || []).find(e => e.id === this.selectPath.at(-1)) ?? ''
    },
    disabled: function () {
      if (this.title === 'move') {
        return !this.id || this.id === this.breadcrumb.at(-1).id || this.selectData.some(e => e.path === this.id)
      } else {
        return !this.id
      }
    }
  },
  data () {
    return {
      baseUrl,
      loading: false,
      id: '',
      selectPath: [],
      columnData: [],
      recursionData: []
    }
  },
  methods: {
    ...mapActions(zteStore, ['setBreadcrumb']),
    closeDrawer () {
      this.$emit('update:drawer', false)
    },
    flat (list) {
      let res = []
      for (const item of list) {
        const { nodes } = item
        if (nodes && nodes.length) {
          res = res.concat(this.flat(nodes))
        }
        res.push(item)
      }
      return res
    },
    async init () {
      this.id = ''
      const [flag] = this.breadcrumb.length ? this.breadcrumb : defaultBreadcrumb
      const breadcrumb = this.breadcrumb.length ? this.breadcrumb : defaultBreadcrumb
      this.selectPath = [...breadcrumb.map(e => e.id)]
      const { id } = flag
      try {
        this.loading = true
        const { results } = await searchAssetTree(id)
        this.recursionData = this.flat(results)
        const res = await Promise.all([...breadcrumb.map(e => searchTree({ filePath: e.id }))])
        const arr = res.map(e => e.results)
        this.columnData = [...breadcrumb.map((e, index) => index === 0 ? [{
          ...e,
          nodes: this.recursionData.find(l => l.path === e.id).nodes
        }] : [...arr[index - 1].filter(k => k.nodeType !== 'dam:Asset').map(e => ({
          ...e,
          id: e.path,
          title: e.properties ? e.properties['jcr:title'] : e.name,
          nodes: this.recursionData.find(l => l.path === e.path) ? this.recursionData.find(l => l.path === e.path).nodes : []
        }))])]
        const flag = res.at(-1).results.filter(k => k.nodeType !== 'dam:Asset')
        flag.length && this.columnData.push([...flag.map(e => ({
          ...e,
          id: e.path,
          title: e.properties['jcr:title'],
          nodes: this.recursionData.find(l => l.path === e.path) ? this.recursionData.find(l => l.path === e.path).nodes : []
        }))])
      } finally {
        this.loading = false
      }
    },
    chooseFolder (id, index) {
      if (id === this.id) {
        this.id = ''
        this.selectPath = [...this.selectPath.filter((_, idx) => idx < index)]
      } else {
        this.id = id
        this.selectPath = [...this.selectPath.filter((_, idx) => idx < index), id]
      }
      this.columnData = [...this.columnData.filter((_, idx) => idx <= index)]
    },
    async setPath (id, index, child) {
      this.id = ''
      this.selectPath = [...this.selectPath.filter((_, idx) => idx < index), id]
      if (child === 0) {
        this.columnData = [...this.columnData.filter((_, idx) => idx <= index)]
        return
      }
      try {
        this.loading = true
        const { results } = await searchTree({ filePath: id })
        this.columnData = [...this.columnData.filter((_, idx) => idx <= index), [...results.filter(k => k.nodeType !== 'dam:Asset').map(e => ({
          ...e,
          nodes: this.recursionData.find(l => l.path === e.path).nodes,
          id: e.path,
          title: e.properties ? e.properties['jcr:title'] : e.name
        }))]]
      } finally {
        this.loading = false
      }
    },
    handleNext (index) {
      this.id = ''
      this.selectPath = []
      this.columnData = [...this.columnData.filter((_, idx) => idx <= index)]
    },
    async finish () {
      try {
        this.loading = true
        const formData = new FormData()
        formData.append('cmd', this.title === 'move' ? 'movePage' : 'copyPage')
        formData.append('destParentPath', this.id)
        this.selectData.forEach(e => {
          formData.append('srcPath', e.path)
        })
        await command(formData)
        const flag = {
          move: '移动',
          copy: '复制'
        }
        this.$message.success(`${flag[this.title]}成功`)
        this.setBreadcrumb([...this.selectPath.map((e, index) => {
          const flag = this.columnData[index].find(i => i.id === e)
          return {
            id: e,
            title: flag.title || flag.name
          }
        })])
        this.$emit('finish', this.id)
        this.$emit('change', {
          name: this.fileName,
          path: this.id
        })
      } catch (e) {
        this.$message.error('操作失败')
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.drawer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4375rem 1rem;
  border-bottom: 0.0625rem solid #E1E1E1;
  height: 3.25rem;
  background-color: #FAFAFA;

  span {
    font-weight: 300;
    font-style: normal;
    font-size: 1.25rem;
    color: #323232;
  }
}

.column-content {
  display: block;
  height: calc(100% - 3.25rem);
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  outline: none;
  background-color: rgb(245, 245, 245);

  .column-item {
    display: inline-block;
    width: 100%;
    height: 100%;
    max-width: 15.625rem;
    border-right: solid .125rem #e9e9e9;
    vertical-align: top;

    .info-item {
      padding-left: .9375rem;
      padding-right: .9375rem;
      overflow-y: auto;
      -webkit-box-sizing: border-box;
      -moz-box-sizing: border-box;
      box-sizing: border-box;
      display: block;
      height: 100%;
      width: 100%;

      .info-img {
        display: block;
        width: 100%;
        text-align: center;
        margin-top: .8125rem;
        margin-bottom: .9375rem;
        min-height: 10rem;
        position: relative;

        img {
          border: 0;
          max-width: 100%;
          max-height: 100%;
          -webkit-box-shadow: 0 .125rem .3125rem rgba(0, 0, 0, 0.1);
          box-shadow: 0 .125rem .3125rem rgba(0, 0, 0, 0.1);
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          margin: auto;
        }
      }

      .info-label {
        overflow: hidden;
        -o-text-overflow: ellipsis;
        text-overflow: ellipsis;
        white-space: nowrap;
        -webkit-box-sizing: border-box;
        -moz-box-sizing: border-box;
        box-sizing: border-box;
        width: 50%;
        padding-right: .5625rem;
        text-align: right;
        float: left;
        color: #919191;
        display: block;
        line-height: 1rem;
        font-size: .75rem;
      }

      .info-value {
        overflow: auto;
        white-space: normal;
        word-wrap: break-word;
        padding-left: .5625rem;
        max-width: 9.375rem;
        display: block;
        line-height: 1rem;
        font-size: .75rem;
      }
    }

    .choose-item, .choose-item .icon-folder {
      background-color: rgb(230, 235, 242) !important;
    }

    .item {
      display: block;
      position: relative;
      cursor: pointer;
      line-height: 3rem;
      height: 3rem;
      color: #323232;
      text-decoration: none;
      white-space: nowrap;
      overflow: hidden;
      -o-text-overflow: ellipsis;
      text-overflow: ellipsis;

      .icon-folder {
        display: block;
        position: relative;
        float: left;
        width: 3rem;
        height: 3rem;
        text-align: center;
        background-color: rgb(250, 250, 250);
        margin-right: .9375rem;
      }

      .is-choose {
        background-color: rgba(50, 110, 200, 0.75);
        display: block;
        position: relative;
        float: left;
        width: 3rem;
        height: 3rem;
        text-align: center;
        margin-right: .9375rem;
      }

      .is-choose i::after {
        content: '';
        background-image: url('data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjExNTJweCIgaGVpZ2h0PSIxMTUycHgiIHZpZXdCb3g9IjAgMCAxMTUyIDExNTIiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDExNTIgMTE1MiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGQ9Ik01NzYsMEMyNTcuOSwwLDAsMjU3LjksMCw1NzZzMjU3LjksNTc2LDU3Niw1NzZzNTc2LTI1Ny45LDU3Ni01NzZTODk0LjEsMCw1NzYsMHogTTQzOSw5MTlMMjA5LDY4OQoJYy05LjQtOS40LTkuNC0yNC42LDAtMzMuOUwyOTUsNTY5YzkuNC05LjQsMjQuNi05LjQsMzMuOSwwbDEyNywxMjdsMzkxLTM5MWM5LjQtOS40LDI0LjYtOS40LDMzLjksMEw5NjcsMzkxCgljOS40LDkuNCw5LjQsMjQuNiwwLDMzLjlMNDczLDkxOUM0NjMuNiw5MjguNCw0NDguNCw5MjguNCw0MzksOTE5eiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=');
        -webkit-background-size: 1.125rem 1.125rem;
        -moz-background-size: 1.125rem 1.125rem;
        background-size: 1.125rem 1.125rem;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        position: absolute;
        top: 0;
        right: 0;
        left: 0;
        height: 3rem;
      }

      .item-content {
        display: block;
        padding-top: .5rem;
        padding-right: .9375rem;
        padding-left: 0;
        height: 2rem;
        line-height: 2rem;
        white-space: nowrap;
        overflow: hidden;
        -o-text-overflow: ellipsis;
        text-overflow: ellipsis;
        font-weight: normal;
        font-style: normal;
        font-size: .8125rem;
        color: #323232;
      }

      .item-content-text {
        display: block;
        padding-top: .5rem;
        padding-right: .9375rem;
        padding-left: 0;
        height: 2rem;
        line-height: 2rem;
        white-space: nowrap;
        overflow: hidden;
        -o-text-overflow: ellipsis;
        text-overflow: ellipsis;
        font-weight: normal;
        font-style: normal;
        font-size: .8125rem;
        color: #323232;
      }

      .item-content::after {
        content: " ";
        background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMTUyIiBoZWlnaHQ9IjExNTIiIHZpZXdCb3g9IjAgMCAxMTUyIDExNTIiPgo8cGF0aCBlbmFibGUtYmFja2dyb3VuZD0ibmV3IiBkPSJNMjQwIDE0NGwxNDQtMTQ0IDU3NiA1NzYtNTc2IDU3Ni0xNDQtMTQ0IDQzMi00MzJ6IiBmaWxsPSIjMDAwIi8+Cjwvc3ZnPg==');
        -webkit-background-size: .75rem .75rem;
        -moz-background-size: .75rem .75rem;
        background-size: .75rem .75rem;
        background-position: 50% 50%;
        background-repeat: no-repeat;
        width: .75rem;
        height: 100%;
        position: absolute;
        right: .8125rem;
        top: 0;
        opacity: .4;
        -ms-filter: "progid:DXImageTransform.Microsoft.Alpha(Opacity=40)";
        filter: alpha(opacity=40);
      }
    }

    .item:hover, .item:hover .icon-folder {
      text-decoration: none;
      background-color: rgb(233, 233, 233);
    }

    .is-choose i,
    .icon-folder:hover i {
      color: #FFFFFF;
    }

    .icon-folder:hover::after {
      content: '';
      background-image: url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjExNTJweCIgaGVpZ2h0PSIxMTUycHgiIHZpZXdCb3g9IjAgMCAxMTUyIDExNTIiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDExNTIgMTE1MiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGQ9Ik01NzYsMEMyNTcuOSwwLDAsMjU3LjksMCw1NzZzMjU3LjksNTc2LDU3Niw1NzZzNTc2LTI1Ny45LDU3Ni01NzZTODk0LjEsMCw1NzYsMHogTTQzOSw5MTlMMjA5LDY4OQoJYy05LjQtOS40LTkuNC0yNC42LDAtMzMuOUwyOTUsNTY5YzkuNC05LjQsMjQuNi05LjQsMzMuOSwwbDEyNywxMjdsMzkxLTM5MWM5LjQtOS40LDI0LjYtOS40LDMzLjksMEw5NjcsMzkxCgljOS40LDkuNCw5LjQsMjQuNiwwLDMzLjlMNDczLDkxOUM0NjMuNiw5MjguNCw0NDguNCw5MjguNCw0MzksOTE5eiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=);
      -webkit-background-size: 1.125rem 1.125rem;
      -moz-background-size: 1.125rem 1.125rem;
      background-size: 1.125rem 1.125rem;
      background-position: 50% 50%;
      background-repeat: no-repeat;
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      height: 3rem;
    }
  }
}
</style>
