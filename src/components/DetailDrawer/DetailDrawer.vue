<template>
  <el-drawer :title="title" @open="init" :visible="drawer" :modal-append-to-body="false" :append-to-body="true"
             :with-header="withHeader"
             :destroy-on-close="destroyOnClose"
             :direction="direction" :size="size" class="detail-wrap">
    <template v-if="drawer">
      <div class="drawer-top">
        <div class="drawer-top-cnt">
          <div class="top-btn">
            <div v-permission="assetRole" class="btn" :class="item.className" v-for="item in topBtn" :key="item.icon"
                 v-show="item.show"
                 @click="handleBtn(item.icon)">
              <i :class="item.icon"/>
              {{ item.label }}
            </div>
          </div>
          <div class="btn detail-close" @click="closeDrawer">
            关闭
          </div>
        </div>
      </div>
      <div class="drawer-bottom-wrap">
        <div class="drawer-bottom">
          <div class="drawer-bottom-cnt">
            <div class="info-item">
              <div class="info-title">
                {{ detailData.showName }}
              </div>
              <div class="info-last">
                <div class="prve-btn" @click="handleChange('sub')" :class="index==1?'disable':''">
                  <i class="el-icon-arrow-left"/>
                  上一张
                </div>
                <!--          {{ index }} 个/共 {{ total }} 个资产-->
                <div class="next-btn" @click="handleChange('add')" :class="index==total?'disable':''">
                  下一张
                  <i class="el-icon-arrow-right"/>
                </div>
              </div>
            </div>
            <div class="info-content">
              <div class="info-img">
                <template v-if="detailData.type==='video/mp4'||detailData.type==='audio/mpeg'">
                  <video-player :options="videoOptions" class="video-player-box" :playsinline="true"></video-player>
                </template>
                <template v-else>
                  <el-image v-if="detailData.renditions"
                            :src="`${baseUrl}${detailData.metadata&&'dc:coverImage' in detailData.metadata?detailData.metadata['dc:coverImage']: detailData.renditions.detail}`"
                            fit="contain">
                    <div slot="error" class="image-slot">
                      <img v-if="detailData.metadata && 'dc:coverImage' in detailData.metadata"
                           :src="`${baseUrl}${detailData.metadata['dc:coverImage']}`"/>
                      <i v-else class="el-icon-document" style="font-size: 120px;color: #323232"></i>
                    </div>
                  </el-image>
                </template>
              </div>
              <div class="info-list">
                <!--            <p class="info-label">基本信息</p>-->
                <div class="list-item" v-if="detailData.metadata">
                  <!--              <div>-->
                  <!--                <span>ID：</span>-->
                  <!--                {{ detailData.assetId }}-->
                  <!--              </div>-->
                  <div class="info-btn">
                    <template v-if="downLoadBtn">
                      <el-button style="width: 100%" :disabled="isExpiresDisabled" type="primary"
                                 @click="handleDownload('original')">下载当前图片
                      </el-button>
                    </template>
                    <template v-else>
                      <el-button type="primary" :disabled="isExpiresDisabled" style="width: 48%"
                                 @click="handleDownload('original')">下载当前图片
                      </el-button>
                      <el-button type="primary" style="width: 48%" @click="handleDownload('related')"
                                 :disabled="isExpiresDisabled"
                                 class="associated-download">下载关联文件
                        <i v-if="relateds.length>1" class="el-icon-arrow-down"/>
                      </el-button>
                    </template>
                  </div>
                  <div class="item-ul" v-if="isExpiresDisabled">
                    <div class="item-li">
                      <span style="color: #999999;">此素材已到期，请联系管理员</span>
                    </div>
                  </div>
                  <div class="info-list-label">
                    <!--                <span>标签：</span>-->
                    <!--                {{ showTag(detailData.metadata['cq:tags']) }}-->
                    <ul>
                      <li v-for="(item, index) in showTag(detailData.metadata['cq:tags'])" :key="index"><span>{{
                          item
                        }}</span></li>
                    </ul>
                  </div>
                  <div class="item-ul">
                    <div class="item-li" v-show="detailData.metadata['tiff:ImageWidth']">
                      <span class="item-li-title">尺寸：</span>
                      <span>{{
                          `${detailData.metadata['tiff:ImageWidth']} x ${detailData.metadata['tiff:ImageLength']}`
                        }}</span>
                    </div>
                    <div class="item-li">
                      <span class="item-li-title">存储大小：</span>
                      <span>{{ detailData.metadata['dam:size'] | formatSize }}</span>
                    </div>
                    <div class="item-li">
                      <span class="item-li-title">授权范围：</span>
                      <span>{{ detailData.metadata['dc:authorizationScope'] | formatAuthorizationScope }}</span>
                    </div>
                    <div class="item-li">
                      <span class="item-li-title">版权时间：</span>
                      <span>{{ detailData.metadata['prism:expirationDate'] }}</span>
                    </div>
                    <div class="item-li">
                      <span class="item-li-title">版权来源：</span>
                      <span>{{ detailData.metadata['dc:source'] | formatSource }}</span>
                    </div>
                    <div class="item-li">
                      <span class="item-li-title">创建时间：</span>
                      <span>{{ detailData.metadata['dam:extracted'] | formatDate }}</span>
                    </div>
                    <div class="item-li">
                      <span class="item-li-title">最后修改时间：</span>
                      <span>{{ detailData.properties['jcr:lastModified'] | formatDate }}</span>
                    </div>
                    <div class="item-li dec-wrap">
                      <span class="item-li-title">描述：</span>
                      <span>{{ detailData.metadata['dc:description'] }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    <select-dialog :visible.sync="visible" :detail-data="detailData" :path="detailData.path"
                   @finish="getAsset(detailData.path)"/>
    <list-dialog :visible.sync="visibleList" :file-path="detailData.path" :related-file-path="pathList" :name="nameList"
                 :detail-data="detailData"
                 @finish="getAsset(detailData.path)"/>
    <down-load-list-dialog :visible.sync="visibleDown" :list="relateds" :zip-name="detailData.showName"/>
  </el-drawer>
</template>

<script>
import { baseUrl } from '@/utils'
import dayjs from 'dayjs'
import '@/utils/filter'
import { downloadByGet } from '@/api'
import { assetDetail, checkRelated, searchPopularTag } from '@/api/api'
import selectDialog from '@/components/SelectDialog/SelectDialog'
import listDialog from '@/components/ListDialog/ListDialog'
import DownLoadListDialog from '@/components/DownLoadListDialog/DownLoadListDialog'
import { mapState } from 'pinia'
import zteStore from '@/store'

export default {
  name: 'DetailDrawer',
  components: {
    selectDialog,
    listDialog,
    DownLoadListDialog
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
      return this.relateds.length === 0
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
      return tag => tag ? tag.split(';').map(e => tags[e] || e) : ''
    }
  },
  data () {
    return {
      baseUrl,
      visible: false,
      visibleList: false,
      visibleDown: false,
      isExpiresDisabled: false,
      pathList: '',
      nameList: '',
      topBtn: [
        {
          icon: 'el-icon-edit',
          className: 'top-edit',
          show: false,
          label: '编辑'
        }, {
          icon: 'el-icon-info',
          className: 'top-attribute',
          show: true,
          label: '属性'
        }, {
          icon: 'el-icon-position',
          className: 'top-move',
          show: true,
          label: '移动'
        }, {
          icon: 'el-icon-paperclip',
          className: 'top-paperclip',
          show: false,
          label: '相关'
        }, {
          icon: 'el-icon-scissors',
          className: 'top-scissors',
          show: false,
          label: '取消关联'
        }
      ],
      index: 0,
      relatedData: {},
      detailData: {},
      relateds: [],
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
      if (results.metadata && 'prism:expirationDate' in results.metadata) {
        this.isExpiresDisabled = dayjs().isAfter(dayjs(results.metadata['prism:expirationDate']))
      } else {
        this.isExpiresDisabled = false
      }
      if (Object.keys(results.related || {}).length) {
        let arr = []
        for (const key in results.related) {
          arr = [...arr, { ...results.related[key] }]
        }
        this.relateds = arr
      } else {
        this.relateds = []
      }
      // if (results.metadata['dc:downloadManagement']) {
      //   const res = await detailByAssetId(results.metadata['dc:downloadManagement'])
      //   this.relatedData = { ...res.results }
      // }
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
      if (this.relateds.length === 1) {
        const [flag] = this.relateds
        await downloadByGet(`${flag['sling:resource']}`, flag.showName)
      } else {
        this.visibleDown = true
      }
      // await downloadByGet(`${this.relatedData.path}`, this.relatedData.name)
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
.detail-wrap {
  top: 64px;
  height: 100%;
  background: #F7F8FA;

  /deep/ .el-drawer__body {
    overflow: hidden;
    background: #F7F8FA;
  }

  .drawer-top {
    background-color: #ffffff;
    border-bottom: 1px solid #D8D8D8;

    .drawer-top-cnt {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 40px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      width: 1314px;
      max-width: 100%;
      margin: 0 auto;
      height: 64px;
    }

    .top-btn {
      display: flex;

      .btn {
        display: inline-block;
        height: 32px;
        border-radius: 16px;
        line-height: 32px;
        padding: 0 12px 0 36px;
        cursor: pointer;
        position: relative;
        -webkit-transition: .3s ease-out;
        transition: .3s ease-out;
        margin-right: 12px !important;
        font-size: 16px;
        color: #222222;

        &:hover {
          background: #ECFAFF;
        }

        i {
          display: inline-block;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);

          &:before {
            display: none;
          }
        }

        &.top-attribute {
          i {
            width: 30px;
            height: 27px;
            left: 6px;
            background: url("../../assets/home/attribute.png") no-repeat center;
            background-size: cover;
          }
        }

        &.top-move {
          i {
            width: 28px;
            height: 26px;
            left: 7px;
            background: url("../../assets/home/move.png") no-repeat center;
            background-size: cover;
          }
        }

        &.top-paperclip {
          i {
            width: 27px;
            height: 25px;
            left: 7px;
            background: url("../../assets/home/association.png") no-repeat center;
            background-size: cover;
          }
        }

        &.top-scissors {
          display: none;

          i {
            width: 26px;
            height: 25px;
            left: 7px;
            background: url("../../assets/home/scissors.png") no-repeat center;
            background-size: cover;
          }
        }
      }
    }

    .detail-close {
      height: 32px;
      line-height: 32px;
      border-radius: 16px;
      opacity: 1;
      border: 1px solid #999999;
      padding: 0 24px;
      text-align: center;
      font-size: 14px;
      color: #666666;
      min-width: 80px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;
      -webkit-transition: .3s ease-out;
      transition: .3s ease-out;
      cursor: pointer;

      &:hover {
        background: #ECFAFF;
        color: #000000;
        border-color: #ECFAFF;
      }
    }
  }

  .drawer-bottom-wrap {
    height: calc(100vh - 128px);
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-thumb {
      background: #ccc;
      border-radius: 5px;
    }

    .drawer-bottom {
      width: 1314px;
      max-width: 100%;
      margin: 42px auto 0;
      padding: 0 40px;
      -webkit-box-sizing: border-box;
      box-sizing: border-box;

      .drawer-bottom-cnt {
        background: #ffffff;
        border-radius: 32px 32px 0 0;
        overflow: hidden;
        padding: 2.2917vw 1.6667vw 2.2917vw 2.8125vw;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        position: relative;

        .info-title {
          flex: 1;
          font-size: 24px;
          line-height: 28px;
          color: #3D3D3D;
          font-weight: 700;
        }

        .info-last {
          display: flex;
          align-items: center;

          .prve-btn {
            font-size: 14px;
            color: #008ED3;
            line-height: 20px;
            padding-left: 20px;
            position: relative;
            cursor: pointer;
            margin-right: 48px;

            .el-icon-arrow-left {
              position: absolute;
              top: 50%;
              left: 0;
              font-size: 14px;
              transform: translateY(-50%);
            }

            &.disable {
              color: #666666;
              cursor: default;
              pointer-events: none;
            }
          }

          .next-btn {
            font-size: 14px;
            color: #008ED3;
            line-height: 20px;
            padding-right: 20px;
            position: relative;
            cursor: pointer;
            -webkit-transition: .3s ease-out;
            transition: .3s ease-out;

            .el-icon-arrow-right {
              position: absolute;
              top: 50%;
              right: 0;
              font-size: 14px;
              transform: translateY(-50%);
            }

            &.disable {
              color: #666666;
              cursor: default;
              pointer-events: none;
            }
          }
        }
      }

      .info-content {
        min-height: calc(100vh - 234px - 2.2917vw);
        display: flex;
        overflow: hidden;
        padding-top: 36px;

        .info-img {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          box-sizing: border-box;
          padding-right: 2.2917vw;

          /deep/ .el-image {
            width: 100%;
            height: 100%;

            img {
              max-height: 500px;
            }
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
          width: 260px;
          color: #323232;
          font-size: 14px;
          display: flex;
          flex-direction: column;

          .info-label {
            font-weight: bold;
          }

          .info-btn {
            display: flex;
            align-items: center;
            margin: 0 -5px;

            /deep/ .el-button {
              -webkit-box-flex: 0;
              -webkit-flex: 0 0 50%;
              -ms-flex: 0 0 50%;
              flex: 0 0 50%;
              max-width: 50%;
              padding: 0;
              margin: 0;
              border: 0;
              background: transparent;
              box-sizing: border-box;
              padding: 0 5px;

              span {
                display: block;
                height: 40px;
                border-radius: 20px;
                background: #008ED3;
                font-size: 15px;
                line-height: 40px;
                color: #ffffff;
                box-sizing: border-box;
              }

              &.associated-download {
                span {
                  border: 1px solid #008ED3;
                  background: #ECFAFF;
                  color: #222222;
                }
              }
            }
          }

          .list-item {
            line-height: 1.8rem;
            font-size: 14px;

            .info-list-title {
              font-size: 24px;
              font-weight: 500;
              color: #3D3D3D;
              line-height: 28px;
            }

            .info-list-label {
              ul {
                margin: 0;
                padding: 20px 0 0;
                list-style: none;

                &:empty {
                  display: none;
                }

                li {
                  display: inline-block;
                  padding: 4px 12px 4px 0;

                  span {
                    display: inline-block;
                    height: 28px;
                    line-height: 28px;
                    background: #F2F3F5;
                    border-radius: 2px;
                    opacity: 1;
                    border: 1px solid #F2F3F5;
                    padding: 0 8px;
                    font-size: 14px;
                    color: #444444;
                    font-weight: 400;
                  }
                }
              }
            }

            .item-ul {
              padding-top: 24px;

              .item-li {
                display: flex;
                line-height: 0;
                margin-bottom: 24px;

                &:last-child {
                  margin-bottom: 0;
                }

                &.dec-wrap {
                  align-items: center;
                }

                span {
                  font-size: 14px;
                  line-height: 20px;
                  color: #444444;
                }

                .item-li-title {
                  -webkit-box-flex: 100px;
                  -webkit-flex: 0 0 100px;
                  -ms-flex: 0 0 100px;
                  flex: 0 0 100px;
                  max-width: 100px;
                  font-size: 14px;
                  font-weight: 700;
                  color: #999999;
                  line-height: 20px;
                }
              }
            }
          }
        }
      }
    }
  }
}

/deep/ .video-js .vjs-big-play-button {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.el-dialog__wrapper {
  z-index: 2222 !important;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.5);

  /deep/ .el-dialog__body {
    .content {
      height: calc(83vh - 6.25rem);

      .first-column {
        display: flex;
        align-items: center;
        line-height: 0;
      }
    }
  }
}
</style>
