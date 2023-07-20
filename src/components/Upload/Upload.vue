<template>
  <el-drawer :visible.sync="dialogVisible" direction="rtl" title="上传资产" size="36%" :destroy-on-close="true"
             :wrapperClosable="false"
             :append-to-body="true" @close="handleClose">
    <div class="container">
      <div class="drawer-item" style="margin-bottom: 0;">
        <div class="drawer-item-row">
          <div class="drawer-text">上传类型</div>
          <div class="drawer-select">
            <el-select v-model="uploadType" popper-class="select-for-zte" class="select-list-item">
              <el-option value="file" label="文件"/>
              <el-option value="folder" label="文件夹"/>
            </el-select>
          </div>
        </div>
      </div>
      <el-upload :class="['draw-upload',fileList.length!==0?'has-exits':'']" :action="action" :auto-upload="false"
                 :disabled="uploaded"
                 ref="upload"
                 :list-type="fileList.length?'text':'text-none'"
                 :with-credentials="true" :drag="isDrag" multiple
                 :on-change="handleFileList"
                 :on-remove="handleFileList"
                 :before-remove="handleBeforeRemove"
                 :http-request="uploadFile"
                 :file-list="fileList">
        <img alt="" src="../../assets/home/upload-black.png" class="el-icon-upload"/>
        <div class="el-upload__text">
          <em>{{ fileList.length === 0 ? `点击选择文件${uploadType === 'folder' ? '夹' : ''}` : '继续上传' }}</em>{{
            fileList.length === 0 && uploadType === 'file' ? '或拖拽文件到此处' : ''
          }}
        </div>
        <div slot="file" slot-scope="{file}">
          <div class="upload-info">
            <span>{{ file.name }}</span>
            <el-progress :percentage="file.percentage" :format="format"
                         :stroke-width="4"></el-progress>
            <img @click="handleRemove(file)" alt="" src="../../assets/home/upload-file-close.png"/>
          </div>
        </div>
      </el-upload>
      <div class="drawer-item drawer-item-first">
        <div class="drawer-item-row">
          <div class="drawer-text">重名处理</div>
          <div class="drawer-select">
            <el-radio-group v-model="metadata.cover">
              <el-radio label="false">保留</el-radio>
              <el-radio label="true">替换</el-radio>
            </el-radio-group>
          </div>
        </div>
      </div>
      <div class="drawer-item">
        <div class="drawer-item-row">
          <div class="drawer-text">资产来源</div>
          <div class="drawer-select">
            <el-select v-model="metadata.source" popper-class="select-for-zte" class="select-list-item">
              <el-option
                v-for="item in sourceOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
        </div>
        <div class="drawer-item-row">
          <div class="drawer-text">版权截止日期</div>
          <div class="drawer-select">
            <el-date-picker
              class="select-list-item"
              prefix-icon="el-icon-date"
              v-model="metadata.expires"
              type="datetime"
              :value-format="dateValueFormat"/>
          </div>
        </div>
      </div>
      <div class="drawer-item">
        <div class="drawer-item-row">
          <div class="drawer-text">是否推荐</div>
          <div class="drawer-select">
            <el-select v-model="metadata.recommend" popper-class="select-for-zte" class="select-list-item">
              <el-option
                v-for="item in whetherRecommendedOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
        </div>
        <div class="drawer-item-row">
          <div class="drawer-text">版权类型</div>
          <div class="drawer-select">
            <el-select v-model="metadata.rights" popper-class="select-for-zte" class="select-list-item">
              <el-option
                v-for="item in typeOfCopyrightOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
      <div class="drawer-item">
        <div class="drawer-item-row">
          <div class="drawer-text">授权范围</div>
          <div class="drawer-select drawer-checkbox">
            <el-checkbox-group v-model="metadata.authorizationScope" fill="#222222">
              <el-checkbox v-for="item in authorizationScopeCheckBox" :key="item.value"
                           :label="item.value">{{ item.label }}
              </el-checkbox>
            </el-checkbox-group>
          </div>
        </div>
        <div class="drawer-item-row">
          <div class="drawer-text">色彩</div>
          <div class="drawer-select">
            <el-select v-model="metadata.color" popper-class="select-for-zte" class="select-list-item">
              <el-option
                v-for="item in colorOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
        </div>
      </div>
      <div class="drawer-item">
        <div style="width: 100%">
          <div class="drawer-text">标签</div>
          <div class="drawer-select">
            <el-select v-model="metadata.tags" multiple popper-class="select-for-zte" style="width: 45%;"
                       @visible-change="handleSelectTag">
              <el-option
                v-for="item in tagOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="tag-tag">
            <span v-for="(item,index) in metadata.tags" :key="index" class="tag-item">
              {{ tagOptions.find(i => i.value === item).label }}
              <i class="el-icon-close" @click="handleDeleteTags(item)"/>
            </span>
          </div>
        </div>
      </div>
      <div class="drawer-footer" v-loading="loading">
        <button :class="['btn confirm',fileList.length===0?'disabled':'']" @click="handleSubmit">
          {{ uploaded ? '关闭' : '确定上传' }}
        </button>
        <div class="btn" @click="handleClose">取消</div>
      </div>
    </div>
  </el-drawer>
