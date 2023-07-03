<template>
  <div class="container home-tab">
<!--    <div class="home-tab-title">精选推荐</div>-->
    <el-tabs v-model="tab" class="tab" @tab-click="handleTab">
      <el-tab-pane class="tab-pane" v-for="item in tabList" :key="item.key" :label="item.label">
        <div class="image-ul" v-loading="loading" element-loading-text="加载中">
          <el-empty v-if="contentData&&contentData.length===0" description="暂无数据"
                    image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"></el-empty>
          <div class="image-li" v-for="(element,index) in contentData" :key="element.id">
            <template v-if="element.imgData&&element.imgData.length">
              <div class="desc">
                <span class="title">{{ element.title }}</span>
                <span v-if="element.desc">{{ element.desc }}</span>
                <div @click="handleFolder(element)" class="more-text">更多</div>
              </div>
              <template v-if="element.imgData">
                <el-empty v-if="element.imgData.length===0" description="暂无数据"
                          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"></el-empty>
                <div v-else :id="element.key" :class="[tab==='0'?'image-content':'']">
                  <template v-if="tab==='0'">
                    <div v-for="img in element.imgData" :key="img.assetId" class="img" @click="handleJump(img)">
                      <img
                        :src="`${baseUrl}${img.renditions.original}`"
                        :alt="img.name"/>
                    </div>
                  </template>
                  <template v-else-if="tab==='1'">
                    <div class="video-content">
                      <div class="video-item" v-for="(video,vidx) in element.imgData" :key="video.assetId"
                           @click="handleJump(video)">
                        <video width="100%" height="100%" preload="metadata"
                               :poster="`${(video.metadata && 'dc:coverImage' in video.metadata)? video.metadata['dc:coverImage'].startsWith('http') ? video.metadata['dc:coverImage'] : `${baseUrl}${video.metadata['dc:coverImage']}` : ''}`"
                               @canplay="handleVideoLoad(index,vidx,video)"
                               :ref="video.assetId">
                          <source :src="`${baseUrl}${video.path}`" :type="video.metadata['dc:format']">
                        </video>
                        <div class="video-title">
                          <div>{{ video.name|formatName }}</div>
                          <div>{{ video.duration }}</div>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else-if="tab==='2'||tab==='3'">
                    <el-table
                      :show-header="false"
                      :data="element.imgData"
                      :row-class-name="tableRowClassName"
                      style="width: 100%">
                      <el-table-column>
                        <template slot-scope="scope">
                          <div class="name" @click="handleJump(scope.row)">{{ scope.row.name|formatName }}</div>
                        </template>
                      </el-table-column>
                      <el-table-column v-if="tab==='3'" align="center">
                        <template slot-scope="scope">
                          <audio preload="meta" @canplay="handleMusicLoad(index,scope.row)"
                                 :ref="scope.row.assetId">
                            <source :src="`/aem${scope.row.path}`"/>
                          </audio>
                          <span>{{ scope.row.duration }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column align="center">
                        <template slot-scope="scope">
                          <span v-if="scope.row.metadata">{{ scope.row.metadata['dam:size']|formatSize }}</span>
                        </template>
                      </el-table-column>
                      <el-table-column align="center">
                        <template slot-scope="scope">
                          <i title="下载" class="el-icon-download download" @click="handleDownLoad(scope)"></i>
                        </template>
                      </el-table-column>
                    </el-table>
                  </template>
                </div>
              </template>
            </template>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
    <div class="more" v-if="false">更多></div>
    <detail-drawer :drawer.sync="detailDrawer" :all-detail-data="[detailData]" :detail="detailData"/>
  </div>
</template>

<script>
// import Macy from 'macy'
import { gallery, video, font, music, baseUrl, defaultBreadcrumb } from '@/utils'
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
    return {
      loading: false,
      tabList: [gallery, video, font, music],
      tab: 0,
      contentData: [],
      content: {},
      baseUrl,
      detailDrawer: false,
      detailData: {},
      pathItem: ''
    }
  },
  methods: {
    ...mapActions(zteStore, ['setSelected', 'setBreadcrumb']),
    formatTime (time) {
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
    handleVideoLoad (index, vidx, video) {
      const { assetId } = video
      this.$set(this.contentData[index].imgData, vidx, {
        ...video,
        duration: this.formatTime(parseInt(this.$refs[assetId][0].duration))
      })
    },
    handleMusicLoad (index, row) {
      const { assetId } = row
      this.$set(this.contentData[index].imgData, this.contentData[index].imgData.findIndex(e => e.assetId === assetId), {
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
    handleTab () {
      this.getTabContent()
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
    }
  },
  created () {
    this.getTabContent()
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

  .home-tab-title {
    font-size: 32px;
    line-height: 38px;
    color: #3D3D3D;
    position: absolute;
    top: 56px;
    left: 24px;
  }

  .tab-pane {
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
    width: 100%;
    height: 100%;

    /deep/ .el-tabs__header {
      //padding-left: 138px;
      margin-bottom: 1.25vw;

      .el-tabs__nav-wrap {
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
          bottom: 3px;
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
    position: absolute;
    right: 24px;
    top: 20px;
    cursor: pointer;
  }
}
</style>
