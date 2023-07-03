<template>
  <el-dialog :visible="visible" :show-close="false" :title="title" @close="handleClose" :modal-append-to-body="true"
             :append-to-body="true" width="320px" class="disassociation-box">
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
      <el-button type="primary" @click="handleRelate" class="disassociation-btn" :loading="loading">取消关联</el-button>
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
.disassociation-box {
  top: 0;
  background: rgba(0,0,0,0.5);
  z-index: 2222!important;

  /deep/ .el-dialog {
    margin: 0 !important;
    width: 430px!important;
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

    .el-dialog__header {
      padding: 0 24px 0 0;
      .el-dialog__title {
        font-size: 24px;
        color: #3D3D3D;
        line-height: 34px;
        font-weight: 700;
      }
    }

    .el-dialog__body {
      padding: 0;
      .content {
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
    }

    .el-dialog__footer {
      padding: 20px 0 0 0;
      > div {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-right: 24px;

        .el-button {
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
          &.disassociation-btn {
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
