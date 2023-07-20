<template>
  <div class="container home-tab">
    <div class="row-item" v-loading="loadings.recommendLoading">
      <div class="row-top">
        <div class="home-tab-title">精选推荐</div>
        <el-tabs v-model="tabs.recommend" class="tab" @tab-click="handleTab('recommend')">
          <el-tab-pane class="tab-pane" v-for="item in tabList" :key="item.key" :label="item.label">
          </el-tab-pane>
        </el-tabs>
        <div class="more" @click="handleMore('recommend')">更多></div>
      </div>
      <div :class="['row-content',tabsData.recommendData.length===0?'row-empty-content':'']">
        <template v-if="tabsData.recommendData.length">
          <template v-if="tabs.recommend==='0'">
            <div class="image-content">
              <div v-for="img in tabsData.recommendData" :key="img.assetId" class="img" @click="handleJump(img)">
                <img
                  :src="`${baseUrl}${img.renditions.original}`"
                  :alt="img.name"/>
                <div class="title double-line"
                     v-if="tabs.recommend==='3'">{{
                    `${img.metadata && 'dc:title' in img.metadata ? img.metadata['dc:title'] : img.name}`
                  }}
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="tabs.recommend==='1'">
            <div class="video-content">
              <div class="video-item" v-for="(video,vidx) in tabsData.recommendData" :key="video.assetId"
                   @click="handleJump(video)">
                <video width="100%" height="100%" preload="metadata" notSupportedMessage="此视频暂无法播放，请稍后再试"
                       :poster="`${(video.metadata && 'dc:coverImage' in video.metadata)? video.metadata['dc:coverImage'].startsWith('http') ? video.metadata['dc:coverImage'] : `${baseUrl}${video.metadata['dc:coverImage']}` : ''}`"
                       @canplay="handleVideoLoad('recommendData',vidx,video)"
                       :ref="video.assetId">
                  <source :src="`${baseUrl}${video.path}`">
                </video>
                <div class="video-title">
                  <div>{{
                      `${video.metadata && 'dc:title' in video.metadata ? video.metadata['dc:title'] : video.name}`
                    }}
                  </div>
                  <div>{{ video.duration }}</div>
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="tabs.recommend==='2'||tabs.recommend==='3'">
            <div class="video-content">
              <div class="video-item" v-for="music in tabsData.recommendData" :key="music.assetId"
                   @click="handleJump(music)">
                <img style="width: 100%;height: 100%;"
                     :src="`${baseUrl}${music.metadata&&'dc:coverImage' in music.metadata?music.metadata['dc:coverImage']:music.renditions.original}`"
                     :alt="music.name"/>
                <div v-if="tabs.recommend==='2'" class="video-title double-line">
                  <audio preload="meta" @canplay="handleMusicLoad('recommendData',music)"
                         :ref="music.assetId">
                    <source :src="`${baseUrl}${music.path}`"/>
                  </audio>
                  <div>{{
                      `${music.metadata && 'dc:title' in music.metadata ? music.metadata['dc:title'] : music.name}`
                    }}
                  </div>
                  <div>{{ music.duration }}</div>
                </div>
                <div v-else class="video-title">
                  {{
                    `${music.metadata && 'dc:title' in music.metadata ? music.metadata['dc:title'] : music.name}`
                  }}
                </div>
              </div>
            </div>
          </template>
        </template>
        <div v-else class="empty-content">
          <img src="../../assets/home/empty.png"/>
          <span>暂无文件</span>
        </div>
      </div>
    </div>
    <div class="row-item" v-loading="loadings.downloadLoading">
      <div class="row-top">
        <div class="home-tab-title">下载热榜</div>
        <el-tabs v-model="tabs.download" class="tab" @tab-click="handleTab('download')">
          <el-tab-pane class="tab-pane" v-for="item in tabList" :key="item.key" :label="item.label">
          </el-tab-pane>
        </el-tabs>
        <div class="more" @click="handleMore('download')">更多></div>
      </div>
      <div :class="['row-content',tabsData.downloadData.length===0?'row-empty-content':'']">
        <template v-if="tabsData.downloadData.length">
          <template v-if="tabs.download==='0'">
            <div class="image-content">
              <div v-for="img in tabsData.downloadData" :key="img.assetId" class="img" @click="handleJump(img)">
                <img
                  :src="`${baseUrl}${img.renditions.original}`"
                  :alt="img.name"/>
                <div class="title double-line"
                     v-if="tabs.download==='3'">{{
                    `${img.metadata && 'dc:title' in img.metadata ? img.metadata['dc:title'] : img.name}`
                  }}
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="tabs.download==='1'">
            <div class="video-content">
              <div class="video-item" v-for="(video,vidx) in tabsData.downloadData" :key="video.assetId"
                   @click="handleJump(video)">
                <video width="100%" height="100%" preload="metadata" notSupportedMessage="此视频暂无法播放，请稍后再试"
                       :poster="`${(video.metadata && 'dc:coverImage' in video.metadata)? video.metadata['dc:coverImage'].startsWith('http') ? video.metadata['dc:coverImage'] : `${baseUrl}${video.metadata['dc:coverImage']}` : ''}`"
                       @canplay="handleVideoLoad('downloadData',vidx,video)"
                       :ref="video.assetId">
                  <source :src="`${baseUrl}${video.path}`">
                </video>
                <div class="video-title">
                  <div>{{
                      `${video.metadata && 'dc:title' in video.metadata ? video.metadata['dc:title'] : video.name}`
                    }}
                  </div>
                  <div>{{ video.duration }}</div>
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="tabs.download==='2'||tabs.download==='3'">
            <div class="video-content">
              <div class="video-item" v-for="music in tabsData.downloadData" :key="music.assetId"
                   @click="handleJump(music)">
                <img style="width: 100%;height: 100%;"
                     :src="`${baseUrl}${music.metadata&&'dc:coverImage' in music.metadata?music.metadata['dc:coverImage']:music.renditions.original}`"
                     :alt="music.name"/>
                <div v-if="tabs.download==='2'" class="video-title double-line">
                  <audio preload="meta" @canplay="handleMusicLoad('downloadData',music)"
                         :ref="music.assetId">
                    <source :src="`${baseUrl}${music.path}`"/>
                  </audio>
                  <div>{{
                      `${music.metadata && 'dc:title' in music.metadata ? music.metadata['dc:title'] : music.name}`
                    }}
                  </div>
                  <div>{{ music.duration }}</div>
                </div>
                <div v-else class="video-title">
                  {{
                    `${music.metadata && 'dc:title' in music.metadata ? music.metadata['dc:title'] : music.name}`
                  }}
                </div>
              </div>
            </div>
          </template>
        </template>
        <div v-else class="empty-content">
          <img src="../../assets/home/empty.png"/>
          <span>暂无文件</span>
        </div>
      </div>
    </div>
    <div class="row-item" v-loading="loadings.newsLoading">
      <div class="row-top">
        <div class="home-tab-title">最新上传</div>
        <el-tabs v-model="tabs.news" class="tab" @tab-click="handleTab('news')">
          <el-tab-pane class="tab-pane" v-for="item in tabList" :key="item.key" :label="item.label">
          </el-tab-pane>
        </el-tabs>
        <div class="more" @click="handleMore('news')">更多></div>
      </div>
      <div :class="['row-content',tabsData.newsData.length===0?'row-empty-content':'']">
        <template v-if="tabsData.newsData.length">
          <template v-if="tabs.news==='0'">
            <div class="image-content">
              <div v-for="img in tabsData.newsData" :key="img.assetId" class="img" @click="handleJump(img)">
                <img
                  :src="`${baseUrl}${img.renditions.original}`"
                  :alt="img.name"/>
                <div class="title double-line"
                     v-if="tabs.news==='3'">{{
                    `${img.metadata && 'dc:title' in img.metadata ? img.metadata['dc:title'] : img.name}`
                  }}
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="tabs.news==='1'">
            <div class="video-content">
              <div class="video-item" v-for="(video,vidx) in tabsData.newsData" :key="video.assetId"
                   @click="handleJump(video)">
                <video width="100%" height="100%" preload="metadata"
                       :poster="`${(video.metadata && 'dc:coverImage' in video.metadata)? video.metadata['dc:coverImage'].startsWith('http') ? video.metadata['dc:coverImage'] : `${baseUrl}${video.metadata['dc:coverImage']}` : ''}`"
                       @canplay="handleVideoLoad('newsData',vidx,video)"
                       :ref="video.assetId">
                  <source :src="`${baseUrl}${video.path}`">
                </video>
                <div class="video-title">
                  <div class="double-line">{{
                      `${video.metadata && 'dc:title' in video.metadata ? video.metadata['dc:title'] : video.name}`
                    }}
                  </div>
                  <div>{{ video.duration }}</div>
                </div>
              </div>
            </div>
          </template>
          <template v-else-if="tabs.news==='2'||tabs.news==='3'">
            <div class="video-content">
              <div class="video-item" v-for="music in tabsData.newsData" :key="music.assetId"
                   @click="handleJump(music)">
                <img style="width: 100%;height: 100%;"
                     :src="`${baseUrl}${music.metadata&&'dc:coverImage' in music.metadata?music.metadata['dc:coverImage']:music.renditions.original}`"
                     :alt="music.name"/>
                <div v-if="tabs.news==='2'" class="video-title double-line">
                  <audio preload="meta" @canplay="handleMusicLoad('newsData',music)"
                         :ref="music.assetId">
                    <source :src="`${baseUrl}${music.path}`"/>
                  </audio>
                  <div>{{
                      `${music.metadata && 'dc:title' in music.metadata ? music.metadata['dc:title'] : music.name}`
                    }}
                  </div>
                  <div>{{ music.duration }}</div>
                </div>
                <div v-else class="video-title">
                  {{
                    `${music.metadata && 'dc:title' in music.metadata ? music.metadata['dc:title'] : music.name}`
                  }}
                </div>
              </div>
            </div>
          </template>
        </template>
        <div v-else class="empty-content">
          <img src="../../assets/home/empty.png"/>
          <span>暂无文件</span>
        </div>
      </div>
    </div>
    <detail-drawer :drawer.sync="detailDrawer" :all-detail-data="[detailData]" :detail="detailData"/>
  </div>
