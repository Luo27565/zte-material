<template>
  <el-dialog
    :title="title"
    :visible.sync="dialogVisible"
    :width="width"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :destroy-on-close="true"
    :before-close="beforeClose"
    @close="handleClose"
    @open="handleOpen">
    <div>
      <el-upload
        ref="upload"
        drag
        :action="action"
        :auto-upload="false"
        :file-list="fileList"
        :with-credentials="true"
        :on-preview="handlePreview"
        :on-change="handleFileList"
        :on-remove="handleFileList"
        :before-remove="handleBeforeRemove"
        :http-request="uploadFile"
        multiple>
        <i class="el-icon-upload"></i>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="file" slot-scope="{file}"
             :class="{'upload-fail':file.status==='fail'||file.isCancel,'upload-success':file.status==='success','upload-ready':file.status==='ready','upload-uploading':file.status==='uploading'}">
          <div class="upload-content">
            <div class="upload-info">
              <div>
                <i class="el-icon-document"/>
                <span>{{ file.name }}</span>
              </div>
              <i v-show="file.status==='success'" class="el-icon-circle-check status-icon"/>
              <i class="el-icon-close close-icon" @click="handleRemove(file)"/>
            </div>
            <el-progress v-if="file.status==='uploading'" :percentage="file.percentage" :stroke-width="4"></el-progress>
          </div>
        </div>
      </el-upload>
    </div>
    <span slot="footer" class="dialog-footer">
    <el-button :disabled="loading" @click="handleClose" v-show="!uploaded">取 消</el-button>
    <el-button type="primary" @click="handleUpload" :disabled="fileList.length === 0" v-show="!uploaded"
               :loading="loading">上 传</el-button>
      <el-button type="primary" @click="closeDialog" :disabled="showFooterClose"
                 v-show="uploaded">关 闭</el-button>
    </span>
  </el-dialog>
</template>

<script>
import axios, { CancelToken } from 'axios'
import { getToken, uploadUrl } from '@/api/api'
import zteStore from '@/store'
import { mapState } from 'pinia'

export default {
  name: 'Upload',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '选择文件'
    },
    width: {
      type: String,
      default: '50%'
    },
    existData: {
      type: Array,
      default: () => ([])
    }
  },
  computed: {
    ...mapState(zteStore, ['lastCrumb']),
    showFooterClose: function () {
      return this.fileList.some(e => e.status === 'uploading')
    }
  },
  data () {
    return {
      action: uploadUrl,
      loading: false,
      fileList: [],
      cancelRequest: [],
      uploaded: false,
      cancelUploadExist: false,
      repeatData: []
    }
  },
  methods: {
    handleOpen () {
      this.uploaded = false
      this.fileList = []
      this.cancelRequest = []
    },
    handleClose () {
      this.cancelUploadExist = false
      this.$emit('update:dialogVisible', false)
    },
    beforeClose (done) {
      this.loading === false && done()
      this.loading === false && (this.fileList = [])
    },
    handleUpload () {
      const flag = this.fileList.filter(e => this.existData.some(i => i.name === e.name))
      this.repeatData = [...flag]
      if (flag.length) {
        this.$confirm(`此位置已存在名为${flag.map(e => e.name).join('，')}的资产`, '名称冲突', {
          confirmButtonText: flag.length === 1 ? '替换' : '替换全部',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.$refs.upload.submit()
          this.uploaded = true
        }).catch(() => {
          if (this.fileList.length === 1 || this.fileList.length === flag.length) {
            this.handleClose()
          } else {
            this.cancelUploadExist = true
            this.$refs.upload.submit()
            this.uploaded = true
          }
        })
      } else {
        this.$refs.upload.submit()
        this.uploaded = true
      }
    },
    handlePreview (file) {
      console.log(file)
    },
    handleFileList (file, fileList) {
      this.fileList = fileList
    },
    async uploadFile (request) {
      const { id } = this.lastCrumb
      const { file } = request
      if (this.cancelUploadExist && this.existData.some(i => i.name === file.name)) {
        this.fileList = [...this.fileList.map(e => ({
          ...e,
          status: e.uid === file.uid ? 'fail' : e.status,
          name: `${e.name}${e.uid === file.uid ? '（取消上传）' : ''}`,
          isCancel: e.uid === file.uid
        }))]
        return
      }
      const formData = new FormData()
      formData.set('file', file)
      formData.set('filePath', id)
      const { token } = await getToken()
      axios({
        method: 'post',
        url: uploadUrl,
        data: formData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'CSRF-Token': token
        },
        cancelToken: new CancelToken(cancel => {
          this.cancelRequest = [...this.cancelRequest, {
            uid: file.uid,
            cancel
          }]
        }),
        onUploadProgress: processEvent => {
          const {
            loaded,
            total
          } = processEvent
          const complete = parseInt(((loaded / total) * 100) | 0, 10)
          request.onProgress({ percent: complete })
        }
      }).then(res => {
        this.fileList = [...this.fileList.map(e => ({
          ...e,
          status: e.uid === file.uid ? 'success' : e.status,
          response: e.uid === file.uid ? res : e.response,
          name: `${e.name}${e.uid === file.uid ? '（上传成功）' : ''}`
        }))]
      }).catch(rej => {
        const { response } = rej
        this.fileList = [...this.fileList.map(e => ({
          ...e,
          status: e.uid === file.uid ? 'fail' : e.status,
          response: e.uid === file.uid ? response : e.response,
          name: `${e.name}${e.uid === file.uid ? '（上传失败）' : ''}`
        }))]
      }).finally(() => {
        this.loading = false
      })
    },
    handleBeforeRemove (file) {
      const { status } = file
      if (status !== 'ready') return false
    },
    handleRemove (file) {
      const {
        uid,
        status
      } = file
      status === 'uploading' && (this.cancelRequest.find(e => e.uid === uid).cancel())
      status === 'ready' && (this.fileList = [...this.fileList.filter(e => e.uid !== uid)])
    },
    closeDialog () {
      console.log(this.fileList)
      this.$emit('finish')
      this.handleClose()
    }
  }
}
</script>

<style lang="scss" scoped>
/deep/ .el-upload {
  width: 100%;

  .el-upload-dragger {
    width: 100%;
  }
}

/deep/ .el-upload-list {
  max-height: 200px;
  overflow: auto;
}

/* 滚动槽 */
/deep/ .el-upload-list::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

/deep/ .el-upload-list::-webkit-scrollbar-track {
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.06);
  -webkit-box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.08);
}

/* 滚动条滑块 */
/deep/ .el-upload-list::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background: rgba(0, 0, 0, 0.12);
  -webkit-box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.2);
}

.upload-success {
  color: #67C23A;

  .close-icon {
    display: none !important;
  }
}

.upload-fail {
  color: #F56C6C;

  .close-icon {
    display: none !important;
  }
}

.upload-ready {
  .status-icon {
    display: none;
  }
}

.upload-content {
  cursor: pointer;
  padding: 0 8px;

  .upload-info {
    display: flex;
    align-items: center;
    justify-content: space-between;

    i {
      font-size: 18px;
    }

    span {
      margin-left: 8px;
    }
  }
}

/deep/ .el-upload-list__item:hover .is-success .el-icon-close {
  display: none;
}

/deep/ .el-upload-list__item .el-progress {
  position: relative;
  top: 0;
}

/deep/ .el-upload-list__item .el-progress__text {
  top: -17px;
}
</style>
