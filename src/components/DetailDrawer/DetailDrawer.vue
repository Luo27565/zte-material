<template>
  <el-drawer :title="title" @open="init" :visible="drawer" :modal-append-to-body="false" :append-to-body="true"
             :with-header="withHeader"
             :destroy-on-close="destroyOnClose"
             :direction="direction" :size="size">
    <div class="drawer-top">
      <div class="top-btn">
        <div v-permission="assetRole" class="btn" style="margin-right: 24px" v-for="item in topBtn" :key="item.icon"
             v-show="item.show"
             @click="handleBtn(item.icon)">
          <i :class="item.icon"/>
          {{ item.label }}
        </div>
      </div>
      <div class="btn" @click="closeDrawer">
        关闭
      </div>
    </div>
    <div class="info-item">
      <div class="info-title">
        {{ detailData.showName }}
      </div>
      <div class="info-last">
        <i class="el-icon-arrow-left" @click="handleChange('sub')" v-show="index!==1"/>
        {{ index }} 个/共 {{ total }} 个资产
        <i class="el-icon-arrow-right" @click="handleChange('add')" v-show="index!==total"/>
      </div>
    </div>
    <div class="info-content">
      <div class="info-img">
        <template v-if="detailData.type==='video/mp4'||detailData.type==='audio/mpeg'">
          <video-player :options="videoOptions" class="video-player-box" :playsinline="true"></video-player>
        </template>
        <template v-else>
          <el-image v-if="detailData.renditions" :src="`${baseUrl}${detailData.renditions.detail}`" fit="contain">
            <div slot="error" class="image-slot">
              <i class="el-icon-document" style="font-size: 120px;color: #323232"></i>
            </div>
          </el-image>
        </template>
      </div>
      <div class="info-list">
        <p class="info-label">素材获取</p>
        <div class="info-btn">
          <template v-if="downLoadBtn">
            <el-button style="width: 100%" type="primary" @click="handleDownload('original')">下载当前文件</el-button>
          </template>
          <template v-else>
            <el-button type="primary" style="width: 48%" @click="handleDownload('original')">下载当前文件</el-button>
            <el-button type="primary" style="width: 48%" @click="handleDownload('related')">下载关联文件
              <!--              <i class="el-icon-arrow-down el-icon&#45;&#45;right"/>-->
            </el-button>
          </template>
        </div>
        <p class="info-label">基本信息</p>
        <div class="list-item" v-if="detailData.metadata">
          <div>
            <span>ID：</span>
            {{ detailData.assetId }}
          </div>
          <div>
            <span>名称：</span>
            {{ detailData.showName }}
          </div>
          <div v-show="detailData.metadata['tiff:ImageWidth']">
            <span>尺寸：</span>
            {{ `${detailData.metadata['tiff:ImageWidth']} x ${detailData.metadata['tiff:ImageLength']}` }}
          </div>
          <div>
            <span>存储大小：</span>
            {{ detailData.metadata['dam:size'] | formatSize }}
          </div>
          <div>
            <span>授权范围：</span>
            {{ detailData.metadata['dc:authorizationScope'] | formatAuthorizationScope }}
          </div>
          <div>
            <span>版权到期时间：</span>
            {{ detailData.metadata['prism:expirationDate'] }}
          </div>
          <div>
            <span>来源：</span>
            {{ detailData.metadata['dc:source'] | formatSource }}
          </div>
          <div>
            <span>创建时间：</span>
            {{ detailData.metadata['dam:extracted'] | formatDate }}
          </div>
          <div>
            <span>最后修改时间：</span>
            {{ detailData.properties['jcr:lastModified'] | formatDate }}
          </div>
          <div>
            <span>描述：</span>
            {{ detailData.metadata['dc:description'] }}
          </div>
          <div>
            <span>标签：</span>
            {{ showTag(detailData.metadata['cq:tags']) }}
          </div>
        </div>
      </div>
    </div>
    <select-dialog :visible.sync="visible" :detail-data="detailData" :path="detailData.path"
                   @finish="getAsset(detailData.path)"/>
    <list-dialog :visible.sync="visibleList" :file-path="detailData.path" :related-file-path="pathList" :name="nameList"
                 :detail-data="detailData"
                 @finish="getAsset(detailData.path)"/>
  </el-drawer>
</template>

<script>
import { baseUrl } from '@/utils'
import '@/utils/filter'
import { downloadByGet } from '@/api'
import { assetDetail, checkRelated, detailByAssetId, searchPopularTag } from '@/api/api'
import selectDialog from '@/components/SelectDialog/SelectDialog'
import listDialog from '@/components/ListDialog/ListDialog'
import { mapState } from 'pinia'
import zteStore from '@/store'

