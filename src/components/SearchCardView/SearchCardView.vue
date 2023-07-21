<template>
  <div>
    <div class="card-container" v-if="flagData.length">
      <template v-for="(item,index) in flagData">
        <template v-if="item.nodeType === 'sling:OrderedFolder'||item.nodeType==='sling:Folder'">
          <div class="card-folder-item" @click="handleFolder(item,$event)" :key="index">
            <div class="folder-item">
              <div class="folder-item-img">
                <lazy-load
                  :src="`${baseUrl}${item.renditions && 'folder' in item.renditions? item.renditions.folder:''}`"
                  :alt="item.name"
                  @error="handleError('folder',$event)"/>
                <div v-if="showCheckBox" :class="['check-box',item.select?'show-check-box':'']">
                  <el-checkbox v-model="item.select" label="" @change="handleSelect(item,$event)"/>
                </div>
              </div>
              <div class="folder-name ellipsis-one">
                {{
                  item.properties && 'jcr:title' in item.properties && item.properties['jcr:title'] ? item.properties['jcr:title'] : item.name
                }}
              </div>
            </div>
          </div>
        </template>
        <template v-else-if="fileShowType(item.metadata['dc:format'])==='image'">
          <div class="card-item" @click="handleAsset($event,item)" :key="index">
            <lazy-load :src="`${baseUrl}${item?.renditions?.original}`" :alt="item.title"/>
            <div v-if="showCheckBox" :class="['check-box',item.select?'show-check-box':'']">
              <el-checkbox v-model="item.select" label="" @change="handleSelect(item,$event)"/>
            </div>
            <div class="card-item-title">
              <span>{{
                  item.metadata && 'dc:title' in item.metadata ? item.metadata['dc:title'] || item.name : item.name
                }}</span>
            </div>
          </div>
        </template>
        <template v-else-if="fileShowType(item.metadata['dc:format'])==='file'">
          <div class="card-item file-item normal-item"
               @click="handleAsset($event,item)"
               :key="index">
            <lazy-load :src="fileIcon" :alt="item.title"/>
            <div v-if="showCheckBox" :class="['check-box',item.select?'show-check-box':'']">
              <el-checkbox v-model="item.select" label="" @change="handleSelect(item,$event)"/>
            </div>
            <div class="card-item-title">
            <span style="color: #3D3D3D;">{{
                item.metadata && 'dc:title' in item.metadata ? item.metadata['dc:title'] || item.name : item.name
              }}</span>
            </div>
          </div>
        </template>
        <template
          v-else-if="fileShowType(item.metadata['dc:format'])==='music'||fileShowType(item.metadata['dc:format'])==='font'">
          <div :class="['card-item',fileShowType(item.metadata['dc:format'])==='music'?'music-item':'font-item']"
               :key="index" @click="handleAsset($event,item)">
            <lazy-load :src="`${baseUrl}${item.metadata['dc:coverImage']}`" :alt="item.title"
                       @error="handleError(fileShowType(item.metadata['dc:format'])==='music'?'music':'font',$event)"/>
            <div v-if="showCheckBox" :class="['check-box',item.select?'show-check-box':'']">
              <el-checkbox v-model="item.select" label="" @change="handleSelect(item,$event)"/>
            </div>
            <div class="card-item-title">
            <span>{{
                item.metadata && 'dc:title' in item.metadata ? item.metadata['dc:title'] || item.name : item.name
              }}</span>
            </div>
          </div>
        </template>
        <template v-else-if="fileShowType(item.metadata['dc:format'])==='video'">
          <div class="card-item" :key="index"
               @click="handleAsset($event,item)">
            <div
              style="position: absolute;width: 100%;height: 100%;z-index: 50;top: 0;left: 0;display: flex;align-items: center;justify-content: center;font-size: 3em;color: #FFFFFF">
              <i style="position: absolute;" class="el-icon-video-play"/>
              <img alt="poster" @error="handleVideoError" class="video-img"
                   :src="`${(item.metadata && 'dc:coverImage' in item.metadata)? item.metadata['dc:coverImage'].startsWith('http') ? item.metadata['dc:coverImage'] : `${baseUrl}${item.metadata['dc:coverImage']}` : ''}`"/>
            </div>
            <!--            <video-player style="width: 100%;height: 100%;"-->
            <!--                          :options="videoOptions(item)"/>-->
            <video width="100%" height="100%;" style="object-fit: cover;" preload="metadata">
              <source :src="`${baseUrl}${item.path}`">
              <span>此视频暂无法播放，请稍后再试</span>
            </video>
            <div v-if="showCheckBox" :class="['check-box',item.select?'show-check-box':'']" style="z-index: 60;">
              <el-checkbox v-model="item.select" label="" @change="handleSelect(item,$event)"/>
            </div>
            <div class="card-item-title" style="z-index: 66;">
            <span>{{
                item.metadata && 'dc:title' in item.metadata ? item.metadata['dc:title'] || item.name : item.name
              }}</span>
            </div>
          </div>
        </template>
      </template>
    </div>
    <div v-else class="card-empty">
      <img alt="empty-icon" :src="emptyIcon"/>
      <span>暂无文件</span>
    </div>
  </div>
