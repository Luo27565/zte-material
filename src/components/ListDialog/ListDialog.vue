<template>
  <el-dialog :visible="visible" :show-close="false" :title="title" @close="handleClose" :modal-append-to-body="true"
             :append-to-body="true" width="320px">
    <div class="content">
      <div class="item">
        <div class="img">
          <el-image :src="`${baseUrl}${relatedFilePath}`"
                    :preview-src-list="[`${baseUrl}${relatedFilePath}`]">
            <div slot="error" class="image-slot">
              <i class="el-icon-document" style="font-size: 24px"></i>
            </div>
          </el-image>
        </div>
        <div class="name">{{ name }}</div>
      </div>
    </div>
    <div slot="footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleRelate" :loading="loading">取消关联</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { baseUrl } from '@/utils'
import { assetEdit, unrelatedAsset } from '@/api/api'

export default {
  name: 'ListDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '删除关系'
    },
    filePath: {
      type: String,
      default: ''
    },
    name: {
      type: String,
      default: ''
    },
    relatedFilePath: {
      type: String,
      default: ''
    },
    editByAEM: {
      type: Boolean,
      default: false
    },
    detailData: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      baseUrl,
      loading: false
    }
  },
  methods: {
    handleClose () {
      this.$emit('update:visible', false)
    },
    async handleRelate () {
      if (this.editByAEM) {
        const formData = new FormData()
        formData.append('filePath', this.filePath)
        formData.append('relatedFilePath', this.relatedFilePath)
        this.loading = true
        try {
          const {
            success,
            status
          } = await unrelatedAsset(formData)
          if (success && status === 200) {
            this.$message({
              message: '取消关联成功',
              type: 'success'
            })
            this.$emit('finish')
            this.handleClose()
          } else {
            this.$message.error('取消关联失败')
          }
        } finally {
          this.loading = false
        }
      } else {
        this.loading = true
        const flag = { ...this.detailData }
        flag.metadata['dc:downloadManagement'] = ''
        try {
          const {
            status,
            success
          } = await assetEdit({ ...flag })
          if (success && status === 200) {
            this.$message({
              message: '取消关联成功',
              type: 'success'
            })
            this.$emit('finish')
            this.handleClose()
          } else {
            this.$message.error('取消关联失败')
          }
        } finally {
          this.loading = false
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-dialog {
  display: flex;
  flex-direction: column;
  margin: 0 !important;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-height: calc(100% - 30px);
  max-width: calc(100% - 30px);

  /deep/ .el-dialog .el-dialog__body {
    flex: 1;
    overflow: auto;
  }
}

.content {
  .item {
    display: flex;
    align-items: center;

    .img {
      width: 3rem;
      height: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .name {
      padding: 0 .625rem;
    }
  }
}
</style>
