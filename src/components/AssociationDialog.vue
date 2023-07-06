<template>
  <el-dialog title="下载关联" :visible.sync="visible" class="association-box" @close="handleClose"
             :modal-append-to-body="true"
             :append-to-body="true">
    <el-form label-position="top" label-width="80px" :model="form" :rules="rules" ref="form">
      <el-form-item label="展示名称" prop="relatedFileName">
        <el-input v-model="form.relatedFileName"></el-input>
      </el-form-item>
      <el-form-item label="关联资产路径" prop="relatedFilePath">
        <div @click="handleShow">
          <el-input v-model="form.relatedFilePath" disabled suffix-icon="el-icon-folder"></el-input>
        </div>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" class="disassociation-btn" :loading="loading">确 定</el-button>
    </div>

    <select-dialog :visible.sync="visibleSelect" :is-get-data="true" @finishSelect="handlePath"
                   :path="this.$route.query.path"/>
  </el-dialog>
</template>

<script>
import SelectDialog from '@/components/SelectDialog/SelectDialog'
import { relateAsset } from '@/api/api'

export default {
  name: 'AssociationDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  components: {
    SelectDialog
  },
  data () {
    return {
      form: {
        relatedFileName: '',
        relatedFilePath: ''
      },
      loading: false,
      visibleSelect: false,
      rules: {
        relatedFileName: [
          {
            required: true,
            message: '请输入展示名称',
            trigger: 'blur'
          }
        ],
        relatedFilePath: [
          {
            required: true,
            message: '请选择关联资产路径',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    handleClose () {
      this.form.relatedFileName = ''
      this.form.relatedFilePath = ''
      this.$emit('update:visible', false)
    },
    handleShow () {
      this.visibleSelect = true
    },
    handleSubmit () {
      this.$refs.form.validate(async valid => {
        if (valid) {
          const formData = new FormData()
          formData.append('filePath', this.$route.query.path)
          formData.append('relatedFileName', this.form.relatedFileName)
          formData.append('relatedFilePath', this.form.relatedFilePath)
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
        }
      })
    },
    handlePath ({
      path,
      name
    }) {
      !this.form.relatedFileName && (this.form.relatedFileName = name)
      this.form.relatedFilePath = path
      this.visibleSelect = false
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-input__suffix-inner {
  font-size: 18px;
}

/deep/ .el-input.is-disabled .el-input__inner {
  cursor: pointer;
}

/deep/ .el-input.is-disabled .el-input__icon {
  cursor: pointer;
}

.association-box {
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
              border: 1px solid #008ED3;
              background: #008ED3;
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