</template>

<script>
import { baseUrl, needType } from '@/utils'
import lazyLoad from '@/components/LazyLoad/LazyLoad'

export default {
  name: 'SearchCardView',
  components: {
    lazyLoad
  },
  computed: {
    fileShowType: function () {
      return type => {
        return needType[type]
      }
    },
    videoOptions: function () {
      return item => {
        return {
          poster: (item.metadata && 'dc:coverImage' in item.metadata) ? item.metadata['dc:coverImage'].startsWith('http') ? item.metadata['dc:coverImage'] : `${baseUrl}${item.metadata['dc:coverImage']}` : '',
          fluid: true,
          autoplay: false,
          sources: [{ src: `${baseUrl}${item.path}` }],
          muted: false,
          loop: false,
          preload: 'meta',
          notSupportedMessage: '此视频暂无法播放，请稍后再试'
        }
      }
    }
  },
  props: {
    listData: {
      type: Array,
      default: () => []
    },
    showCheckBox: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    listData: {
      handler (val) {
        this.flagData = val
      }
    }
  },
  data () {
    const emptyIcon = 'data:image/png;base64,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'
    const folderIcon = 'data:image/png;base64,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'
    const fileIcon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFsAAABiCAYAAAA/Q6/8AAAAAXNSR0IArs4c6QAABIBJREFUeF7t3N9LFFEUB/Dvndld19RMa4t+0I/nggg1sM2MnvqxGhFBz70E0WNPQT0UQf9C/0LgQ9tGT5XWLkhFf4P0kJD9kKx03Z25MdKKica9d+6cmdHj873nzHzmcPbOD68A/5EJCLJMnAiMTVgEjM3YhAKEqbiyGZtQgDAVVzZjEwoQpuLKZmxCAcJUXNmMTShAmIorm7EJBQhTcWUzNqEAYSqubMYmFCBMxZXN2IQChKkirexiZWYUwHUBnHLbOzoRw1u4A7kGTm+d67t2dO8HQtc1U0WCXSx/2i+c7LjI5A7J5mKs53gw7+H8LuBb3eu72R8vuHXs4rOZfsfNvpPNRqzIreQH8z7Obm8AmQxmYwa3in2yMtsDx/sG308EdHAQS9g7GvAl4MQMbhV76OmXF1LIM4mRXoUdHFec4NawT4x9OpDd1jPlzf9MkvU/ld06sLjArWEXKzN3hBD3IGXiseOqcGvYQ5WZJxIIlnqJ+lvZs1cfGHWFW8MuVj6/FhBDiZJeo2fHCb7psSlbCmP/LXWKlsLYK/pK1OCMvaqJRwm+4bH3tPm4WGjA01iRRgW+4bGDwr2xr46mBnZUP5obHjswPtblYbC7qVXdUYBveOwALWghhzs8DHR76M5IQLHKJSTcTBY+5PGrR3a/C3sPsSmwW0gNCWSCh1GaZ+0KOTl+YecgY4cVUJv/ploqnFIbuv4ozWu8fqCk3q6HBfo7n7EtQaqEYWwVJUtjGNsSpEoYxlZRsjSGsS1BqoRhbBUlS2MY2xKkShjGVlGyNIaxLUGqhEk/tshk4eTyIPv8QQj4iwsw+DQu5dgS89J1L9fO9z5XKS1bY4rlz+eEEGMQaNeImV5sJ9cGp1EfGL9QeK9xwtaGDpenB2S+462/WFeNmV5sd0sXJs7krT0EUxVbOW745YL0fs+pTk0vNle26jVeZ5z2I1bu2ebi2tgAeDVi6G2CbZgqjmnp7dlxaIXMmX5sbiOGJaDdRvgH0lAagA42L/3MnZdm6mDzTQ0hNlc2IfZSKu7Z5uI6baSVhVcjht4m2Iap4piW/nV2HGqGOdOPbdRGgrctC78gaf8/PuXYhj+QVx5Ld3rL11tONvfQbyg//Dcs6OVp6cW2sfQrVr48EAK3id5fphfbxk3NYHl6ONvWMU5U3enF5soO2dW0l37cs83FtbFN39TwakTvQZT5JY1tZnp7dmxkpomlrFZHdobe3sPatxtJ3dzF1PefeRKV6khhJGwsa9hJ3bYoLBCEgJTybq1UuB82ljXspG7IFRbIbe9E/cfsoclLu6fCxrKGHRxIEreaCwskgVe1UsHK9nlWsZO4iWIYbOE4kL7bWy1t+x4mzvLzextBVsZI2vagpucnMjn43uJAzeKXtlYru3ViSdr4Vhd7CblZn4LfHK6N7vmoO/9/4yPBXkZPwJbOqlje/M9fApjwgUe1UqGsOk9nXKTYOgeyGcYyNuFVZmzGJhQgTMWVzdiEAoSpuLIZm1CAMBVXNmMTChCm4spmbEIBwlRc2YTYfwDyAa2BErJQjAAAAABJRU5ErkJggg=='
    const musicIcon = 'data:image/png;base64,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'
    const fontIcon = 'data:image/png;base64,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'

    return {
      emptyIcon,
      fileIcon,
      folderIcon,
      musicIcon,
      fontIcon,
      baseUrl,
      flagData: []
    }
  },
  methods: {
    handleFolder (row, event) {
      const flag = event.target
      if (flag.classList.contains('el-checkbox__inner') || flag.classList.contains('el-checkbox__original') || flag.classList.contains('el-checkbox')) return
      this.$emit('clickFolder', row)
    },
    handleError (type, event) {
      type === 'folder' && (event.target.src = this.folderIcon)
      type === 'folder' && event.target.classList.add('error-icon')
      type === 'music' && (event.target.src = this.musicIcon)
      type === 'music' && event.target.classList.add('error-music-icon')
      type === 'font' && (event.target.src = this.fontIcon)
      type === 'font' && event.target.classList.add('error-music-icon')
    },
    handleAsset (event, row) {
      const flag = event.target
      if (flag.classList.contains('el-checkbox__inner') || flag.classList.contains('el-checkbox__original') || flag.classList.contains('el-checkbox')) return
      this.$emit('clickAsset', row)
    },
    handleSelect (row, val) {
      this.$emit('select', {
        row,
        val
      })
    },
    handleVideoError (error) {
      error.target.style.display = 'none'
    }
  }
}
</script>