export default {
  name: 'DetailDrawer',
  components: {
    selectDialog,
    listDialog
  },
  props: {
    drawer: {
      type: Boolean,
      default: false
    },
    withHeader: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: ''
    },
    destroyOnClose: {
      type: Boolean,
      default: true
    },
    direction: {
      type: String,
      default: 'rtl'
    },
    size: {
      type: [String, Number],
      default: '100%'
    },
    detail: {
      type: Object,
      default: () => ({})
    },
    allDetailData: {
      type: Array,
      default: () => ([])
    }
  },
  computed: {
    ...mapState(zteStore, ['assetRole']),
    total: function () {
      return this.allDetailData.length
    },
    downLoadBtn: function () {
      return !this.topBtn.find(e => e.icon === 'el-icon-scissors').show
    },
    videoOptions: function () {
      const flag = {
        playbackRates: [0.5, 1.0, 1.5, 2.0], // 可选的播放速度
        autoplay: false, // 是否自动播放
        muted: false, // 是否静音
        loop: false, // 是否开启循环播放
        preload: 'auto', // 自动预加载
        language: 'zh-CN', // 语言，'en', 'zh-cn', 'zh-tw'
        aspectRatio: '16:9', // 播放器高宽占比（例如"16:9"或"4:3"）
        fluid: true, // 当true时，Video.js player将拥有流体大小。换句话说，它将按比例缩放以适应其容器。
        sources: [
          {
            type: this.detailData.type, // 类型
            src: `${baseUrl}${this.detailData.path}` // url地址
          }
        ],
        poster: (this.detailData.metadata && 'dc:coverImage' in this.detailData.metadata) ? this.detailData.metadata['dc:coverImage'].startsWith('http') ? this.detailData.metadata['dc:coverImage'] : `${baseUrl}${this.detailData.metadata['dc:coverImage']}` : '', // 封面地址
        notSupportedMessage: '此视频暂无法播放，请稍后再试', // 允许覆盖Video.js无法播放媒体源时显示的默认信息。
        controlBar: {
          timeDivider: true, // 是否显示当前时间和持续时间的分隔符，"/"
          durationDisplay: true, // 是否显示持续时间
          remainingTimeDisplay: false, // 是否显示剩余时间
          fullscreenToggle: true // 是否显示全屏按钮
        }
      }
      return flag
    },
    showTag: function () {
      const tags = { ...this.tags }
      return tag => tag ? tag.split(';').map(e => tags[e] || e).join(';') : ''
    }
  },
  data () {
    return {
      baseUrl,
      visible: false,
      visibleList: false,
      pathList: '',
      nameList: '',
      topBtn: [
        {
          icon: 'el-icon-edit',
          show: false,
          label: '编辑'
        }, {
          icon: 'el-icon-info',
          show: true,
          label: '属性'
        }, {
          icon: 'el-icon-position',
          show: true,
          label: '移动'
        }, {
          icon: 'el-icon-paperclip',
          show: false,
          label: '相关'
        }, {
          icon: 'el-icon-scissors',
          show: true,
          label: '取消关联'
        }
      ],
      index: 0,
      relatedData: {},
      detailData: {},
      tags: {}
    }
  },
  methods: {
    init () {
      this.getTags()
      const {
        assetId,
        path
      } = this.detail
      this.getAsset(path)
      this.index = this.allDetailData.findIndex(e => e.assetId === assetId) + 1
      // this.getRelated(this.detailData.path)
    },
    async getAsset (path) {
      const { results } = await assetDetail(encodeURIComponent(path))
      this.detailData = {
        ...results,
        showName: 'dc:title' in results.metadata ? results.metadata['dc:title'] || results.name : results.name,
        type: results.metadata['dc:format']
      }
      if (results.metadata['dc:downloadManagement']) {
        const res = await detailByAssetId(results.metadata['dc:downloadManagement'])
        this.relatedData = { ...res.results }
      }
      this.topBtn = [...this.topBtn.map(e => ({
        ...e,
        show: e.icon === 'el-icon-scissors' ? !!('dc:downloadManagement' in results.metadata && results.metadata['dc:downloadManagement']) : e.show
      }))]
    },
    closeDrawer () {
      this.$emit('update:drawer', false)
    },
    async getTags () {
      const { results } = await searchPopularTag('/content/cq:tags/zte-asset-tags')
      this.tags = results
    },
    async getRelated (path) {
      const res = await checkRelated(encodeURIComponent(path))
      const flag = res[path] ?? {}
      if (Object.keys(flag).length) {
        const { sources } = res[path]
        const length = Object.keys(sources).length
        this.topBtn = [...this.topBtn.map(e => ({
          ...e,
          show: e.icon === 'el-icon-scissors' ? !!length : e.show
        }))]
        this.relatedData = length ? sources : {}
      } else {
        this.topBtn = [...this.topBtn.map(e => ({
          ...e,
          show: e.icon === 'el-icon-scissors' ? false : e.show
        }))]
        this.relatedData = {}
      }
    },
    handleChange (type) {
      (type === 'add') && (this.index = ++this.index);
      (type === 'sub') && (this.index = --this.index)
      const flag = this.allDetailData[this.index - 1]
      this.getAsset(flag.path)
      // this.getRelated(flag.path)
    },
    handleDownload (type) {
      const {
        path,
        name,
        renditions: {
          detail,
          card,
          column
        }
      } = this.detailData
      console.log(path)
      type === 'original' && downloadByGet(`${path}`, name)
      type === 'detail' && downloadByGet(`${detail}`, name)
      type === 'card' && downloadByGet(`${card}`, name)
      type === 'column' && downloadByGet(`${column}`, name)
      type === 'related' && this.downloadRelate()
    },
    handleBtn (icon) {
      icon === 'el-icon-paperclip' && (this.visible = true)
      icon === 'el-icon-scissors' && this.handleRelate()
      icon === 'el-icon-position' && this.handleMove()
      icon === 'el-icon-info' && this.handleJump()
    },
    handleJump () {
      const { path } = this.$route
      this.$router.push({
        path,
        query: {
          path: this.detailData.path
        }
      })
    },
    async downloadRelate () {
      // const path = decodeURIComponent(Object.keys(this.relatedData)[0])
      // const { name } = this.relatedData[Object.keys(this.relatedData)[0]]
      // const path = this.detailData.metadata['dc:downloadManagement']
      // const { results: { name } } = await assetDetail(encodeURIComponent(path))
      await downloadByGet(`${this.relatedData.path}`, this.relatedData.name)
    },
    async handleRelate () {
      // const { name } = this.relatedData[Object.keys(this.relatedData)[0]]
      // this.nameList = name
      // this.pathList = decodeURIComponent(Object.keys(this.relatedData)[0])
      // this.visibleList = true
      // const text = this.detailData.metadata['dc:downloadManagement']
      // const { results: { name } } = await assetDetail(encodeURIComponent(text))
      this.nameList = this.relatedData.name
      this.pathList = this.relatedData.path
      this.visibleList = true
    },
    handleMove () {
      this.$emit('move', this.detailData)
      // this.closeDrawer()
    }
  }
}
</script>

