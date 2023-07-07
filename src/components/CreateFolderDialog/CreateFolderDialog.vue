<template>
  <el-dialog title="创建文件夹" :visible.sync="visible" class="folder-box" @close="handleClose"
             :modal-append-to-body="true"
             :append-to-body="true">
    <el-form label-position="top" label-width="80px" :model="form" :rules="rules" ref="form">
      <el-form-item label="标题" prop="folderTitle">
        <el-input v-model="form.folderTitle" @input="handleFolderName"></el-input>
      </el-form-item>
      <el-form-item label="路径名称" prop="folderName">
        <el-tooltip :value="showPopover" :manual="true" popper-class="my-popper">
          <div slot="content">资源已存在</div>
          <el-input v-model="form.folderName" placeholder="请输入字母、数字、符号等组成"></el-input>
        </el-tooltip>
      </el-form-item>
      <el-form-item label="排序">
        <el-date-picker
          style="width: 100%;"
          v-model="form.sort"
          type="datetime"
          :value-format="dateValueFormat"
          default-time="00:00:00">
        </el-date-picker>
      </el-form-item>
      <el-form-item>
        <template slot="label">
          <span>文件夹权限</span>
          <el-tooltip style="margin-left: 12px;" effect="light"
                      content="不公开则表示该文件夹只有管理员可见，普通用户必须通过管理员分享链接查询" placement="top">
            <i style="font-size: 16px;" class="el-icon-question"/>
          </el-tooltip>
        </template>
        <el-radio-group v-model="form.permission">
          <el-radio label="public">公开</el-radio>
          <el-radio label="private">不公开</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleSubmit" class="disassociation-btn" :loading="loading">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { createFolderByAem, folderPermission, getJSON } from '@/api/api'
import dayjs from 'dayjs'

const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone')

dayjs.extend(utc)
dayjs.extend(timezone)

export default {
  name: 'CreateFolderDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    path: {
      type: String,
      default: ''
    }
  },
  watch: {
    'form.folderName': {
      handler (newVal) {
        const regex = /[/%\\:*?"[\]|.#{}^;+ ]/g
        regex.test(newVal) && (this.form.folderName = this.form.folderName.replace(regex, ''))
      },
      deep: true
    }
  },
  data () {
    const validatorTitle = (rule, value, callback) => {
      const chineseRegex = /[\u4e00-\u9fa5]/
      if (value === '' || chineseRegex.test(value)) {
        callback(new Error('请输入字母、数字、符号等组成'))
      } else {
        callback()
      }
    }
    return {
      dateValueFormat: 'yyyy-MM-dd HH:mm:ss',
      form: {
        folderName: '',
        folderTitle: '',
        sort: '',
        permission: 'public'
      },
      rules: {
        folderTitle: [{
          required: true,
          message: '请输入标题',
          trigger: 'blur'
        }],
        folderName: [{
          validator: validatorTitle,
          trigger: 'blur'
        }]
      },
      showPopover: false,
      loading: false
    }
  },
  methods: {
    handleClose () {
      this.showPopover = false
      const flag = {
        folderName: '',
        folderTitle: '',
        sort: '',
        permission: 'public'
      }
      this.form = { ...flag }
      this.$emit('update:visible', false)
    },
    handleFolderName () {
      this.form.folderName = this.form.folderTitle
    },
    handleSubmit () {
      this.$refs.form.validate(async valid => {
        if (valid) {
          const data = await getJSON(this.path)
          if (Object.keys(data).some(e => e === this.form.folderName)) {
            this.showPopover = true
            return
          }
          this.showPopover = false
          const formData = new FormData()
          formData.append('./jcr:content/jcr:title', this.form.folderTitle)
          formData.append(':name', this.form.folderName)
          formData.append('./jcr:primaryType', 'sling:Folder')
          formData.append('./jcr:content/jcr:primaryType', 'nt:unstructured')
          formData.append('_charset_', 'UTF-8')
          formData.append('./jcr:content/folderMetadataSchema', '')
          formData.append('./jcr:content/dc:sort', this.form.sort ? dayjs(this.form.sort).format() : dayjs().format())
          formData.append('./jcr:content/dc:sort@TypeHint', 'Date')
          const res = await createFolderByAem(`${this.path}/${this.form.folderName}`, formData)
          if (res['status.code'] === 200 || res['status.code'] === 201) {
            const formData = new FormData()
            formData.append('filePath', `${this.path}/${this.form.folderName}`)
            formData.append('permission', this.form.permission)
            const status = await folderPermission(formData)
            if (status.status === 200 && status.success) {
              this.$message({
                message: '创建成功',
                type: 'success'
              })
            } else {
              this.$message({
                message: status.errorMessage,
                type: 'warning'
              })
            }
            this.$emit('finish')
          } else {
            this.$message({
              message: res['status.message'],
              type: 'error'
            })
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.folder-box {
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
