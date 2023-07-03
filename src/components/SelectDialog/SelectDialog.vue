<template>
  <el-dialog :visible="visible" @close="handleClose" :modal-append-to-body="true" :append-to-body="true"
             :show-close="false" @open="init" width="75%">
    <div class="container">
      <div class="top-btn">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :disabled="btnDisable" @click="handleRelate">选择</el-button>
      </div>
      <div class="tab-content">
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item class="tab-item" v-for="(item,index) in tab" :key="item.id"
                              @click.native="clickTab(item.id,index)">{{ item.title }}
          </el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div class="content">
        <el-table
          ref="table"
          v-loading="loading"
          :row-style="{height:'48px'}"
          height="100%"
          @selection-change="handleSelectChange"
          @cell-click="handleTableCellClick"
          :data="mainData">
          <el-table-column
            type="selection"
            align="center"
            :selectable="selectable"
            width="36">
          </el-table-column>
          <el-table-column width="56" align="center">
            <template slot-scope="scope">
              <div class="first-column" @click.stop>
                <i v-if="scope.row.nodeType!=='dam:Asset'" class="el-icon-folder"/>
                <template v-else>
                  <el-image v-if="scope.row.renditions" :src="`${baseUrl}${scope.row.renditions.list}`"
                            :preview-src-list="[`${baseUrl}${scope.row.renditions.detail}`]">
                    <div slot="error" class="image-slot">
                      <i class="el-icon-document"></i>
                    </div>
                  </el-image>
                </template>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="name"
            label="名称">
          </el-table-column>
          <el-table-column
            width="240"
            label="标题">
            <template slot-scope="scope">
              <span v-if="scope.row.metadata">{{ scope.row.metadata['jcr:title'] }}</span>
              <span v-else>{{ scope.row.properties ? scope.row.properties['jcr:title'] : '' }}</span>
            </template>
          </el-table-column>
          <el-table-column
            width="120"
            label="类型">
            <template slot-scope="scope">
              <template v-if="scope.row.metadata">
                <span>{{ scope.row.metadata['dc:format'] | formatType }}</span>
              </template>
              <template v-else>
                <span v-if="scope.row.nodeType!=='dam:Asset'">文件夹</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column
            width="120"
            label="大小">
            <template slot-scope="scope">
              <template v-if="scope.row.metadata">
                <span>{{ scope.row.metadata['dam:size'] | formatSize }}</span>
              </template>
            </template>
          </el-table-column>
          <el-table-column
            width="160"
            label="尺寸">
            <template slot-scope="scope">
              <template v-if="scope.row.metadata">
                  <span v-if="scope.row.metadata['tiff:ImageWidth']&&scope.row.metadata['tiff:ImageLength']">
                    {{ `${scope.row.metadata['tiff:ImageWidth']} x ${scope.row.metadata['tiff:ImageLength']}` }}
                  </span>
              </template>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { baseUrl, defaultBreadcrumb } from '@/utils'
import zteStore from '@/store'
import { mapState } from 'pinia'
import { assetEdit, folderTree, relateAsset } from '@/api/api'

export default {
  name: 'SelectDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    path: {
      type: String,
      default: ''
    },
    detailData: {
      type: Object,
      default: () => ({})
    },
    editByAEM: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState(zteStore, ['breadcrumb'])
  },
  data () {
    return {
      tab: [],
      mainData: [],
      loading: false,
      baseUrl,
      btnDisable: true
    }
  },
  methods: {
    init () {
      const [first] = this.breadcrumb.length ? this.breadcrumb : defaultBreadcrumb
      this.tab = [first]
      const { id } = first
      this.getList(id)
    },
    handleClose () {
      this.$emit('update:visible', false)
    },
    clickTab (id, index) {
      if (index + 1 === this.tab.length) return
      this.tab = [...this.tab.filter((_, idx) => idx <= index)]
      this.getList(id)
    },
    async getList (val) {
      this.loading = true
      try {
        const { results } = await folderTree(val)
        this.mainData = results
      } finally {
        this.loading = false
      }
    },
    selectable (row) {
      return row.nodeType === 'dam:Asset' && row.path !== this.path
    },
    handleSelectChange (val) {
      this.btnDisable = val.length !== 1
      if (val.length > 1) {
        this.$refs.table.clearSelection()
        this.$refs.table.toggleRowSelection(val.pop())
      }
    },
    handleTableCellClick (row) {
      const {
        assetId,
        properties,
        nodeType,
        path,
        name
      } = row
      if (nodeType !== 'dam:Asset') {
        this.tab = [...this.tab, {
          id: assetId,
          title: properties['jcr:title'] || name
        }]
        this.getList(path)
      }
    },
    async handleRelate () {
      this.loading = true
      const [{
        path,
        assetId
      }] = this.$refs.table.selection
      if (this.editByAEM) {
        const formData = new FormData()
        formData.append('filePath', this.path)
        formData.append('relatedFilePath', path)
        const {
          success,
          status
        } = await relateAsset(formData)
        if (success && status === 200) {
          this.$message({
            message: '相关成功',
            type: 'success'
          })
          this.$emit('finish')
          this.handleClose()
        } else {
          this.$message.error('相关失败')
        }
      } else {
        const flag = { ...this.detailData }
        flag.metadata['dc:downloadManagement'] = assetId
        const {
          status,
          success
        } = await assetEdit({ ...flag })
        if (success && status === 200) {
          this.$message({
            message: '相关成功',
            type: 'success'
          })
          this.$emit('finish')
          this.handleClose()
        } else {
          this.$message.error('相关失败')
        }
      }
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

/deep/ .el-table__header-wrapper .el-checkbox {
  display: none;
}

/deep/ .el-table tbody tr:hover > td {
  cursor: pointer;
  background-color: rgb(237, 237, 237);
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

  .tab-content {
    padding: 0 1rem;
    border-bottom: 0.0625rem solid #E1E1E1;
    height: 3rem;
    background-color: #F0F0F0;
    display: flex;
    align-items: center;
    justify-content: center;

    .tab-item {
      /deep/ .el-breadcrumb__inner {
        cursor: pointer;
        font-weight: 700;
        font-size: 1.125rem;
        color: #6d6d6d;
      }
    }

    .tab-item:not(:last-child) :hover {
      color: #323232;
    }
  }

  .content {
    padding: 0 1rem 1rem 1rem;
    height: 88%;
    box-sizing: border-box;
  }
}

</style>