</template>

<script>
// import Macy from 'macy'
import { gallery, video, font, music, baseUrl, defaultBreadcrumb, types } from '@/utils'
import { getTree, searchAsset } from '@/api/api'
import { downloadByGet } from '@/api'
import detailDrawer from '@/components/DetailDrawer/DetailDrawer'
import '@/utils/filter'
import { mapActions, mapState } from 'pinia'
import zteStore from '@/store'

export default {
  name: 'HomeTab',
  components: {
    detailDrawer
  },
  computed: {
    ...mapState(zteStore, ['breadcrumb', 'allTreeData'])
  },
  data () {
    const fileType = {
      0: types.image,
      1: types.video,
      2: types.music,
      3: types.font
    }
    return {
      loading: false,
      tabList: [gallery, video, music, font],
      tab: 0,
      contentData: [],
      content: {},
      baseUrl,
      detailDrawer: false,
      detailData: {},
      pathItem: '',
      tabs: {
        recommend: '0',
        download: '0',
        news: '0'
      },
      tabsData: {
        recommendData: [],
        downloadData: [],
        newsData: []
      },
      loadings: {
        recommendLoading: false,
        downloadLoading: false,
        newsLoading: false
      },
      fileType
    }
  },
  methods: {
    ...mapActions(zteStore, ['setSelected', 'setBreadcrumb']),
    formatTime (time) {
      if (time === 0) return '00:00'
      const h = parseInt(time / 3600)
      const minute = parseInt(time / 60 % 60)
      const second = Math.ceil(time % 60)
      const hours = h < 10 ? '0' + h : h
      const formatSecond = second > 59 ? 59 : second
      return `${hours > 0 ? `${hours}:` : ''}${minute < 10 ? '0' + minute : minute}:${formatSecond < 10 ? '0' + formatSecond : formatSecond}`
    },
    tableRowClassName ({ rowIndex }) {
      if (rowIndex % 2 === 0) {
        return 'even-row'
      } else if (rowIndex % 2 === 1) {
        return 'odd-row'
      }
      return ''
    },
    handleVideoLoad (key, vidx, video) {
      const { assetId } = video
      this.$set(this.tabsData[key], vidx, {
        ...video,
        duration: this.formatTime(parseInt(this.$refs[assetId][0].duration))
      })
    },
    handleMusicLoad (key, row) {
      const { assetId } = row
      this.$set(this.tabsData[key], this.tabsData[key].findIndex(e => e.assetId === assetId), {
        ...row,
        duration: this.formatTime(parseInt(this.$refs[assetId][0].duration))
      })
    },
    handleDownLoad (scope) {
      const {
        row: {
          name,
          path
        }
      } = scope
      downloadByGet(`${baseUrl}${path}`, name)
    },
    handleTab (type) {
      type === 'recommend' && this.handleGetRecommendData()
      type === 'download' && this.handleGetDownloadData()
      type === 'news' && this.handleGetNewsData()
    },
    async getTabContent () {
      this.loading = true
      const { items } = await getTree(this.tabList[this.tab].url)
      if (items.length) {
        const res = items.filter(e => e.icon === 'folder').map(e => ({
          ...e,
          key: e.id.substring(e.id.lastIndexOf('/') + 1, e.id.length)
        }))
        this.contentData = [...res]
        try {
          const total = await Promise.all([...res.map(e => searchAsset({
            parentPath: e.path,
            orderBy: 'metadata/dc:sort',
            sortOrder: 'ASC',
            limit: 6,
            offset: 0
          }))])
          total.map(e => e.results.records).forEach((item, index) => {
            const flag = this.contentData[index]
            this.$set(this.contentData, index, {
              ...flag,
              imgData: item
            })
            // item.length && this.tab === '0' && this.$nextTick(() => {
            //   this.content[`${flag.key}`] = new Macy({
            //     container: `#${flag.key}`,
            //     trueOrder: true,
            //     waitForImages: false,
            //     useOwnImageLoader: false,
            //     debug: true,
            //     columns: 3,
            //     margin: {
            //       y: 16,
            //       x: 16
            //     },
            //     breakAt: {
            //       992: 1
            //     }
            //   })
            // })
          })
        } finally {
          this.loading = false
        }
        // res.map(async (e, idx) => {
        //   const { results: { records } } = await searchAsset({
        //     parentPath: e.path,
        //     orderBy: 'metadata/dc:sort',
        //     sortOrder: 'ASC',
        //     limit: 6,
        //     offset: 0
        //   })
        //   const flag = this.contentData[idx]
        //   this.$set(this.contentData, idx, {
        //     ...flag,
        //     imgData: records
        //   })
        //   records.length && this.tab === '0' && this.$nextTick(() => {
        //     this.content[`${e.key}`] = new Macy({
        //       container: `#${e.key}`,
        //       trueOrder: true,
        //       waitForImages: false,
        //       useOwnImageLoader: false,
        //       debug: true,
        //       columns: 3,
        //       margin: {
        //         y: 16,
        //         x: 16
        //       },
        //       breakAt: {
        //         992: 1
        //       }
        //     })
        //   })
        // })
      } else {
        this.contentData = []
        this.loading = false
      }
    },
    handleJump (row) {
      this.detailData = row
      this.detailDrawer = true
      // this.pathItem = path
      // this.infoDrawer = true
      // const { path } = this.$route
      // this.$router.push({
      //   path,
      //   query: {
      //     path: row.path
      //   }
      // })
    },
    handleFolder (data) {
      const {
        path,
        title
      } = data
      const [{ nodes }] = this.allTreeData
      const flag = {
        0: 'copyright-images',
        1: 'copyright-video',
        2: 'copyright-fonts',
        3: 'copyrighted-music'
      }
      const second = nodes.find(e => e.name === flag[this.tab])
      this.setBreadcrumb([...defaultBreadcrumb, {
        title: second.title,
        id: second.path
      }, {
        title,
        id: path
      }])
      this.setSelected(path)
    },
    async handleGetRecommendData () {
      try {
        this.loadings.recommendLoading = true
        const { results: { records } } = await searchAsset({
          parentPath: this.tabList[this.tabs.recommend].url,
          recommend: 'true',
          orderBy: 'metadata/dc:sort',
          sortOrder: 'ASC',
          limit: 8,
          offset: 0,
          fileType: this.fileType[this.tabs.recommend]
        })
        this.tabsData.recommendData = records
      } finally {
        this.loadings.recommendLoading = false
      }
    },
    async handleGetDownloadData () {
      try {
        this.loadings.downloadLoading = true
        const { results: { records } } = await searchAsset({
          parentPath: this.tabList[this.tabs.download].url,
          orderBy: 'jcr:content/metadata/dc:download',
          sortOrder: 'DESC',
          limit: 8,
          offset: 0,
          fileType: this.fileType[this.tabs.download]
        })
        this.tabsData.downloadData = records
      } finally {
        this.loadings.downloadLoading = false
      }
    },
    async handleGetNewsData () {
      try {
        this.loadings.newsLoading = true
        const { results: { records } } = await searchAsset({
          parentPath: this.tabList[this.tabs.news].url,
          orderBy: 'jcr:created',
          sortOrder: 'DESC',
          limit: 8,
          offset: 0,
          fileType: this.fileType[this.tabs.news]
        })
        this.tabsData.newsData = records
      } finally {
        this.loadings.newsLoading = false
      }
    },
    init () {
      this.handleGetRecommendData()
      this.handleGetDownloadData()
      this.handleGetNewsData()
    },
    handleMore (key) {
      const { path } = this.$route
      const flag = {
        0: 'image',
        1: 'video',
        2: 'music',
        3: 'font'
      }
      const base = {
        search: '',
        keywords: '',
        pathInput: this.tabList[this.tabs[key]].url,
        fileType: flag[this.tabs[key]]
      }
      const query = key === 'recommend' ? {
        ...base,
        recommend: 'true'
      } : key === 'download' ? {
        ...base,
        sort: 'download'
      } : {
        ...base,
        sort: 'upload'
      }
      this.$router.push({
        path,
        query
      })
      // pathInput
      // if (key === 'recommend') {
      //   sessionStorage.setItem('recommend', 'true')
      // }
      // const [{ nodes }] = this.allTreeData
      // const second = nodes.find(e => e.path === this.tabList[this.tabs[key]].url)
      // this.setBreadcrumb([...defaultBreadcrumb, {
      //   title: second.title,
      //   id: second.path
      // }])
      // this.setSelected(second.path)
    }
  },
  created () {
    // this.getTabContent()
    this.init()
  }
}
</script>