<style lang="scss" scoped>
.card-container {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, 23.6%);
  grid-row-gap: 1.25vw;
  grid-column-gap: 1.25vw;
  //padding-bottom: 80px;

  .card-folder-item {
    position: relative;
    height: 13vw;
    font-weight: 500;
    color: #666666;
    font-size: 18PX;
    padding: 18PX 18PX 0;
    border-radius: 16PX;
    background: #F2F3F5;
    box-sizing: border-box;

    .folder-item {
      display: flex;
      flex-direction: column;
      height: 100%;

      .folder-item-img {
        border-radius: 8px;
        width: 100%;
        height: 9.2vw;
        overflow: hidden;
        display: flex;
      }

      /deep/ .folder-item-img img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: all .6s;
      }

      /deep/ .folder-item-img img:hover {
        transform: scale(1.1);
      }

      /deep/ .folder-item-img .error-icon {
        width: 88PX;
        height: 80PX;
        margin: auto;
        transition: none;
      }

      /deep/ .folder-item-img .error-icon:hover {
        transform: none;
      }

      .folder-name {
        margin: auto 0;
        word-break: break-word;
      }
    }

    .check-box {
      position: absolute;
      top: 12px;
      left: 12px;
      border-radius: 4px;
      width: 24PX;
      height: 24PX;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      background: rgba(34, 34, 34, 0.36);
      display: none;

      /deep/ .el-checkbox__inner {
        border: 1px solid #222222;
        background: rgba(255, 255, 255, 0.6329);
        height: 16PX;
        width: 16PX;
        border-radius: 2px;
      }

      /deep/ .el-checkbox__input.is-checked .el-checkbox__inner {
        background-color: #008ED3;
      }

      /deep/ .el-checkbox__inner::after {
        top: 2px;
        left: 5px;
      }
    }

    .show-check-box {
      display: flex;
    }
  }

  .card-folder-item:hover .check-box,
  .card-item:hover .check-box {
    display: flex;
  }

  .card-item {
    overflow: hidden;
    border-radius: 16PX;
    height: 13vw;
    position: relative;

    /deep/ .video-js.vjs-fluid {
      height: 100%;
    }

    /deep/ .video-js .vjs-tech {
      object-fit: cover;
    }

    /deep/ .vjs-poster {
      background-size: cover;
    }

    /deep/ .video-js .vjs-big-play-button {
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }

    .card-item-title {
      position: absolute;
      box-sizing: border-box;
      padding: 0 24PX;
      color: #FFFFFF;
      font-weight: 500;
      font-size: 16PX;
      bottom: 18PX;
      display: flex;
      flex-wrap: wrap;
      word-break: break-word;
    }

    .check-box {
      position: absolute;
      top: 12px;
      left: 12px;
      border-radius: 4px;
      width: 24PX;
      height: 24PX;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      background: rgba(34, 34, 34, 0.36);
      display: none;

      /deep/ .el-checkbox__inner {
        border: 1px solid #222222;
        background: rgba(255, 255, 255, 0.6329);
        height: 16PX;
        width: 16PX;
        border-radius: 2px;
      }

      /deep/ .el-checkbox__input.is-checked .el-checkbox__inner {
        background-color: #008ED3;
      }

      /deep/ .el-checkbox__inner::after {
        top: 2px;
        left: 5px;
      }
    }

    .show-check-box {
      display: flex;
    }
  }

  .error-music-icon {
    width: 84PX !important;
    height: 86PX !important;
    margin: auto;
    transition: none !important;
  }

  .error-music-icon:hover {
    transform: none !important;
  }

  .error-music-icon ~ .card-item-title {
    color: #3D3D3D !important;
  }

  .file-item {
    background-color: #E7F8FF;
    display: flex;
  }

  .music-item {
    background-color: #FFF8E5;
    display: flex;
  }

  .font-item {
    background-color: rgba(218, 252, 211, 0.2);
    display: flex;
  }

  /deep/ .card-item img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    display: block;
    transition: all .6s;
  }

  /deep/ .card-item img:hover {
    transform: scale(1.1);
  }

  .video-img:hover {
    transform: none !important;
  }

  /deep/ .normal-item img {
    object-fit: cover;
    width: auto;
    height: auto;
    transition: none;
    margin: auto;
  }

  /deep/ .normal-item img:hover {
    transform: none;
  }

  .card-folder-item:hover,
  .card-item:hover {
    cursor: pointer;
  }
}

.card-empty {
  display: flex;
  flex-direction: column;
  font-size: 14px;
  font-weight: 400;
  color: #3D3D3D;
  align-items: center;
  margin: 10.4vw 0;

  img {
    width: 78PX;
    height: 78PX;
  }
}

.ellipsis-one {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