<style lang="scss" scoped>
.drawer-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4375rem 1rem;
  border-bottom: 0.0625rem solid #E1E1E1;
  height: 3.25rem;
  background-color: rgb(250, 250, 250);

  .top-btn {
    display: flex;
  }

  .btn {
    display: inline-block;
    -webkit-box-sizing: border-box;
    -moz-box-sizing: border-box;
    box-sizing: border-box;
    min-width: 2.375rem;
    height: 2.375rem;
    margin: 0;
    padding: .625rem;
    vertical-align: top;
    border-radius: .25rem;
    border-color: #d0d0d0;
    background-color: #fafafa;
    font-family: adobe-clean, Helvetica, Arial, sans-serif;
    font-weight: 700;
    font-style: normal;
    color: #6d6d6d;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    font-smoothing: antialiased;
    font-size: .9375rem;
    text-decoration: none;
    text-align: center;
    line-height: 1rem;
    cursor: pointer;
    white-space: nowrap;

    i {
      margin-right: 4px;
      font-size: 18px;
    }
  }

  .btn:hover {
    background-color: transparent;
    color: #323232;
    text-decoration: none;
  }
}

.info-item {
  display: flex;
  justify-content: center;
  align-items: center;
  border-bottom: 0.0625rem solid #E1E1E1;
  height: 3rem;
  background-color: #F0F0F0;
  position: relative;

  .info-title {
    order: 2;
    flex: 0 1 auto; /* Allow the title area to shrink */
    overflow: hidden;
    color: rgb(109, 109, 109);
    font-size: 1.125rem;
    font-weight: bold;
  }

  .info-last {
    position: absolute;
    right: 1rem;
    color: rgb(109, 109, 109);

    i {
      cursor: pointer;
      font-size: 18px;
    }

    i:hover {
      color: #323232;
    }
  }
}

.info-content {
  height: calc(100vh - 3.25rem - 3rem);
  display: flex;
  overflow: hidden;

  .info-img {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 2rem;

    /deep/ .el-image {
      width: 100%;
      height: 100%;
    }

    /deep/ .image-slot {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    .video-player-box {
      display: block;
      width: 80%;
      height: auto;
    }
  }

  .info-list {
    width: 20rem;
    padding: 1rem 1rem 1rem 0;
    color: #323232;
    font-size: 14px;

    .info-label {
      font-weight: bold;
    }

    .info-btn {
      display: flex;
      width: 100%;
      justify-content: space-between;
    }

    .list-item {
      line-height: 1.8rem;
      font-size: 14px;

      span {
        font-weight: bold;
      }
    }
  }
}

/deep/ .video-js .vjs-big-play-button {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}
</style>