</template>

<script>
import axios, { CancelToken } from 'axios'
import { getToken, searchPopularTag, uploadUrl } from '@/api/api'
import {
  sourceOptions,
  authorizationScopeCheckBox,
  colorOptions,
  whetherRecommendedOptions,
  typeOfCopyrightOptions
} from '@/utils'
import zteStore from '@/store'
import { mapState } from 'pinia'

export default {
  name: 'Upload',
  props: {
    dialogVisible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState(zteStore, ['lastCrumb'])
  },
  data () {
    return {
      uploaded: false,
      loading: false,
      isDrag: true,
      dateValueFormat: 'yyyy-MM-dd HH:mm:ss',
      sourceOptions,
      authorizationScopeCheckBox,
      colorOptions,
      whetherRecommendedOptions,
      typeOfCopyrightOptions,
      tagOptions: [],
      action: uploadUrl,
      uploadType: 'file',
      fileList: [],
      cancelRequest: [],
      metadata: {
        source: '',
        authorizationScope: [],
        color: '',
        recommend: 'false',
        expires: '',
        rights: '',
        tags: [],
        cover: 'false'
      }
    }
  },
  watch: {
    uploadType: {
      handler (newVal) {
        if (newVal === 'folder') {
          this.isDrag = false
          document.getElementsByClassName('el-upload__input')[0].webkitdirectory = true
        } else {
          this.isDrag = true
          document.getElementsByClassName('el-upload__input')[0].webkitdirectory = false
        }
      }
    }
  },
  methods: {
    format (percentage) {
      return percentage === 100 ? '完成' : percentage === 0 ? '等待上传' : percentage === -1 ? '上传失败' : percentage === -2 ? '取消上传' : `${percentage}%`
    },
    async handleTags () {
      const { results } = await searchPopularTag('/content/cq:tags/zte-asset-tags')
      const flag = Object.keys(results)
      this.tagOptions = flag.map(e => ({
        label: results[e],
        value: e
      }))
    },
    handleSelectTag (flag) {
      flag && this.handleTags()
    },
    handleClose () {
      this.$emit('close', this.uploaded)
      this.fileList = []
      this.uploaded = false
      this.uploadType = 'file'
      const flag = {
        source: '',
        authorizationScope: [],
        color: '',
        recommend: 'false',
        expires: '',
        rights: '',
        tags: [],
        cover: 'false'
      }
      this.metadata = { ...flag }
    },
    handleDeleteTags (key) {
      const { tags } = this.metadata
      this.metadata.tags = tags.filter(i => i !== key)
    },
    handleFileList (file, fileList) {
      this.fileList = fileList
    },
    handleSubmit () {
      if (this.uploaded) {
        this.handleClose()
      } else {
        this.$refs.upload.submit()
        this.uploaded = true
        this.loading = true
      }
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
    async uploadFile (request) {
      const { id } = this.lastCrumb
      const { file } = request
      const formData = new FormData()
      formData.set('file', file)
      formData.set('filePath', id)
      formData.set('dc:source', this.metadata.source)
      formData.set('prism:expirationDate', this.metadata.expires)
      formData.set('dc:recommend', this.metadata.recommend)
      formData.set('dc:rights', this.metadata.rights)
      formData.set('dc:authorizationScope', this.metadata.authorizationScope.join(';'))
      formData.set('dc:color', this.metadata.color)
      formData.set('tagPath', this.metadata.tags.join(';'))
      formData.set('cover', this.metadata.cover)
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
          finish: e.uid === file.uid ? true : e.finish
        }))]
      }).catch(rej => {
        const {
          response,
          code
        } = rej
        this.fileList = [...this.fileList.map(e => ({
          ...e,
          status: e.uid === file.uid ? 'fail' : e.status,
          response: e.uid === file.uid ? response : e.response,
          percentage: e.uid === file.uid ? code === 'ERR_CANCELED' ? -2 : -1 : e.percentage,
          finish: e.uid === file.uid ? true : e.finish
        }))]
      }).finally(() => {
        this.loading = false
        if (this.fileList.every(i => i.finish)) {
          if (this.fileList.some(i => i.percentage === -1)) {
            this.$message.error('上传失败')
          } else {
            this.$message.success('上传成功')
          }
        }
      })
    }
  }
}
</script>

<style lang="scss">
.select-for-zte {
  z-index: 3000 !important;
}
</style>
<style lang="scss" scoped>
.el-drawer__wrapper {
  top: 0 !important;
  z-index: 2200 !important;
}

/deep/ .el-select-dropdown .el-popper {
  z-index: 2400 !important;
}

/deep/ .el-drawer__header {
  font-size: 20px;
  color: #222222;
  padding: 12px 28px 0 24px;
  line-height: 28px;
  font-weight: 400;
  margin-bottom: 12px;
}

