<template>
  <el-drawer :title="title" @open="init" :visible="drawer" :with-header="withHeader" :modal-append-to-body="false"
             :append-to-body="true"
             :direction="direction" :size="size" class="move-box">
    <div class="move-box-cnt">
      <div class="move-box-title">移动到</div>
      <div class="icon-close" @click="closeDrawer"></div>
      <el-breadcrumb separator-class="el-icon-arrow-right" class="bread-crumb move-box-bread">
        <el-breadcrumb-item class="bread-crumb-item" v-for="(column,index) in columnData"
                            :key="column.id">
          <div v-for="item in column" :key="item.id"
               :class="{'item':true,'choose-item':item.id===id||selectPath.some(e=>e===item.id),'no-nodes':item.nodes.length === 0}"
               @click.stop="setBreadPath(item.id, index, item.nodes.length)">
            <div :class="[item.nodes.length?'item-content':'item-content-text']">{{ item.title || item.name }}</div>
          </div>
        </el-breadcrumb-item>
      </el-breadcrumb>
      <div class="column-content" v-loading="loading" element-loading-text="加载中">
        <div class="column-item" @click="handleNext(index)" v-for="(column,index) in columnData" :key="index">
          <div v-for="item in column" :key="item.id" :class="{'item':true,'choose-item':item.id===id||selectPath.some(e=>e===item.id)}">
            <div :class="[item.id===id?'is-choose':'icon-folder']" @click.stop="chooseFolder(item.id,index)">
              <i class="el-icon-folder"/>
            </div>
            <div :class="[item.nodes.length?'item-content':'item-content-text']" @click.stop="setPath(item.id, index, item.nodes.length)">{{ item.title || item.name }}</div>
          </div>
        </div>
<!--        <div v-if="showFolderInfo&&info" class="column-item">-->
<!--          <div class="info-item">-->
<!--            <div class="info-img">-->
<!--              <img :src="`${baseUrl}${info.path}.folderthumbnail.jpg`"/>-->
<!--            </div>-->
<!--            <template v-if="info.title">-->
<!--              <div class="info-label">标题</div>-->
<!--              <div class="info-value">{{ info.title }}</div>-->
<!--            </template>-->
<!--            <template v-if="info.name">-->
<!--              <div class="info-label">名称</div>-->
<!--              <div class="info-value">{{ info.name }}</div>-->
<!--            </template>-->
<!--          </div>-->
<!--        </div>-->
      </div>
      <div class="drawer-top">
        <!--      <span>{{ titleText }}资产</span>-->
        <div>
          <el-button @click="closeDrawer" class="drawer-close">取消</el-button>
          <el-button type="primary" class="drawer-move" :disabled="disabled" @click="finish">{{ titleText }}</el-button>
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
        move: '确定',
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
      recursionData: [],
      defaultProps: {
        children: 'nodes',
        label: 'title'
      }
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
        console.info(this.columnData)
      } finally {
        this.loading = false
      }
      window.addEventListener('load', this.hideNode(), this.noColor())
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
      const breadItem = document.querySelectorAll('.move-box-bread .bread-crumb-item')
      breadItem[index].style.display = 'none'
    },
    async setPath (id, index, child) {
      this.id = ''
      this.selectPath = [...this.selectPath.filter((_, idx) => idx < index), id]
      const breadItem = document.querySelectorAll('.move-box-bread .bread-crumb-item')
      breadItem[index].style.display = 'block'
      const columnItem = document.querySelectorAll('.column-content .column-item')
      columnItem[index].style.display = 'none'
      this.noColor()
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
    async setBreadPath (id, index, child) {
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
      const columnItem = document.querySelectorAll('.column-content .column-item')
      columnItem[index + 1].style.display = 'block'
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
    },
    hideNode () {
      setTimeout(function () {
        const columnItem = document.querySelectorAll('.column-content .column-item')
        for (let i = 0; i < columnItem.length; i++) {
          const child = columnItem[i].children
          for (let j = 0; j < child.length; j++) {
            if (child[j].className.indexOf('choose-item') > -1) {
              child[j].parentElement.style.display = 'none'
            }
          }
        }
      }, 50)
    },
    noColor () {
      setTimeout(function () {
        const breadChildItem = document.querySelectorAll('.move-box-bread .bread-crumb-item .el-breadcrumb__inner')
        for (let i = 0; i < breadChildItem.length; i++) {
          const child = breadChildItem[i].children
          for (let j = 0; j < child.length; j++) {
            if (child[j].className.indexOf('choose-item') > -1 && child[j].className.indexOf('no-nodes') > -1) {
              child[j].parentElement.parentElement.previousSibling.className += ' no-color'
            }
          }
        }
      }, 50)
    }
  }
}
</script>

