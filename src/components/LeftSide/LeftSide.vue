<template>
  <div class="left-side">
<!--    <div class="avatar"><img src="data:image/jpeg;base64,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"></div>-->
<!--    <span class="name">品牌数字内容管理平台</span>-->
<!--    <div class="container user-info">-->
<!--      <span>{{ assetRole ? '素材组管理员用户' : '素材组普通用户' }}</span>-->
<!--      <span @click="handleLoginOut">退出</span>-->
<!--    </div>-->
<!--    <div class="container">-->
<!--      <el-divider></el-divider>-->
<!--    </div>-->
<!--    <div class="container">素材推荐</div>-->
    <div class="container homepage"><span @click="showIndex">首页</span></div>
    <div class="container">数字内容管理</div>
    <div class="tree-container">
      <el-tree node-key="path" class="tree" :props="defaultProps" :data="treeData" @node-click="handleNodeClick"
               :default-expanded-keys="expandedKeys" :check-strictly="true"
               ref="tree">
          <span class="custom-tree-node" slot-scope="{ node }">
            <i class="el-icon-folder folder-icon"></i>
            <span>{{ node.label }}</span>
          </span>
      </el-tree>
    </div>
  </div>
</template>

<script>
import { getTree, loginOut } from '@/api/api'
import zteStore from '@/store'
import { mapActions, mapState } from 'pinia'
import { columnPath } from '@/utils'

export default {
  name: 'LeftSide',
  data () {
    return {
      defaultProps: {
        children: 'nodes',
        label: 'title'
      },
      baseUrl: columnPath
    }
  },
  computed: {
    ...mapState(zteStore, ['assetRole', 'breadcrumb', 'treeData', 'expandedKeys'])
  },
  methods: {
    ...mapActions(zteStore, ['setBreadcrumb', 'setSelected', 'getTreeData']),
    showIndex () {
      this.$emit('show-home')
    },
    async loadTree (node, resolve) {
      if (node.level === 0) {
        const { items } = await getTree(`${this.baseUrl}/content/dam`)
        const res = items.map(e => ({
          ...e,
          hasItems: !e.hasItems
        })).filter(e => e.title === '素材管理')
        this.breadcrumb.length === 0 && this.setBreadcrumb([{
          title: '素材管理',
          id: res[0].path
        }])
        return resolve(res)
      }
      if (node.level > 3) return resolve([])
      const { items } = await getTree(`${this.baseUrl}${node.data.path}`)
      return resolve(items.map(e => ({
        ...e,
        hasItems: !e.hasItems
      })).filter(e => e.icon === 'folder'))
    },
    handleNodeClick (data, e) {
      this.recursion(e)
      const { path } = this.$refs.tree.getCurrentNode()
      this.setSelected(path)
    },
    recursion (data) {
      const breadcrumb = []

      function recursionTree (e) {
        const { level } = e
        if (level === 1) {
          const {
            data: {
              id,
              title
            }
          } = e
          breadcrumb.push({
            id,
            title
          })
        } else {
          const {
            parent,
            data: {
              id,
              title
            }
          } = e
          breadcrumb.push({
            id,
            title
          })
          return recursionTree(parent)
        }
      }

      recursionTree(data)
      this.setBreadcrumb([...breadcrumb].reverse())
    },
    handleLoginOut () {
      this.$confirm('确定退出素材库', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await loginOut()
          sessionStorage.removeItem('assetRole')
          // window.location.href = '/apps/granite/core/content/login.html'
        } finally {
          location.reload()
        }
      })
    }
  },
  mounted () {
    this.getTreeData()
  }
}
</script>

<style scoped lang="scss">
.left-side {
  width: 100%;
  //min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 0 60px 0;
  box-sizing: border-box;
  background: #F7F8FA;

  .avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    cursor: pointer;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
    }
  }

  .name {
    margin: 16px 0;
    color: #222222;
    font-size: 18px;
  }

  .container {
    margin-bottom: 12px;
    width: 100%;
    padding: 0 22px;
    text-align: left;
    color: #666666;
    font-size: 16px;
    line-height: 24px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;

    /deep/ .el-divider--horizontal {
      margin: 0;
    }
  }

  .user-info {
    display: flex;
    justify-content: space-between;

    span:hover {
      cursor: pointer;
      color: #323232;
    }
  }

  .content {
    color: #222222;
    text-indent: 1em;
    cursor: pointer;
  }

  .homepage {
    margin-bottom: 20px;

    span {
      display: inline-block;
      width: 100%;
      font-size: 14px;
      line-height: 20px;
      color: #222222;
      position: relative;
      padding: 10px 10px 10px 34px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      cursor: pointer;

      &:before {
        content: '';
        display: inline-block;
        width: 21px;
        height: 20px;
        background: url("../../assets/home/left-home.png") no-repeat center;
        position: absolute;
        top: 50%;
        left: 10px;
        transform: translateY(-50%);
      }

      &:hover {
        background: #E8EBEE;
        border-radius: 8px;
      }
    }
  }

  .tree-container {
    display: flex;
    width: 100%;
    text-align: left;
    padding: 0 22px;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;

    > .el-tree {
      -webkit-box-flex: 0;
      -webkit-flex: 0 0 100%;
      -ms-flex: 0 0 100%;
      flex: 0 0 100%;
      max-width: 100%;
      margin-left: -16px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      background: #F7F8FA;

      .is-expanded {
        >.el-tree-node__content {
          .custom-tree-node {
            .folder-icon {
              background: url("../../assets/home/left-open.png") no-repeat center;
            }
          }

          .is-leaf + .custom-tree-node {
            .folder-icon {
              background: url("../../assets/home/left-close.png") no-repeat center;
            }
          }
        }

        >.el-tree-node__children {
          .el-tree-node__children {
            .is-current {
              .is-leaf + .custom-tree-node {
                .folder-icon {
                  background: url("../../assets/home/left-open.png") no-repeat center;
                }
              }
            }
          }
        }
      }
    }
  }

  .tree {
    color: #222222;
    text-indent: 0;
  }

  .custom-tree-node {
    position: relative;
    padding-left: 28px;

    .folder-icon {
      margin-right: 8px;
      width: 20px;
      height: 20px;
      background: url("../../assets/home/left-close.png") no-repeat center;
      position: absolute;
      top: 0;
      left:0;
      &:before {
        display: none;
      }
    }
  }

  /deep/ .el-tree-node__content {
    height: auto;
    padding: 10px 10px 10px 34px!important;
    -webkit-box-sizing: border-box;
    box-sizing: border-box;
    position: relative;

    &:hover {
      background: #E8EBEE;
      border-radius: 8px;
    }

    .el-tree-node__expand-icon {
      content: '';
      display: inline-block;
      padding: 0;
      width: 21px;
      height: 21px;
      background: url("../../assets/home/left-arrow.png") no-repeat center;
      background-size: cover;
      position: absolute;
      top: 50%;
      left: 10px;
      transform: translateY(-50%);

      &:before {
        display: none;
      }

      &.expanded {
        transform: translateY(-50%) rotate(90deg);
      }
    }

    .is-leaf {
      display: none;
    }
  }

  /deep/ .el-tree-node__children {
    padding-left: 22px;
  }

  /deep/ .el-tree__empty-text {
    color: #222222;
    width: 80px;
    position: relative;
    font-size: 14px;
    left: 0;
    top: 0;
  }

  /deep/ .el-tree {
    font-size: 14px;
  }
}
</style>
