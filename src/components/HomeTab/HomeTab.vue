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
                   :style="{background:tabs.download==='2'?'#FFF8E5':'rgba(218,252,211,0.2)'}"
                   @click="handleJump(music)">
                <img style="width: 100%;height: 100%;"
                     :src="`${baseUrl}${music.metadata&&'dc:coverImage' in music.metadata?music.metadata['dc:coverImage']:music.renditions.original}`"
                     @error="handleError(tabs.download==='2'?'music':'font',$event)"
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
                       @canplay="handleVideoLoad('downloadData',vidx,video)" @error="handleVideoError"
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
                   :style="{background:tabs.download==='2'?'#FFF8E5':'rgba(218,252,211,0.2)'}"
                   @click="handleJump(music)">
                <img style="width: 100%;height: 100%;"
                     :src="`${baseUrl}${music.metadata&&'dc:coverImage' in music.metadata?music.metadata['dc:coverImage']:music.renditions.original}`"
                     @error="handleError(tabs.download==='2'?'music':'font',$event)"
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
                   :style="{background:tabs.download==='2'?'#FFF8E5':'rgba(218,252,211,0.2)'}"
                   @click="handleJump(music)">
                <img style="width: 100%;height: 100%;"
                     :src="`${baseUrl}${music.metadata&&'dc:coverImage' in music.metadata?music.metadata['dc:coverImage']:music.renditions.original}`"
                     @error="handleError(tabs.download==='2'?'music':'font',$event)"
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
    const musicIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFQAAABWCAYAAABRo7HKAAAAAXNSR0IArs4c6QAABhNJREFUeF7t3F1sFFUUB/D/uTPbLz4iJMpXLbvxKxREke22ICokFoIFrC8YNNGEmGCiLyaaKPGBBzX6ZEw0JiY+YIwh+qASMCppSkop3aVAEBOUGHYoalQ0KlJKtzv3mNm2hJbu7N3du+2we+d1z5yd+c25M3fuzFyCWbQKkNZsJhkMqOYiMKAGVLOA5nSmQg2oZgHN6UyFGlDNAprTmQo1oJoFNKczFWpANQtoTmcq1IBqFtCcriQVyrsgsHHxoyzEE8xoBjAfYKF523OmG7ZuvzxY17ZlzpIXDuYM1hSgHXSop/5u27Z3A7RC0zYWnGbIvgsDtVsGbAxtmipUraDDR8JrhYV9AM0oWEHjihnQunaA5ZShagPlI+GwtHEcTHM0mhSV6iqol2WKULWBykRkLwObixLQvPI40ClC1QI6lGhYapN1ChysJwDXgU4BqhbQ4d7wK0LQG5oLrOh0k4KWGFULqJsI7wHo8aIFNCfIClpCVC2gMhH5loFWzR5Fp/MFLRFqZYOWANWAakY1oGMnFk39VAN67ZlaA2pZg6bsCC7Vbc3v4lYkalmDStTgn1nPAWRPGWpZg3qKg1WrMFjzYH6gRVyoyh7Us7kSugdXqmOQYm5+sAU0/4oAvXohhw3Os/kTYb8dPb1J9UhUFKgqyrgLP/NXdrPTprquAc0hxQZUtZbU4gyompNylAFVplILNKBgCeA7gDqY5Wki0QLi7WAq6DF2hYJy0gMUwAHYg510328Xrq0/Nx55HYSdajU5PqpSQP8kQqdkHLDI7aCm/rN+WHw0EpOMuAEdFSDwZTB1M8kDgtCB/edO0i54TVtp4WOR5dLFSaXgCUFlVaEEHHIlXrNnJQ/SUqQKAcnclhtQT4HfFjHnRSL1SswGXvGgDO6xmpw1ROBCqpKT4Rr8xY0UPXfcVGhGkHdYMecDVUwGCH31y2Q6tIEFNhCwBkCNsNworew/VvEVKgQ/RlHnCz/Q/7rm31xbXd0K0HoS1ArGwonxAu7DFOvvMKCTgHIfQpDh1RLYAGA9gBWAf2fdgI6W2LUVyj31i6QdehOMdhBmqp4GvDgDOgGUO8M1cgb9CKAhH8ixWAM6ETSx8FaJ6nPwLjoFLAZ0Auhg38KGKpkBLWgxoAZ0RED323djFyVToQU1zOtXMqCa3w8tGJSRJgGHOXP/HxFwN5qOvdd/HO3YKzV5xiUQfyhd+Zl9vv8obR0ZleLD825BLbE32GzulBRBGeiyZOpJavnlZ7+zjQFVACVCnC5YD9EjPw3lOnVXEChLBnWSxNeC+FRaSFdIWi6YE9TS3+3X5MdGknJhZpp/InyvBJ1QiZ0Yc8OM2BO4h8jdQU3nv8+2o1lBGX+IWHK+6ngp9y1uk1LsK19Q5o9OWM4z0SiG/XbSB/R3EUsuUAUt5rOfwFcoA4etgeRaWod0rorxa/Ku5FVVLU5vrhxuPPwsiN7PFZft98CDSkEPhKJnu1V2kOOL7pRU5Y02TbacEYJaKXq2f7IfMyNVdfC+3H+p0JccMuffQL8sRhgSl5IzVarT25l0PPIUEXb74P8L8DsC+BwidQYhl4Yv1y6zLG4DaDtAi1QOnG+XK8igBKRpgGfROudKrh3lnvpaadnHQLQkV+zI75lXcADKnFkLGu6btNKDDOptsCA8T03J93yronfubJdmf0pE3uOOaV2C3eRHaFKA3CnmhN6lO8Z3yvmbeTPcm2q2CSFeZcbiaZUc/fMbAXTM6SIxdzPgXVTqmOg2AlZ6j3+DADm2DTcSaJDcsm6LAdV8mKYFtJg7Ec37X4J0vMeKOdtUE2vpXgR1igxVBN845petZuct1VxaQIM6iYsqgk8cizQ30mrnB9VcWkC9PwviNEOqCNniiPlL0ey055NHG2gQJ8LKB+K6WOK/UylaUXt/Mq/3ArSBehsUtKnaigC9KIHNoViyK98cWkG9P+fehkYpxMdBmEwwX4yReD4uyH3ab+DbL6920MwmjZ/uMgZgwXRMd6kEyuR9wfQrgLiU/IkVc/YW8xp6SUCVdqRMgwyo5gNrQA2oZgHN6UyFGlDNAprTmQrVDPo/obVGk95FMhEAAAAASUVORK5CYII='
    const fontIcon = 'data:image/png;base64,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'

    return {
      musicIcon,
      fontIcon,
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
    },
    handleError (type, event) {
      event.target.src = type === 'music' ? this.musicIcon : this.fontIcon
      event.target.classList.add('error-icon')
    },
    handleVideoError (event) {
      console.log(event)
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
            display: flex;
            align-items: center;
            justify-content: center;

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
          display: flex;
          align-items: center;
          justify-content: center;

          .error-icon {
            height: auto !important;
            width: auto !important;
          }

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