<style lang="scss" scoped>
.move-box {
  top: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2222!important;

  /deep/ .el-drawer {
    background: transparent;
  }

  .move-box-cnt {
    width: 430px;
    height: auto;
    background: #FFFFFF;
    border-radius: 32px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%,-50%);
    overflow: hidden;
    padding: 24px 8px 24px 32px;
    box-sizing: border-box;

    .move-box-title {
      font-size: 24px;
      color: #3D3D3D;
      line-height: 34px;
      font-weight: 700;
      padding-right: 24px;
    }

    .icon-close {
      width: 38px;
      height: 38px;
      background: url("../../assets/home/drow-close.png") no-repeat center;
      cursor: pointer;
      position: absolute;
      top: 21px;
      right: 25px;
    }

    .bread-crumb {
      padding-top: 20px;
      .bread-crumb-item {
        display: flex;
        align-items: center;
        flex-direction: row-reverse;
        .el-breadcrumb__inner {
          .item {
            display: none;
            &.choose-item {
              display: block;
              position: relative;
              padding-left: 20px;
              cursor: pointer;
              &:before {
                content: '';
                display: inline-block;
                width: 14px;
                height: 20px;
                background: url("../../assets/home/bread-arrow.png") no-repeat center;
                position: absolute;
                top: 50%;
                left: 3px;
                transform: translateY(-50%);
              }
              .item-content {
                font-size: 12px;
                color: #999999;
                line-height: 20px;
                -webkit-transition: .3s ease-out;
                transition: .3s ease-out;

                &:hover {
                  color: #66b1ff;
                }
              }
              .item-content-text {
                font-size: 12px;
                color: #999999;
                line-height: 20px;
                -webkit-transition: .3s ease-out;
                transition: .3s ease-out;

                &:hover {
                  color: #66b1ff;
                }
              }
            }
          }
        }

        /deep/ .el-breadcrumb__separator {
          display: none;
        }

        &:first-child {
          .el-breadcrumb__inner {
            .item {
              &.choose-item {
                padding-left: 0;
                &:before {
                  display: none;
                }
              }
            }
          }
        }

        &:nth-last-child(2) {
          .el-breadcrumb__inner {
            .item {
              &.choose-item {
                .item-content {
                  color: #222222;
                  font-weight: 700;
                }
                .item-content-text {
                  color: #222222;
                  font-weight: 700;
                }
              }
            }
          }
        }
        &:nth-last-child(1) {
          .el-breadcrumb__inner {
            .item {
              &.no-nodes {
                .item-content {
                  color: #222222;
                  font-weight: 700;
                }
                .item-content-text {
                  color: #222222;
                  font-weight: 700;
                }
              }
            }
          }
        }
        &.no-color {
          .el-breadcrumb__inner {
            .item {
              &.choose-item {
                .item-content {
                  color: #999999;
                  font-weight: 400;
                }
                .item-content-text {
                  color: #999999;
                  font-weight: 400;
                }
              }
            }
          }
        }
      }
    }

    .column-content {
      display: flex;
      height: 312px;
      overflow-x: hidden;
      overflow-y: auto;
      white-space: nowrap;
      outline: none;
      margin-top: 20px;
      padding-right: 24px;
      flex-direction: column;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: #E2E2E2;
        border-radius: 5px;
      }

      .column-item {
        display: block;
        width: 100%;

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
        .item {
          display: block;
          position: relative;
          cursor: pointer;
          padding: 8px 0;
          text-decoration: none;
          white-space: nowrap;
          overflow: hidden;
          -o-text-overflow: ellipsis;
          text-overflow: ellipsis;
          -webkit-transition: .3s ease-out;
          transition: .3s ease-out;

          .icon-folder {
            display: block;
            position: relative;
            float: left;
            width: 20px;
            height: 20px;
            text-align: center;
            margin-right: 14px;
            line-height: 0;

            .el-icon-folder {
              width: 20px;
              height: 20px;
              background: url("../../assets/home/left-close.png") no-repeat center;

              &:before {
                display: none;
              }
            }
          }

          .is-choose {
            background-color: rgba(50, 110, 200, 0.75);
            display: block;
            position: relative;
            float: left;
            width: 20px;
            height: 20px;
            text-align: center;
            margin-right: 14px;
          }

          .is-choose i::after {
            content: '';
            background-image: url('data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjExNTJweCIgaGVpZ2h0PSIxMTUycHgiIHZpZXdCb3g9IjAgMCAxMTUyIDExNTIiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDExNTIgMTE1MiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGQ9Ik01NzYsMEMyNTcuOSwwLDAsMjU3LjksMCw1NzZzMjU3LjksNTc2LDU3Niw1NzZzNTc2LTI1Ny45LDU3Ni01NzZTODk0LjEsMCw1NzYsMHogTTQzOSw5MTlMMjA5LDY4OQoJYy05LjQtOS40LTkuNC0yNC42LDAtMzMuOUwyOTUsNTY5YzkuNC05LjQsMjQuNi05LjQsMzMuOSwwbDEyNywxMjdsMzkxLTM5MWM5LjQtOS40LDI0LjYtOS40LDMzLjksMEw5NjcsMzkxCgljOS40LDkuNCw5LjQsMjQuNiwwLDMzLjlMNDczLDkxOUM0NjMuNiw5MjguNCw0NDguNCw5MjguNCw0MzksOTE5eiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=');
            -webkit-background-size: 50%;
            -moz-background-size: 50%;
            background-size: 50%;
            background-position: 50% 50%;
            background-repeat: no-repeat;
            position: absolute;
            top: 0;
            right: 0;
            left: 0;
            height: 20px;
          }

          .item-content {
            display: block;
            padding-left: 0;
            white-space: nowrap;
            overflow: hidden;
            -o-text-overflow: ellipsis;
            text-overflow: ellipsis;
            font-weight: normal;
            font-style: normal;
            height: 20px;
            line-height: 20px;
            font-size: 16px;
            color: #222222;
          }

          .item-content-text {
            display: block;
            padding-left: 0;
            font-size: 16px;
            color: #222222;
            height: 20px;
            line-height: 20px;
            white-space: nowrap;
            overflow: hidden;
            -o-text-overflow: ellipsis;
            text-overflow: ellipsis;
            font-weight: normal;
            font-style: normal;
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
          background-color: #ECFAFF;
        }

        .is-choose i,
        .icon-folder:hover i {
          color: #FFFFFF;
        }

        .icon-folder:hover::after {
          content: '';
          background-image: url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjExNTJweCIgaGVpZ2h0PSIxMTUycHgiIHZpZXdCb3g9IjAgMCAxMTUyIDExNTIiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDExNTIgMTE1MiIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+CjxwYXRoIGQ9Ik01NzYsMEMyNTcuOSwwLDAsMjU3LjksMCw1NzZzMjU3LjksNTc2LDU3Niw1NzZzNTc2LTI1Ny45LDU3Ni01NzZTODk0LjEsMCw1NzYsMHogTTQzOSw5MTlMMjA5LDY4OQoJYy05LjQtOS40LTkuNC0yNC42LDAtMzMuOUwyOTUsNTY5YzkuNC05LjQsMjQuNi05LjQsMzMuOSwwbDEyNywxMjdsMzkxLTM5MWM5LjQtOS40LDI0LjYtOS40LDMzLjksMEw5NjcsMzkxCgljOS40LDkuNCw5LjQsMjQuNiwwLDMzLjlMNDczLDkxOUM0NjMuNiw5MjguNCw0NDguNCw5MjguNCw0MzksOTE5eiIgZmlsbD0iI2ZmZiIvPgo8L3N2Zz4=);
          -webkit-background-size: 50%;
          -moz-background-size: 50%;
          background-size: 50%;
          background-position: 50% 50%;
          background-repeat: no-repeat;
          position: absolute;
          top: 0;
          right: 0;
          left: 0;
          height: 20px;
        }
      }
    }

    .drawer-top {
      padding-top: 20px;
      > div {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-right: 24px;

        /deep/ .el-button {
          padding: 0;
          margin: 0 8px;
          border: 0;
          background: transparent;
          span {
            min-width: 80px;
            display: inline-block;
            height: 32px;
            border-radius: 16px;
            border: 1px solid #979797;
            box-sizing: border-box;
            transition: .3s ease-out;
            font-size: 14px;
            color: #666666;
            line-height: 32px;
            padding: 0 24px;

            &:hover {
              background: #ECFAFF;
              color: #000000;
              border-color: #ECFAFF;
            }
          }
          &.drawer-move {
            span {
              border: 1px solid #008ED3;
              background: #008ED3;
              color: #ffffff;
              &:hover {
                opacity: 0.5;
              }
            }
            &.is-disabled{
              span {
                &:hover {
                  opacity: 1;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
