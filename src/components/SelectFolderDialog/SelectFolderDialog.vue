<template>
  <el-dialog :visible="visible" @close="handleClose" :modal-append-to-body="true" :append-to-body="true"
             :show-close="false" @open="init" width="75%">
    <div class="container">
      <div class="top-btn">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :disabled="!id" @click="finish">选择</el-button>
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
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { mapState } from 'pinia/dist/pinia'
import zteStore from '@/store'
import { columnPath, defaultBreadcrumb } from '@/utils'
import { searchAssetTree, searchTree } from '@/api/api'

export default {
  name: 'SelectFolderDialog',
  props: {
    visible: {}
  },
  computed: {
    ...mapState(zteStore, ['breadcrumb'])
  },
  data () {
    return {
      loading: false,
      columnData: [],
      selectPath: [],
      id: '',
      columnPath,
      recursionData: []
    }
  },
  methods: {
    handleClose () {
      this.$emit('update:visible', false)
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
      const newCrumb = this.breadcrumb.length ? this.breadcrumb : defaultBreadcrumb
      const [flag] = newCrumb
      this.selectPath = [...newCrumb.map(e => e.id)]
      const { id } = flag
      try {
        this.loading = true
        const { results } = await searchAssetTree(id)
        this.recursionData = this.flat(results)
        const res = await Promise.all([...newCrumb.map(e => searchTree({ filePath: e.id }))])
        const arr = res.map(e => e.results)
        this.columnData = [...newCrumb.map((e, index) => index === 0 ? [{
          ...e,
          nodes: this.recursionData.find(l => l.path === e.id).nodes
        }] : [...arr[index - 1].filter(k => k.nodeType !== 'dam:Asset').map(e => ({
          ...e,
          id: e.path,
          title: e.properties ? e.properties['jcr:title'] : e.name,
          nodes: this.recursionData.find(l => l.path === e.path).nodes
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
          nodes: this.recursionData.find(l => l.path === e.path) ? this.recursionData.find(l => l.path === e.path).nodes : [],
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
    finish () {
      this.$emit('finish', this.id)
      this.handleClose()
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-dialog {
  margin-top: 5vh !important;
}

/deep/ .el-dialog__header {
  display: none;
}

/deep/ .el-dialog__body {
  padding: 0;
}

.container {
  height: 88vh;

  .top-btn {
    border-bottom: 0.0625rem solid #E1E1E1;
    height: 3.25rem;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    background-color: #fff;
    padding-right: 1rem;
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
}
</style>
