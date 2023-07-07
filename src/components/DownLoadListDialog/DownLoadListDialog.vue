<template>
  <el-dialog :visible="visible" :show-close="false" :title="title" @close="handleClose" :modal-append-to-body="true"
             @open="handleOpen"
             :append-to-body="true" width="320px" class="disassociation-box">
    <div class="content">
      <el-checkbox v-model="selectAll" @change="handleAll">全选</el-checkbox>
      <div class="item" v-for="(item,index) in listData" :key="index">
        <el-checkbox v-model="item.isSelect"></el-checkbox>
        <div class="img">
          <el-image :src="`${baseUrl}${item['sling:resource']}`"
                    :preview-src-list="[`${baseUrl}${item['sling:resource']}`]">
            <div slot="error" class="image-slot">
              <i class="el-icon-document" style="font-size: 24px"></i>
            </div>
          </el-image>
        </div>
        <div class="name">{{ item.showName }}</div>
        <img alt="download" src="../../assets/home/download.png" class="download-icon" @click="handleDown(index)"
             title="下载"/>
      </div>
    </div>
    <div slot="footer">
      <el-button @click="handleClose">取 消</el-button>
      <el-button type="primary" @click="handleDownLoad" :disabled="!btn" class="disassociation-btn" v-loading="loading">
        下
        载
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import { baseUrl } from '@/utils'
import { downloadZip } from '@/api/api'
import { downloadByGet } from '@/api'

export default {
  name: 'DownLoadListDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '关联文件列表'
    },
    list: {
      type: Array,
      default: () => []
    },
    zipName: {
      type: String,
      default: ''
    }
  },
  computed: {
    btn () {
      return this.listData.some(i => i.isSelect)
    }
  },
  data () {
    return {
      baseUrl,
      loading: false,
      listData: [],
      selectAll: false
    }
  },
  watch: {
    listData: {
      handler () {
        this.selectAll = this.listData.every(i => i.isSelect)
      },
      deep: true
    }
  },
  methods: {
    handleOpen () {
      this.listData = [...this.list.map(e => ({
        ...e,
        isSelect: false
      }))]
    },
    handleClose () {
      this.$emit('update:visible', false)
    },
    async handleDown (index) {
      const flag = this.list[index]
      await downloadByGet(`${flag['sling:resource']}`, flag.showName)
    },
    handleAll (val) {
      this.listData = [...this.listData.map(i => ({
        ...i,
        isSelect: val
      }))]
    },
    async handleDownLoad () {
      try {
        this.loading = true
        const flag = this.listData.filter(i => i.isSelect)
        if (flag.length === 1) {
          await downloadByGet(`${flag[0]['sling:resource']}`, flag[0].showName)
        } else {
          const str = flag.map(i => `path=${i['sling:resource']}`).join('&')
          const res = await downloadZip(`${flag[0]['sling:resource']}.assetdownload.zip/zte.zip?${str}&_charset_=utf-8&downloadAssets=true&licenseCheck=false&flatStructure=true&downloadRenditions=false&downloadSubassets=false`)
          const url = window.URL.createObjectURL(res)
          const a = document.createElement('a')
          a.href = url
          a.download = `${this.zipName}关联文件.zip`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        }
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.el-image-viewer__wrapper {
  z-index: 3000 !important;
}

.disassociation-box {
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
            margin-left: 12px;
            width: 3rem;
            height: 3rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .name {
            flex: 1;
            padding: 0 .625rem;
          }

          .download-icon {
            cursor: pointer;
            width: 28px;
            height: 25px;
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
  }
}
</style>