.container {
  padding: 0 50px 0 60px;
  height: 100%;
  position: relative;
  box-sizing: border-box;

  .drawer-footer {
    margin-top: 100px;
    padding-bottom: 60px;
    display: flex;
    flex-direction: row-reverse;

    .btn {
      width: 95px;
      height: 36px;
      border-radius: 32px;
      border: 1px solid #666666;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #666666;
      font-weight: 400;
      font-size: 14px;
      cursor: pointer;
    }

    .confirm {
      margin-left: 30px;
      background: #008ED3;
      color: #FFFFFF;
      border: 1px solid #008ED3;
    }

    .disabled {
      background: #F2F3F5;
      border: 1px solid #F2F3F5;
      color: #666666;
      cursor: not-allowed;
      pointer-events: none;
    }
  }

  .drawer-item {
    display: flex;
    justify-content: space-between;
    margin-bottom: 32px;

    .drawer-item-row {
      width: 45%;

      .select-list-item {
        width: 100%;
      }
    }
  }

  .drawer-item-first {
    margin-top: 36px;
  }

  .drawer-text {
    font-size: 16px;
    font-weight: 400;
    line-height: 20px;
  }

  .tag-tag {
    display: flex;
    flex-wrap: wrap;
    margin-top: 20px;

    .tag-item {
      background: #F2F3F5;
      border-radius: 4px;
      border: 1px solid #F2F3F5;
      font-size: 14px;
      font-weight: 400;
      color: #222222;
      line-height: 22px;
      display: inline-block;
      padding: 4px 8px;
      margin: 0 12px 8px 0;
      cursor: pointer;
    }
  }

  .drawer-select {
    margin: 6px 0 0;

    /deep/ .el-input__inner {
      width: 100%;
      height: 36px;
      border-radius: 8px;
      background: #F2F3F5;
      font-size: 14px;
      color: #86909C;
      font-weight: 400;
      transition: all .5s;
    }

    /deep/ .el-input__icon {
      line-height: 36px;
    }

    /deep/ .el-input__inner:hover {
      background: #FFFFFF;
      border-color: #008ED3;
      color: #222222;
    }

    /deep/ .is-focus .el-input__inner {
      background: #FFFFFF;
      border-color: #008ED3;
      color: #222222;
    }

    /deep/ .el-select .el-input__inner:focus {
      background: #FFFFFF;
      border-color: #008ED3;
      color: #222222;
    }
  }

  .drawer-checkbox {
    margin: 16px 0 0;
  }

  /deep/ .el-checkbox__inner {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /deep/ .el-checkbox__label {
    color: #666666;
  }

  /deep/ .el-checkbox__inner::after {
    left: 5.5px;
    top: 2px;
  }

  /deep/ .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #13A1E7;
    border-color: #13A1E7;
  }

  /deep/ .is-checked .el-checkbox__label {
    color: #222222;
  }

  /deep/ .el-select__tags {
    display: none;
  }

  .draw-upload {
    margin-top: 24px;
    width: 100%;
    height: 160px;
    position: relative;

    /deep/ .el-upload-list__item:hover {
      background-color: unset;
      cursor: pointer;
    }

    /deep/ .el-upload-list {
      position: absolute;
      top: 12px;
      left: 0;
      width: 100%;
      padding: 0 36px;
      box-sizing: border-box;
      height: 180px;
      overflow-y: auto;
      border-radius: 0 16px 0 0;
      border-bottom: 1px solid #D8D8D8;
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

    /deep/ .el-upload-list__item .el-progress {
      width: 50%;
      position: relative;
      top: unset;
      display: flex;
      align-items: center;
    }

    /deep/ .el-upload-list__item .el-progress__text {
      font-size: 12px !important;
      color: #3D3D3D !important;
      position: relative;
      right: unset;
      top: unset;
    }

    /deep/ .el-upload-list__item .el-icon-close {
      position: relative;
      display: block !important;
    }

    /deep/ .el-upload-list__item:hover .el-progress__text {
      display: block;
    }

    /deep/ .el-progress-bar {
      flex: 1;
    }

    .upload-info {
      display: flex;
      align-items: center;
      font-size: 12px;
      font-weight: 400;
      color: #3D3D3D;

      span {
        flex: 1;
      }

      img {
        width: 19px;
        height: 23px;
      }
    }

    /deep/ .el-upload-list--text-none {
      display: none;
    }

    /deep/ .el-upload {
      width: 100%;
      height: 100%;
    }

    /deep/ .el-upload-dragger {
      border-radius: 16px;
      border: 1px solid #999999;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      width: 100%;
      height: 100%;
    }

    /deep/ .el-upload__text {
      font-size: 14px;
      font-weight: 400;
      line-height: 20px;
      color: #222222;
      margin-top: 10px;
    }

    /deep/ .el-upload__text em {
      color: #008ED3;
      position: relative;
    }

    /deep/ .el-upload__text em::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 1px;
      background: #008ED3;
    }

    /deep/ .el-upload-dragger .el-icon-upload {
      width: 35px;
      height: 29px;
      margin: unset;
    }
  }

  .has-exits {
    height: 270px;

    /deep/ .el-upload__text {
      margin-top: unset;
    }

    /deep/ .el-upload-dragger {
      justify-content: flex-end;
      padding-bottom: 22px;
    }
  }
}

</style>
