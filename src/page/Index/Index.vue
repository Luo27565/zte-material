<template>
  <div class="material-library">
    <header-nav class="hear-nav"></header-nav>
    <div class="container">
      <left-side class="aside" @show-home="showHome" v-if="infoDrawer===false"></left-side>
      <div class="content" :class="selected?'manage-wrap':''" v-if="infoDrawer===false">
        <template v-if="selected">
          <manage-content/>
        </template>
        <template v-else>
          <home-top class="header"/>
          <home-tab/>
        </template>
        <!--      <el-footer style="flex-shrink: 0">© 2022 中兴通讯股份有限公司 版权所有</el-footer>-->
      </div>
      <info-drawer :drawer.sync="infoDrawer"/>
      <search-drawer :drawer.sync="searchDrawer"/>
    </div>
  </div>
</template>

<script>
import HeaderNav from '@/components/Header/Header'
import LeftSide from '@/components/LeftSide/LeftSide'
import HomeTop from '@/components/HomeTop/HomeTop'
import HomeTab from '@/components/HomeTab/HomeTab'
import ManageContent from '@/components/ManageContent/ManageContent'
import InfoDrawer from '@/components/InfoDrawer/InfoDrawer'
import SearchDrawer from '@/components/SearchDrawer/SearchDrawer'
import zteStore from '@/store'
import { mapActions, mapState } from 'pinia'

export default {
  name: 'Index',
  components: {
    HeaderNav,
    LeftSide,
    HomeTop,
    HomeTab,
    ManageContent,
    InfoDrawer,
    SearchDrawer
  },
  computed: {
    ...mapState(zteStore, ['selected', 'breadcrumb'])
  },
  data () {
    return {
      infoDrawer: false,
      searchDrawer: false
    }
  },
  methods: {
    ...mapActions(zteStore, ['resetSelected']),
    showHome () {
      this.resetSelected()
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler: function (newVal) {
        const { query } = newVal
        this.infoDrawer = 'path' in query
        this.searchDrawer = 'search' in query
      }
    }
  }
}
</script>

<style scoped lang="scss">

.container {
  display: flex;

  .aside {
    width: 20%;
    max-height: calc(100vh - 64px);
    overflow-y: auto;
  }

  .aside::-webkit-scrollbar {
    width: 6px;
  }

  .aside::-webkit-scrollbar-thumb {
    background: #ccc; // 滑块颜色
    border-radius: 5px; // 滑块圆角
  }

  .content {
    width: calc(100% - 20%);
    height: calc(100vh - 64px);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    //justify-content: space-between;

    .header {
      height: calc(36vh + 50px);
      flex-shrink: 0;
      background: url('../../assets/home/background.jpg') no-repeat center;
      background-size: cover;
    }
  }

  .manage-wrap {
    overflow: hidden;
  }
}

/deep/ .el-header, .el-main {
  padding: 0;
}

/deep/ .el-footer {
  background-color: rgb(215, 215, 215);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
<style lang="scss">
.el-message {
  z-index: 5000 !important;
}

.el-image-viewer__wrapper {
  z-index: 3103 !important;
}

.el-aside::-webkit-scrollbar {
  width: 10px;
}

.el-aside::-webkit-scrollbar-thumb {
  background: #ccc; // 滑块颜色
  border-radius: 5px; // 滑块圆角
}

.el-picker-panel {
  z-index: 2222 !important;
}

.el-drawer__wrapper {
  top: 64px;
}

.el-tooltip__popper {
  z-index: 50001 !important;
}

.my-popper {
  background-color: rgb(250, 115, 105) !important;
  color: #222222 !important;
}

.el-tooltip__popper[x-placement^=bottom] .popper__arrow:after {
  border-bottom-color: rgb(250, 115, 105);
}

.el-tooltip__popper[x-placement^=bottom] .popper__arrow {
  border-bottom-color: rgb(250, 115, 105);
}

.delete-asset-btn {
  background-color: rgb(220, 85, 75) !important;
  border-color: rgb(220, 85, 75) !important;
}
</style>
