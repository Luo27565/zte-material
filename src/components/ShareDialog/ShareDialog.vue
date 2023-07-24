<template>
  <el-dialog title="分享链接" :visible.sync="visible" class="share-box" @close="handleClose"
             :modal-append-to-body="true" @open="handleOpen" :destroy-on-close="true"
             :append-to-body="true">
    <div class="content" v-if="visible">
      <template v-if="shareData && shareData.nodeType">
        <template v-if="shareData.nodeType === 'dam:Asset'">
          <div v-if="shareData && shareData.path" style="display: flex;flex-direction: column;align-items: center;">
            <img class="share-img" alt="" v-if="fileShowType(shareData.metadata['dc:format'])==='image'"
                 :src="`${baseUrl}${shareData.path}`"/>
            <img alt="" v-if="fileShowType(shareData.metadata['dc:format'])==='file'"
                 :src="fileIcon"/>
            <img alt="" v-if="fileShowType(shareData.metadata['dc:format'])==='video'"
                 :src="videoIcon"/>
            <img class="share-img" alt="" v-if="fileShowType(shareData.metadata['dc:format'])==='music'"
                 :src="`${baseUrl}${shareData.metadata['dc:coverImage']}`" @error="handleError('music',$event)"/>
            <img class="share-img" alt="" v-if="fileShowType(shareData.metadata['dc:format'])==='font'"
                 :src="`${baseUrl}${shareData.metadata['dc:coverImage']}`" @error="handleError('font',$event)"/>
            <div class="share-name">{{
                shareData.metadata && 'dc:title' in shareData.metadata ? shareData.metadata['dc:title'] || shareData.name : shareData.name
              }}
            </div>
          </div>
        </template>
        <template v-else>
          <div class="share-folder">
            <div>{{ shareData.properties['jcr:title'] }}</div>
            <img class="folder-img"
                 :src="`${baseUrl}${shareData?.renditions?.folder}`"
                 @error="handleFileError"
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
          :disabled="!!url"
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
import { baseUrl, needType } from '@/utils'

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
  computed: {
    fileShowType: function () {
      return type => {
        return needType[type]
      }
    }
  },
  data () {
    const folderIcon = 'data:image/png;base64,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'
    const fileIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFsAAABiCAYAAAA/Q6/8AAAAAXNSR0IArs4c6QAABIBJREFUeF7t3N9LFFEUB/Dvndld19RMa4t+0I/nggg1sM2MnvqxGhFBz70E0WNPQT0UQf9C/0LgQ9tGT5XWLkhFf4P0kJD9kKx03Z25MdKKica9d+6cmdHj873nzHzmcPbOD68A/5EJCLJMnAiMTVgEjM3YhAKEqbiyGZtQgDAVVzZjEwoQpuLKZmxCAcJUXNmMTShAmIorm7EJBQhTcWUzNqEAYSqubMYmFCBMxZXN2IQChKkirexiZWYUwHUBnHLbOzoRw1u4A7kGTm+d67t2dO8HQtc1U0WCXSx/2i+c7LjI5A7J5mKs53gw7+H8LuBb3eu72R8vuHXs4rOZfsfNvpPNRqzIreQH8z7Obm8AmQxmYwa3in2yMtsDx/sG308EdHAQS9g7GvAl4MQMbhV76OmXF1LIM4mRXoUdHFec4NawT4x9OpDd1jPlzf9MkvU/ld06sLjArWEXKzN3hBD3IGXiseOqcGvYQ5WZJxIIlnqJ+lvZs1cfGHWFW8MuVj6/FhBDiZJeo2fHCb7psSlbCmP/LXWKlsLYK/pK1OCMvaqJRwm+4bH3tPm4WGjA01iRRgW+4bGDwr2xr46mBnZUP5obHjswPtblYbC7qVXdUYBveOwALWghhzs8DHR76M5IQLHKJSTcTBY+5PGrR3a/C3sPsSmwW0gNCWSCh1GaZ+0KOTl+YecgY4cVUJv/ploqnFIbuv4ozWu8fqCk3q6HBfo7n7EtQaqEYWwVJUtjGNsSpEoYxlZRsjSGsS1BqoRhbBUlS2MY2xKkShjGVlGyNIaxLUGqhEk/tshk4eTyIPv8QQj4iwsw+DQu5dgS89J1L9fO9z5XKS1bY4rlz+eEEGMQaNeImV5sJ9cGp1EfGL9QeK9xwtaGDpenB2S+462/WFeNmV5sd0sXJs7krT0EUxVbOW745YL0fs+pTk0vNle26jVeZ5z2I1bu2ebi2tgAeDVi6G2CbZgqjmnp7dlxaIXMmX5sbiOGJaDdRvgH0lAagA42L/3MnZdm6mDzTQ0hNlc2IfZSKu7Z5uI6baSVhVcjht4m2Iap4piW/nV2HGqGOdOPbdRGgrctC78gaf8/PuXYhj+QVx5Ld3rL11tONvfQbyg//Dcs6OVp6cW2sfQrVr48EAK3id5fphfbxk3NYHl6ONvWMU5U3enF5soO2dW0l37cs83FtbFN39TwakTvQZT5JY1tZnp7dmxkpomlrFZHdobe3sPatxtJ3dzF1PefeRKV6khhJGwsa9hJ3bYoLBCEgJTybq1UuB82ljXspG7IFRbIbe9E/cfsoclLu6fCxrKGHRxIEreaCwskgVe1UsHK9nlWsZO4iWIYbOE4kL7bWy1t+x4mzvLzextBVsZI2vagpucnMjn43uJAzeKXtlYru3ViSdr4Vhd7CblZn4LfHK6N7vmoO/9/4yPBXkZPwJbOqlje/M9fApjwgUe1UqGsOk9nXKTYOgeyGcYyNuFVZmzGJhQgTMWVzdiEAoSpuLIZm1CAMBVXNmMTChCm4spmbEIBwlRc2YTYfwDyAa2BErJQjAAAAABJRU5ErkJggg=='
    const musicIcon = 'data:image/png;base64,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'
    const fontIcon = 'data:image/png;base64,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'
    const videoIcon = 'data:image/png;base64,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'

    return {
      folderIcon,
      fileIcon,
      musicIcon,
      fontIcon,
      videoIcon,
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
    },
    async handleBuild () {
      if (this.sharingExpiredTime && new Date().getTime() > new Date(this.sharingExpiredTime).getTime()) {
        this.$message.error('开放截至时间不能早于当前时间')
      } else {
        if (this.url) return
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
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(this.url)
          this.$message.success('复制成功')
        } else {
          const textArea = document.createElement('textarea')
          textArea.value = this.url
          // 使text area不在viewport，同时设置不可见
          textArea.style.position = 'absolute'
          textArea.style.opacity = 0
          textArea.style.left = '-999999px'
          textArea.style.top = '-999999px'
          document.body.appendChild(textArea)
          textArea.focus()
          textArea.select()
          // eslint-disable-next-line promise/param-names
          await new Promise((res, rej) => {
            // eslint-disable-next-line prefer-promise-reject-errors
            document.execCommand('copy') ? res() : rej()
            textArea.remove()
          })
          this.$message.success('复制成功')
        }
      }
    },
    handleError (type, event) {
      event.target.classList.remove('share-img')
      event.target.src = type === 'music' ? this.musicIcon : this.fontIcon
    },
    handleFileError (event) {
      event.target.src = this.folderIcon
      event.target.classList.add('error-icon-folder')
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

          .error-icon-folder {
            width: 88px !important;
            height: 80px !important;
            margin: 12px auto !important;
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
