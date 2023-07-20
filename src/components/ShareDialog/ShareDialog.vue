<template>
  <el-dialog title="分享链接" :visible.sync="visible" class="share-box" @close="handleClose"
             :modal-append-to-body="true" @open="handleOpen"
             :append-to-body="true">
    <div class="content">
      <template v-if="shareData && shareData.nodeType">
        <template v-if="shareData.nodeType === 'dam:Asset'">
          <div v-if="shareData && shareData.path">
            <img class="share-img" alt=""
                 :src="`${baseUrl}${shareData.metadata&&'dc:coverImage' in shareData.metadata && shareData.metadata['dc:coverImage']?shareData.metadata['dc:coverImage']: shareData.path}`"/>
            <div class="share-name">{{
                shareData.metadata && 'dc:title' in shareData.metadata ? shareData.metadata['dc:title'] : shareData.name
              }}
            </div>
          </div>
        </template>
        <template v-else>
          <div class="share-folder">
            <div>{{ shareData.properties['jcr:title'] }}</div>
            <img v-if="shareData.renditions && shareData.renditions.folder" class="folder-img"
                 :src="`${baseUrl}${shareData.renditions.folder}`"
                 alt=""/>
          </div>
        </template>
      </template>
      <div class="title" style="margin-top: 20px">开放截至时间</div>
      <div class="row">
        <el-date-picker
          style="flex: 1;"
          :value-format="dateValueFormat"
          prefix-icon="el-icon-date"
          align="center"
          v-model="sharingExpiredTime"
          :picker-options="pickerOptions"
          type="datetime"
          placeholder="选择开放截至时间">
        </el-date-picker>
        <div :class="['btn',url?'disabled-btn':'']" @click="handleBuild">生成链接</div>
      </div>
      <div class="title" style="margin-top: 18px">资产链接</div>
      <div class="row">
        <el-input style="flex: 1;" readonly v-model="url"/>
        <div :class="['btn','btn-text',url?'':'disabled-btn-text']" @click="handleCopy">复制链接</div>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import { share } from '@/api/api'
import { baseUrl } from '@/utils'

export default {
  name: 'ShareDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    shareData: {
      type: Object,
      default: () => ({})
    }
  },
  data () {
    return {
      baseUrl,
      url: '',
      loading: false,
      dateValueFormat: 'yyyy-MM-dd HH:mm:ss',
      sharingExpiredTime: '',
      pickerOptions: {
        disabledDate (time) {
          return time.getTime() < Date.now() - (24 * 3600 * 1000)
        }
      }
    }
  },
  methods: {
    handleClose () {
      this.url = ''
      this.sharingExpiredTime = ''
      this.$emit('update:visible', false)
    },
    handleOpen () {
      console.log(this.shareData)
    },
    async handleBuild () {
      if (this.sharingExpiredTime && new Date().getTime() > new Date(this.sharingExpiredTime).getTime()) {
        this.$message.error('开放截至时间不能早于当前时间')
      } else {
        const formData = new FormData()
        formData.append('filePath', this.shareData.path)
        formData.append('sharingExpiredTime', this.sharingExpiredTime || '2999-01-01 00:00:00')
        const {
          status,
          success,
          results,
          errorMessage
        } = await share(formData)
        if (status === 200 && success) {
          this.$message.success('生成链接成功，请点击下方复制链接按钮进行分享')
          const flag = window.location.pathname.replace('.html', '')
          this.url = `${window.location.origin}${flag}/share.html#/${results}`
        } else {
          this.$message.error(`生成链接失败，${errorMessage}`)
        }
      }
    },
    async handleCopy () {
      if (this.url) {
        await navigator.clipboard.writeText(this.url)
        this.$message.success('复制成功')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.share-box {
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

      .content {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;

        .share-folder {
          width: 212px;
          background: #F2F3F5;
          border-radius: 16px;
          padding: 10px;
          font-weight: 500;
          color: #666666;
          font-size: 12px;
          box-sizing: border-box;
          display: flex;
          flex-direction: column-reverse;

          .folder-img {
            height: 100px;
            width: 192px;
            border-radius: 8px;
            margin-bottom: 4px;
          }
        }

        .share-img {
          width: 242px;
          height: 160px;
          border-radius: 8px;
        }

        .share-name {
          margin-top: 12px;
          text-align: center;
          font-weight: 400;
          color: #3D3D3D;
          font-size: 14px;
        }

        .title {
          font-size: 16px;
          font-weight: 400;
          color: #3D3D3D;
          align-self: baseline;
          margin-bottom: 12px;
        }

        .row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;

          .btn {
            margin-left: 12px;
            padding: 6px 12px;
            color: #FFFFFF;
            font-size: 14px;
            font-weight: 400;
            background: #008ED3;
            border-radius: 16px;
            cursor: pointer;
          }

          .btn-text {
            background: #FFFFFF;
            color: #008ED3;
          }

          .disabled-btn {
            background: #DDDDDD;
            color: #FFFFFF;
            cursor: not-allowed;
          }

          .disabled-btn-text {
            color: #999999;
            cursor: not-allowed;
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

/deep/ .el-input__inner {
  border-radius: 8px;
}
</style>
