<template>
  <el-dialog title="删除资产" :visible.sync="visible" class="delete-box" @close="handleClose"
             :modal-append-to-body="true" @open="handleOpen"
             :append-to-body="true">
    <div class="content">
      <div style="color: #222222">{{ deleteTitle }}</div>
      <p style="max-height: 180px;overflow: auto;color: #222222;" v-html="deleteContent"></p>
    </div>
    <div slot="footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleDelete" class="disassociation-btn" v-loading="loading">删 除</el-button>
    </div>
    <div style="display: none" v-html="errorData"></div>
  </el-dialog>
</template>

<script>
import { command } from '@/api/api'

export default {
  name: 'DeleteDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    list: {
      type: Array,
      default: () => ([])
    }
  },
  data () {
    return {
      loading: false,
      deleteTitle: '',
      deleteContent: '',
      errorData: ''
    }
  },
  methods: {
    handleClose () {
      this.$emit('update:visible', false)
    },
    async handleDelete () {
      try {
        this.loading = true
        const formData = new FormData()
        formData.append('cmd', 'deletePage')
        this.list.forEach(e => {
          formData.append('path', e.path)
        })
        await command(formData)
        this.dialogDeleteFolderVisible = false
        this.$message({
          message: '删除成功',
          type: 'success'
        })
        this.$emit('finish')
      } catch (e) {
        this.handleClose()
        this.$confirm('一个或多个项目处于被引用和/或已激活状态。', '强制删除', {
          type: 'error',
          confirmButtonText: '删除',
          confirmButtonClass: 'delete-asset-btn'
        }).then(async () => {
          const formData = new FormData()
          formData.append('cmd', 'deletePage')
          this.list.forEach(e => {
            formData.append('path', e.path)
          })
          formData.append('force', 'true')
          await command(formData)
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          this.$emit('finish')
        })
        // this.errorData = e
        // this.$nextTick(() => {
        //   const message = (document.getElementById('Message').innerHTML).split('。')[0]
        //   this.$message({
        //     message: `${message}`,
        //     type: 'error'
        //   })
        //   this.handleClose()
        // })
      } finally {
        this.loading = false
      }
    },
    handleOpen () {
      this.deleteTitle = this.list.length === 1 ? '您即将删除以下资产:' : `您即将删除以下 ${this.list.length} 个资产:`
      this.deleteContent = this.list.map((e, index) => index + 1 === length ? `${e.properties['jcr:title'] || e.name}` : `${e.properties['jcr:title'] || e.name}<br>`).join('')
    }
  }
}
</script>

<style lang="scss" scoped>
.delete-box {
  top: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2222 !important;

  /deep/ .el-dialog {
    margin: 0 !important;
    width: 430px !important;
    height: auto;
    background: #FFFFFF;
    border-radius: 32px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow: hidden;
    padding: 24px 32px;
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
      padding: 20px;
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
              background-color: rgb(220, 85, 75) !important;
              border-color: rgb(220, 85, 75) !important;
              color: #ffffff;

              &:hover {
                opacity: 0.5;
              }
            }

            &.is-disabled {
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

    /deep/ .el-form--label-top .el-form-item__label {
      padding: 0;
    }
  }
}
</style>
