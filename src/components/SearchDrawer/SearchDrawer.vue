<template>
  <el-drawer :title="title" @open="init" :visible="drawer" :with-header="withHeader" :destroy-on-close="destroyOnClose"
             :direction="direction" :size="size" class="search-box">
    <div class="search-box-wrap">
      <div class="search-location">
        <div class="path">
          <div class="path-title">搜索位置</div>
          <div class="input-wrap">
            <el-input class="input" v-model="pathInput" ref="pathInput" @keyup.enter.native="handleEnter"
                      @blur="handleTags('pathInput')"
                      placeholder="选择搜索目录"/>
            <div class="icon" @click="openFolder"><i class="el-icon-folder-opened"/></div>
          </div>
          <el-tag v-for="item in tags" effect="dark" closable :key="item.value" @close="deleteTags(item.type)">
            {{ item.title }} {{ item.label }}
          </el-tag>
        </div>
        <el-select v-show="false" class="select" v-model="showSelect" @change="handleTags('showSelect')">
          <el-option
            v-for="item in showOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value">
          </el-option>
        </el-select>
        <el-collapse v-show="false">
          <el-collapse-item title="文件类型" name="1">
            <template slot="title">
              <div class="search-filter-label">文件类型</div>
            </template>
            <div class="search-filter-item">
              <el-checkbox-group
                v-model="searchForm.fileType">
                <el-checkbox v-for="item in fileTypeOptions" :label="item.value" :key="item.value">
                  {{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-collapse-item>
          <el-collapse-item title="人像" name="2">
            <template slot="title">
              <div class="search-filter-label">人像</div>
            </template>
            <div class="search-filter-item">
              <div>人像有无</div>
              <el-select v-model="searchForm.portrait" class="search-select" clearable placeholder="">
                <el-option
                  v-for="item in portraitOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
              <div>模特图像公开</div>
              <el-select v-model="searchForm.minorModelImageDisclosure" class="search-select" clearable placeholder="">
                <el-option
                  v-for="item in minorModelImageDisclosureOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </el-collapse-item>
          <el-collapse-item title="资产授权状态" name="3">
            <template slot="title">
              <div class="search-filter-label">资产授权状态</div>
            </template>
            <div class="search-filter-item">
              <el-select v-model="searchForm.propertyReleaseStatus" class="search-select" clearable placeholder="">
                <el-option
                  v-for="item in propertyReleaseStatusOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </el-collapse-item>
          <el-collapse-item title="来源" name="4">
            <template slot="title">
              <div class="search-filter-label">来源</div>
            </template>
            <div class="search-filter-item">
              <el-select v-model="searchForm.source" class="search-select" clearable placeholder="">
                <el-option
                  v-for="item in sourceOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </div>
          </el-collapse-item>
          <el-collapse-item title="授权范围" name="5">
            <template slot="title">
              <div class="search-filter-label">授权范围</div>
            </template>
            <div class="search-filter-item">
              <el-checkbox-group
                v-model="searchForm.authorizationScope">
                <el-checkbox v-for="item in authorizationScopeCheckBox" :label="item.value" :key="item.value">
                  {{ item.label }}
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </el-collapse-item>
          <el-collapse-item title="授权期限" name="6">
            <template slot="title">
              <div class="search-filter-label">授权期限</div>
            </template>
            <div class="search-filter-item">
              <div>结束与以下时间之后</div>
              <el-date-picker
                class="search-select"
                v-model="searchForm.authorizationDurationStart"
                type="datetime"
                placeholder="">
              </el-date-picker>
              <div>结束与以下时间之前</div>
              <el-date-picker
                class="search-select"
                v-model="searchForm.authorizationDurationEnd"
                type="datetime"
                placeholder="">
              </el-date-picker>
            </div>
          </el-collapse-item>
          <el-collapse-item title="修改时间" name="7">
            <template slot="title">
              <div class="search-filter-label">修改时间</div>
            </template>
            <div class="search-filter-item">
              <div>修改与以下时间之后</div>
              <el-date-picker
                class="search-select"
                v-model="searchForm.updateTimeStart"
                type="datetime"
                placeholder="">
              </el-date-picker>
              <div>修改与以下时间之前</div>
              <el-date-picker
                class="search-select"
                v-model="searchForm.updateTimeEnd"
                type="datetime"
                placeholder="">
              </el-date-picker>
              <div>创建与以下时间之后</div>
              <el-date-picker
                class="search-select"
                v-model="searchForm.startTime"
                type="datetime"
                placeholder="">
              </el-date-picker>
              <div>创建与以下时间之前</div>
              <el-date-picker
                class="search-select"
                v-model="searchForm.endTime"
                type="datetime"
                placeholder="">
              </el-date-picker>
            </div>
          </el-collapse-item>
        </el-collapse>
      </div>
      <div class="search-box-cnt">
        <div class="drawer-top">
          <div class="drawer-top-content">
<!--            <el-tag v-for="item in tags" effect="dark" closable :key="item.value" style="margin-right: .5rem"-->
<!--                    @close="deleteTags(item.type)">-->
<!--              {{ item.title }} {{ item.label }}-->
<!--            </el-tag>-->
            <el-input class="input" v-model="search" @keyup.enter.native=handleSearch clearable
                      placeholder="请输入"></el-input>
            <el-button type="primary" @click="handleSearch"><i class="el-icon-search"/>
            </el-button>
          </div>
          <div class="top-btn">
<!--            <el-button type="primary" @click="handleSearch">搜索<i class="el-icon-search" style="margin-left: 8px"/>-->
<!--            </el-button>-->
            <el-dropdown class="btn" v-show="showBtn" @command="handleCommand">
              <el-button class="search-operate" type="primary">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="item in settingBtn" :key="item.icon" :icon="item.icon" v-show="item.show"
                                  :command="item.icon">
                  {{ item.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-button class="search-close" type="primary" @click="closeSearch">关闭搜索</el-button>
          </div>
        </div>
        <div class="info-item">
<!--          <div class="info-search" @click="showSearch=!showSearch">-->
<!--            <i class="el-icon-set-up"/>{{ showSearch ? '筛选器' : '' }}-->
<!--          </div>-->
<!--          <div class="info-title">-->
<!--            搜索结果-->
<!--          </div>-->
          <div class="info-message">
            <div class="all-select" v-permission="assetRole" @click="handleAllSelect">
              <i class="el-icon-circle-check"/>
              全选
            </div>
<!--            <div class="total">{{ viewData.length }}/{{ total }}</div>-->
            <i :class="[viewType,'viewType']" :title="viewType === 'el-icon-s-grid' ? '列表视图' : '卡片视图'"/>
            <!--        <i :class="[viewType,'viewType']" :title="viewType === 'el-icon-s-grid' ? '列表视图' : '卡片视图'"-->
            <!--           @click="viewType = viewType === 'el-icon-s-grid' ? 'el-icon-picture' : 'el-icon-s-grid'"/>-->
          </div>
        </div>
        <div class="info-content" v-loading="loading" element-loading-text="加载中..."
             element-loading-spinner="el-icon-loading"
             element-loading-background="rgba(0, 0, 0, 0.8)">
          <div class="container" :style="{width:showSearch?'calc(100% - 15.625rem)':'100%'}">
            <TableView :show-select="assetRole" :table-data="viewData" @onScroll="handleSearch" @selected="handleBtn"
                       :total="total"
                       ref="table"></TableView>
          </div>
        </div>
        <div style="display: none" v-html="errorData"></div>
      </div>
    </div>
    <select-folder-dialog :visible.sync="showFolderSelect" @finish="setPathInput"></select-folder-dialog>
    <el-dialog width="320px" title="删除资产" :visible.sync="dialogDeleteFolderVisible" @open="handleDeleteDialog"
               :modal-append-to-body="false" :append-to-body="true">
      <div style="color: #222222">{{ deleteTitle }}</div>
      <p style="max-height: 180px;overflow: auto;color: #222222" v-html="deleteContent"></p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogDeleteFolderVisible = false">取 消</el-button>
        <el-button type="danger" :loading="deleteLoading"
                   @click="deleteAsset">删 除</el-button>
      </span>
    </el-dialog>
  </el-drawer>
</template>

<script>
import {
  showOptions,
  fileTypeOptions,
  authorizationScopeCheckBox,
  portraitOptions,
  minorModelImageDisclosureOptions, propertyReleaseStatusOptions, sourceOptions, defaultBreadcrumb
} from '@/utils'
import SelectFolderDialog from '@/components/SelectFolderDialog/SelectFolderDialog'
import TableView from '@/components/TableView/TableView'
import { command, searchAsset, searchPopularTag } from '@/api/api'
import zteStore from '@/store'
import { mapState } from 'pinia'

export default {
  name: 'SearchDrawer',
  components: {
    SelectFolderDialog,
    TableView
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
    }
  },
  computed: {
    ...mapState(zteStore, ['assetRole'])
  },
  data () {
    return {
      showBtn: false,
      settingBtn: [{
        icon: 'el-icon-delete',
        label: '删除',
        show: true
      }, {
        icon: 'el-icon-copy-document',
        label: '复制'
      }, {
        icon: 'el-icon-position',
        label: '移动'
      }, {
        icon: 'el-icon-info',
        label: '属性',
        show: true
      }, {
        icon: 'el-icon-edit-outline',
        label: '编辑'
      }, {
        icon: 'el-icon-edit',
        label: '临时编辑'
      }
      ],
      search: '',
      showSearch: false,
      viewType: 'el-icon-s-grid',
      pathInput: '',
      showSelect: 'fileAndFolder',
      showOptions,
      fileTypeOptions,
      authorizationScopeCheckBox,
      portraitOptions,
      minorModelImageDisclosureOptions,
      propertyReleaseStatusOptions,
      sourceOptions,
      tags: [],
      showFolderSelect: false,
      searchForm: {
        fileType: [],
        authorizationScope: [],
        portrait: '',
        minorModelImageDisclosure: '',
        propertyReleaseStatus: '',
        source: '',
        authorizationDurationStart: '',
        authorizationDurationEnd: '',
        updateTimeStart: '',
        updateTimeEnd: '',
        startTime: '',
        endTime: ''
      },
      total: 0,
      viewData: [],
      offset: 0,
      loading: false,
      dialogDeleteFolderVisible: false,
      deleteTitle: '',
      deleteContent: '',
      deleteLoading: false,
      tagsData: {},
      errorData: ''
    }
  },
  methods: {
    init () {
      const {
        query: {
          search,
          keywords
        }
      } = this.$route
      const {
        label,
        value
      } = fileTypeOptions.find(e => e.value === search)
      search && (this.tags = [{
        type: 'url',
        label,
        value
      }])
      this.search = keywords
      this.handleSearch()
    },
    async handleSearch (first = true) {
      first && (this.offset = 0);
      (first && !!this.$refs.table) && (this.$refs.table.disabled = false)
      this.loading = true
      try {
        const {
          results: {
            records,
            total
          }
        } = await searchAsset({
          name: this.search,
          parentPath: this.pathInput || defaultBreadcrumb[0].id,
          fileType: this.tags.some(e => e.type === 'url') ? fileTypeOptions.find(e => e.value === this.tags.find(i => i.type === 'url').value).type : '',
          offset: this.offset * 15,
          limit: 15
        })
        this.total = total
        this.$nextTick(() => {
          if (first) {
            this.viewData = [...records.map(e => ({
              ...e,
              tagsText: e.metadata && 'cq:tags' in e.metadata && e.metadata['cq:tags'] ? e.metadata['cq:tags'].split(';').map(i => this.tagsData[i]).filter(k => k).join(';') : ''
            }))]
          } else {
            this.viewData = [...this.viewData, ...records.map(e => ({
              ...e,
              tagsText: e.metadata && 'cq:tags' in e.metadata && e.metadata['cq:tags'] ? e.metadata['cq:tags'].split(';').map(i => this.tagsData[i]).filter(k => k).join(';') : ''
            }))]
          }
          this.viewData.length <= this.total && (this.offset = this.offset + 1)
        })
      } finally {
        this.loading = false
      }
    },
    closeSearch () {
      const { path } = this.$route
      this.$router.push({ path })
    },
    handleTags (type) {
      const flag = {
        showSelect: 'show',
        pathInput: 'path'
      }
      const text = {
        showSelect: '显示：',
        pathInput: '路径：'
      }
      if (type === 'showSelect' && this.showSelect === 'fileAndFolder') {
        this.tags = [...this.tags.filter(e => e.type !== 'show')]
        return
      }
      if (type === 'pathInput' && !this.pathInput) {
        return
      }
      this.tags = this.tags.some(e => e.type === flag[type]) ? [...this.tags.map(e => ({
        ...e,
        value: e.type === flag[type] ? this[type] : e.value,
        label: e.type === flag[type] ? type === 'showSelect' ? showOptions.find(i => i.value === this[type]).label : this[type] : e.label
      }))] : [...this.tags, {
        type: flag[type],
        title: text[type],
        value: this[type],
        label: type === 'showSelect' ? showOptions.find(i => i.value === this[type]).label : this[type]
      }]
      this.handleSearch()
    },
    deleteTags (type) {
      if (type === 'path' || type === 'show') {
        this.tags = [...this.tags.filter(e => e.type !== type)]
        type === 'path' && (this.pathInput = '')
        type === 'show' && (this.showSelect = 'fileAndFolder')
      }
      (type === 'url') && (this.tags = [...this.tags.filter(i => i.type !== 'url')])
      this.handleSearch()
    },
    openFolder () {
      this.showFolderSelect = true
    },
    setPathInput (path) {
      this.pathInput = path
      this.handleTags('pathInput')
    },
    handleAllSelect () {
      if (this.viewData.length === 0) return
      this.$refs.table.$refs.table.toggleAllSelection()
    },
    handleEnter () {
      this.$refs.pathInput.blur()
    },
    handleBtn (flag) {
      this.showBtn = flag
    },
    handleCommand (command) {
      // el-icon-delete
      // el-icon-info
      command === 'el-icon-delete' && (this.dialogDeleteFolderVisible = true)
      command === 'el-icon-info' && this.handleJump()
    },
    handleJump () {
      const { path } = this.$route
      if (this.$refs.table.$refs.table.selection.length > 1) {
        localStorage.removeItem('multipleData')
        localStorage.setItem('multipleData', JSON.stringify(this.$refs.table.$refs.table.selection))
      }
      const [flag] = this.$refs.table.$refs.table.selection
      this.$router.push({
        path,
        query: {
          path: this.$refs.table.$refs.table.selection.length === 1 ? flag.path : 'multipleData'
        }
      })
    },
    handleDeleteDialog () {
      const length = this.$refs.table.$refs.table.selection.length
      this.deleteTitle = length === 1 ? '您即将删除以下资产:' : `您即将删除以下 ${length} 个资产:`
      this.deleteContent = this.$refs.table.$refs.table.selection.map((e, index) => index + 1 === length ? `${e.properties['jcr:title'] || e.name}` : `${e.properties['jcr:title'] || e.name}<br>`).join('')
    },
    async deleteAsset () {
      this.deleteLoading = true
      try {
        const formData = new FormData()
        formData.append('cmd', 'deletePage')
        this.$refs.table.$refs.table.selection.forEach(e => {
          formData.append('path', e.path)
        })
        try {
          await command(formData)
          this.dialogDeleteFolderVisible = false
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          await this.handleSearch()
        } catch (e) {
          this.errorData = e
          this.$nextTick(() => {
            const message = (document.getElementById('Message').innerHTML).split('。')[0]
            this.$message({
              message: `${message}`,
              type: 'error'
            })
          })
        }
      } finally {
        this.deleteLoading = false
      }
    },
    async getTags () {
      const { results } = await searchPopularTag('/content/cq:tags/zte-asset-tags')
      this.tagsData = results
    }
  },
  mounted () {
    this.drawer && this.getTags()
    this.drawer && this.init()
  }
}
</script>

<style lang="scss" scoped>
.search-box {
  top: 64px;

  /deep/ .el-drawer__body {
    height: calc(100vh - 64px);
    overflow: hidden;
  }

  .search-box-wrap {
    display: flex;
    .search-location {
      -webkit-box-flex: 0;
      -webkit-flex: 0 0 304px;
      -ms-flex: 0 0 304px;
      flex: 0 0 304px;
      max-width: 304px;
      padding: 28px 20px;
      box-sizing: border-box;
      background: #F7F8FA;
      .path{
        .path-title {
          font-size: 14px;
          color: #3D3D3D;
          line-height: 20px;
          padding-left: 15px;
        }
        .input-wrap {
          margin-top: 16px;
          position: relative;
          /deep/ .el-input__inner {
            height: 40px;
            background: #FFFFFF;
            border-radius: 20px;
            border: 1px solid #CFD9E0;
            padding-right: 40px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
          .icon {
            width: 20px;
            height: 20px;
            background: url("../../assets/home/search-file.png") no-repeat center;
            background-size: cover;
            position: absolute;
            top: 50%;
            right: 15px;
            transform: translateY(-50%);
            cursor: pointer;

            i {
              display: none;
            }
          }
        }
        .el-tag--dark {
          margin-top: 16px;
          height: auto;
          background: #ECFAFF;
          border-radius: 50px;
          border: 1px solid #CDE6EF;
          font-size: 14px;
          color: #008ED3;
          line-height: 16px;
          white-space: break-spaces;
          position: relative;
          padding: 11px 30px 11px 12px;

          /deep/ .el-tag__close {
            position: absolute;
            top: 50%;
            right: 12px;
            color: #008ED3;
            transform: translateY(-50%);
            background: #ffffff;
          }
        }
      }
    }
    .search-box-cnt {
      width: calc(100% - 304px);
      padding: 0 20px;
      box-sizing: border-box;

      .drawer-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid #E7E7E7;
        padding: 12px 0;

        .drawer-top-content {
          flex: 1;
          display: flex;
          align-items: center;
          max-width: 40%;
          position: relative;

          /deep/ .el-tag {
            transition: none;
          }

          .input {
            flex: 1;
            color: #222222;

            /deep/ .el-input__suffix {
                right: 40px;

              .el-input__clear {
                font-size: 18px;
              }
            }
          }

          /deep/ .el-input__inner {
            height: 40px;
            border-radius: 20px;
            border: 1px solid #CFD9E0;
            padding-right: 70px;
          }

          .el-button {
            position: absolute;
            top: 50%;
            right: 4px;
            transform: translateY(-50%);
            height: 32px;
            border-radius: 16px;
            background: #ffffff;
            border: 0;

            &:hover {
              background: #ECFAFF;
            }

            i {
              display: inline-block;
              width: 24px;
              height: 24px;
              background: url("../../assets/home/nav-search.png") no-repeat center;
              position: absolute;
              top: 50%;
              right: 6px;
              transform: translateY(-50%);

              &:before {
                display: none;
              }
            }
          }
        }

        .top-btn {
          display: flex;

          .search-operate {
            background: transparent;
            padding: 0;
            margin: 0;
            border: 0;
            margin-left: 20px;

            /deep/ span {
              display: inline-block;
              height: 40px;
              border-radius: 20px;
              border: 1px solid #CFD9E0;
              font-size: 14px;
              line-height: 40px;
              color: #666666;
              padding: 0 18px;
              -webkit-transition: .3s ease-out;
              transition: .3s ease-out;
              box-sizing: border-box;

              &:hover {
                background: #ECFAFF;
                color: #008ED3;
              }
            }
          }

          .search-close {
            background: transparent;
            padding: 0;
            margin: 0;
            border: 0;
            margin-left: 20px;
            /deep/ span {
              display: inline-block;
              height: 40px;
              border-radius: 20px;
              border: 1px solid #CFD9E0;
              font-size: 14px;
              line-height: 40px;
              color: #666666;
              padding: 0 18px;
              -webkit-transition: .3s ease-out;
              transition: .3s ease-out;
              box-sizing: border-box;

              &:hover {
                background: #ECFAFF;
                color: #008ED3;
              }
            }
          }
        }
      }
    }
  }
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
  position: relative;

  .info-title {
    position: absolute;
    overflow: hidden;
    color: rgb(109, 109, 109);
    font-size: 1.125rem;
    font-weight: bold;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .info-search {
    display: flex;
    align-items: center;
    color: #6d6d6d;
    font-size: .9375rem;
    cursor: pointer;
    font-weight: 700;

    i {
      font-size: 20px;
      margin-right: .5rem;
    }
  }

  .info-search:hover {
    color: #323232;
  }

  .info-message {
    display: flex;
    justify-content: space-between;
    width: 100%;

    .all-select {
      display: flex;
      align-items: center;
      color: #6d6d6d;
      font-size: .9375rem;
      cursor: pointer;
      font-weight: 700;

      i {
        font-size: 20px;
        margin-right: .5rem;
      }
    }

    .all-select:hover {
      color: #323232;
    }

    .total {
      margin: 0 1.5rem;
      color: #6d6d6d;
      font-size: .9375rem;
      font-weight: 700;
    }

    .viewType {
      font-size: 20px;
      color: #6d6d6d;
      cursor: pointer;
    }

    .viewType:hover {
      color: #323232;
    }
  }
}

.info-content {
  height: calc(100vh - 3.25rem - 3rem);
  display: flex;

  .search {
    width: 15.625rem;
    flex-shrink: 0;
    background-color: rgb(240, 240, 240);
    transition: margin-left 0.5s ease 0s;
    overflow-y: auto;

    .path {
      display: flex;
      align-items: center;
      width: 100%;

      .input {
        flex: 1;
      }

      .icon {
        height: 2.375rem;
        width: 2.375rem;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        border-radius: 0 .25rem .25rem 0;
        border: .0625rem solid #d0d0d0;
        background-color: #fafafa;

        i {
          font-size: 20px;
          color: rgb(109, 109, 109);
        }
      }
    }

    .select {
      width: 100%;
      margin-top: .375rem;
    }

    .search-filter-label {
      order: 2;
      font-size: .8125rem;
      color: #323232;
      font-weight: 700;
    }

    .search-filter-item {
      background-color: rgb(235, 235, 235);
      width: 100%;
      height: 100%;
      padding: 0 2rem;
      font-size: .8125rem;
      font-weight: 700;
      color: #323232;

      .el-checkbox-group {
        display: flex;
        flex-direction: column;

        .el-checkbox {
          font-size: .8125rem;
          font-weight: 700;
          color: #323232;
          padding: 0 0 1rem 0;
          display: flex;
          align-items: center;

          /deep/ .el-checkbox__inner {
            height: 1.125rem;
            width: 1.125rem;
          }

          /deep/ .el-checkbox__inner::after {
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            margin: auto;
          }
        }
      }

      .search-select {
        width: 80%;
        padding: .5rem 0;
      }
    }

    /deep/ .el-collapse-item__header {
      background-color: rgb(235, 235, 235);
      display: flex;
      padding: 0 1rem;
    }

    /deep/ .el-collapse-item__arrow {
      margin: 0 8px 0 0;
      color: #323232;
      font-weight: 700;
    }

    /deep/ .el-collapse-item__content {
      padding-bottom: 0;
    }
  }

  .noSearch {
    margin-left: -15.625rem;
  }

  .search::-webkit-scrollbar {
    width: 8px;
    background-color: rgb(235, 235, 235);
  }

  .search::-webkit-scrollbar-thumb {
    background: #ccc; // 滑块颜色
    border-radius: 5px; // 滑块圆角
  }

  .container {
    transition: width 0.5s ease 0s;
  }

  /deep/ .el-table {
    .el-table__body-wrapper {
      overflow-y: auto!important;
      height: calc(100vh - 261px)!important;

      &::-webkit-scrollbar {
        width: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 5px;
      }
    }
    .has-gutter {
      .el-table__cell {
        background-color: #F7F8FA;
      }
    }
    tbody {
      tr {
        &:hover {
          > td {
            background: #EFFAFF;
          }
        }
        .first-column {
          display: flex;
          align-items: center;
          line-height: 0;
        }
      }
    }
  }
}

/deep/ .el-dialog {
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: 0 !important;

  .el-form-item__label {
    line-height: 16px;
  }
}

.el-dialog__wrapper {
  z-index: 2222!important;
  background: rgba(0,0,0, 0.6);
}
</style>