<style scoped lang="scss">
.name {
  cursor: pointer;
  font-weight: normal;
  font-style: normal;
  font-size: .8125rem;
  line-height: 1.0625rem;
  color: #323232;
}

.name:hover {
  text-decoration: underline;
}

/deep/ .el-table {
  margin-bottom: 24px;
}

/deep/ .el-table__body .odd-row {
  background: #FFFFFF;
}

/deep/ .el-table__body .even-row {
  background: #f2f2f2;
}

.home-tab {
  padding: 56px 24px 0;
  position: relative;
  flex-direction: column;

  .row-item {
    margin-bottom: 48px;

    .row-top {
      display: flex;
      align-items: flex-end;
      margin-bottom: 24px;

      .home-tab-title {
        font-size: 32px;
        line-height: 38px;
        color: #3D3D3D;
      }

      .tab-pane {
        display: none;
        min-height: 400px;

        /deep/ .image-ul {
          .image-li {
            padding-bottom: 40px;
          }
        }
      }

      .download {
        font-size: 24px;
        cursor: pointer;
      }

      .tab {
        width: auto;
        flex: 1;
        height: 100%;
        margin-left: 26px;

        /deep/ .el-tabs__header {
          //padding-left: 138px;
          // margin-bottom: 1.25vw;
          margin: 0;

          .el-tabs__nav-wrap {
            margin-bottom: -8px;

            &:after {
              display: none;
            }

            .el-tabs__nav {
              .el-tabs__active-bar {
                display: none;
              }

              .el-tabs__item {
                font-size: 16px;
                color: #222222;
                height: 30px;
                line-height: 30px;
                padding: 0 16px;
                margin: 8px 8px;
                border-radius: 15px;
                -webkit-transition: .3s ease-out;
                transition: .3s ease-out;

                &.is-active {
                  background: #ECFAFF;
                  color: #008ED3;
                }

                &:nth-child(2) {
                  margin-left: 0;
                }
              }
            }
          }
        }

        /deep/ .el-tabs__content {
          overflow: initial;
        }

        .desc {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 1.25vw;

          .title {
            font-weight: bold;
            font-size: 18px;
            margin-right: 12px;
          }

          .more-text {
            cursor: pointer;
            font-size: 16px;
            color: #444444;
            line-height: 18px;
            //position: absolute;
            //top: -46px;
            //right: 0;
            padding-right: 24px;
            position: relative;

            &:after {
              content: '';
              display: inline-block;
              width: 18px;
              height: 18px;
              background: url("../../assets/home/more-arrow.png") no-repeat center;
              position: absolute;
              top: 1px;
              right: 0;
              -webkit-transition: .3s ease-out;
              transition: .3s ease-out;
            }

            &:hover:after {
              right: -4px;
            }
          }

          .more-text:hover {
            color: #000000;
          }
        }

        .video-content {
          display: grid;
          grid-template-columns: repeat(4, calc(25% - 0.9375vw));
          grid-row-gap: 1.25vw;
          grid-column-gap: 1.25vw;

          .video-item {
            position: relative;
            height: 12.5vw;
            border-radius: 0.8333vw;
            overflow: hidden;
            line-height: 0;

            video {
              object-fit: fill;
            }

            .video-title {
              position: absolute;
              bottom: 1px;
              left: 0;
              color: #FFFFFF;
              padding: 8px 24px;
              display: flex;
              justify-content: space-between;
              width: 100%;
              box-sizing: border-box;
              background: rgba(0, 0, 0, 0.3);
              line-height: 20px;
            }
          }
        }
      }

      .more {
        cursor: pointer;
      }
    }

    .row-empty-content {
      min-height: 400px;
      display: flex;
      align-items: center;
      justify-content: center;

      .empty-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        img {
          width: 78px;
          height: 78px;
        }

        span {
          font-size: 14px;
          font-weight: 400;
          color: #3D3D3D;
        }
      }
    }

    .row-content {
      padding-bottom: 40px;

      .img {
        overflow: hidden;
        cursor: pointer;
        height: 235px;
      }

      .img img {
        display: block;
        object-fit: cover;
        width: 100%;
        height: 100%;
        transition: all .6s;
      }

      .img:hover img {
        transform: scale(1.1);
      }

      .image-content {
        display: grid;
        grid-template-columns: repeat(4, calc(25% - 0.9375vw));
        grid-row-gap: 1.25vw;
        grid-column-gap: 1.25vw;
        //grid-template-rows: 12.5vw;

        .img {
          height: 12.5vw;
          border-radius: 0.8333vw;
          overflow: hidden;
          position: relative;

          .title {
            position: absolute;
            bottom: 30px;
            padding: 0 18px;
            width: 100%;
            font-weight: 500;
            color: #666666;
            font-size: 18px;
            line-height: 24px;
            box-sizing: border-box;
          }

          .double-line {
            word-break: break-all;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
        }
      }

      .video-content {
        display: grid;
        grid-template-columns: repeat(4, calc(25% - 0.9375vw));
        grid-row-gap: 1.25vw;
        grid-column-gap: 1.25vw;

        .video-item {
          position: relative;
          height: 12.5vw;
          border-radius: 0.8333vw;
          overflow: hidden;
          line-height: 0;
          cursor: pointer;

          video {
            object-fit: fill;
          }

          .double-line {
            word-break: break-all;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }

          .video-title {
            position: absolute;
            bottom: 1px;
            left: 0;
            color: #FFFFFF;
            padding: 8px 24px;
            display: flex;
            justify-content: space-between;
            width: 100%;
            box-sizing: border-box;
            background: rgba(0, 0, 0, 0.3);
            line-height: 20px;
          }
        }
      }
    }
  }
}
</style>
