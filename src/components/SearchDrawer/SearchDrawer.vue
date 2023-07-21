<template>
  <el-drawer :title="title" @open="init" :visible="drawer" :with-header="withHeader" :destroy-on-close="destroyOnClose"
             :direction="direction" :size="size" class="search-box">
    <div class="search-box-wrap" v-loading="loading" element-loading-text="加载中..."
         element-loading-spinner="el-icon-loading"
         element-loading-background="rgba(0, 0, 0, 0.8)">
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
        <!--        <el-select v-show="false" class="select" v-model="showSelect" @change="handleTags('showSelect')">-->
        <!--          <el-option-->
        <!--            v-for="item in showOptions"-->
        <!--            :key="item.value"-->
        <!--            :label="item.label"-->
        <!--            :value="item.value">-->
        <!--          </el-option>-->
        <!--        </el-select>-->
        <div class="search-container">
          <el-collapse v-model="activeCollapse">
            <el-collapse-item title="文件类型" name="fileType">
              <template slot="title">
                <div class="search-filter-label">文件类型</div>
              </template>
              <div class="search-filter-item">
                <el-checkbox-group
                  @change="handleFileType"
                  v-model="searchForm.fileType">
                  <el-checkbox-button v-for="item in searchFileType" :label="item.value" :key="item.value">
                    {{ item.label }}
                  </el-checkbox-button>
                </el-checkbox-group>
              </div>
            </el-collapse-item>
            <el-collapse-item title="人像" name="portrait">
              <template slot="title">
                <div class="search-filter-label">人像</div>
              </template>
              <div class="search-filter-item">
                <el-checkbox-group
                  @change="handleCheckBox('portrait',$event)"
                  v-model="searchForm.portrait">
                  <el-checkbox-button v-for="item in portraitOptions" :label="item.value" :key="item.value">
                    {{ item.label }}
                  </el-checkbox-button>
                </el-checkbox-group>
              </div>
            </el-collapse-item>
            <el-collapse-item title="来源" name="source">
              <template slot="title">
                <div class="search-filter-label">来源</div>
              </template>
              <div class="search-filter-item">
                <el-checkbox-group
                  @change="handleCheckBox('source',$event)"
                  v-model="searchForm.source">
                  <el-checkbox-button v-for="item in sourceOptions" :label="item.value" :key="item.value">
                    {{ item.label }}
                  </el-checkbox-button>
                </el-checkbox-group>
              </div>
            </el-collapse-item>
            <el-collapse-item title="授权范围" name="scopeAuthorization">
              <template slot="title">
                <div class="search-filter-label">授权范围</div>
              </template>
              <div class="search-filter-item">
                <el-checkbox-group
                  @change="handleCheckBox('scopeAuthorization',$event)"
                  v-model="searchForm.scopeAuthorization">
                  <el-checkbox-button v-for="item in authorizationScopeCheckBox" :label="item.value" :key="item.value">
                    {{ item.label }}
                  </el-checkbox-button>
                </el-checkbox-group>
              </div>
            </el-collapse-item>
            <el-collapse-item title="授权期限" name="durationAuthorization">
              <template slot="title">
                <div class="search-filter-label">授权期限</div>
              </template>
              <div class="search-filter-item">
                <el-date-picker
                  :value-format="dateValueFormat"
                  prefix-icon="el-icon-date"
                  align="center"
                  v-model="searchForm.prismExpirationDateStart"
                  type="datetime"
                  @change="handleDatePicker('prismExpirationDateStart',$event)"
                  :picker-options="pickerOptionsStart"
                  placeholder="选择开始日期">
                </el-date-picker>
                <el-date-picker
                  :value-format="dateValueFormat"
                  style="margin-top: 8px;"
                  prefix-icon="el-icon-date"
                  align="center"
                  @change="handleDatePicker('prismExpirationDateEnd',$event)"
                  :picker-options="pickerOptionsEnd"
                  v-model="searchForm.prismExpirationDateEnd"
                  type="datetime"
                  placeholder="选择结束日期">
                </el-date-picker>
              </div>
            </el-collapse-item>
            <el-collapse-item title="是否推荐" name="recommend">
              <template slot="title">
                <div class="search-filter-label">是否推荐</div>
              </template>
              <div class="search-filter-item">
                <el-checkbox-group
                  @change="handleCheckBox('recommend',$event)"
                  v-model="searchForm.recommend">
                  <el-checkbox-button v-for="item in whetherRecommendedOptions" :label="item.value" :key="item.value">
                    {{ item.label }}
                  </el-checkbox-button>
                </el-checkbox-group>
              </div>
            </el-collapse-item>
            <el-collapse-item title="构图" name="composition">
              <template slot="title">
                <div class="search-filter-label">构图</div>
              </template>
              <div class="search-filter-item">
                <el-checkbox-group
                  @change="handleCheckBox('composition',$event)"
                  v-model="searchForm.composition">
                  <el-checkbox-button v-for="item in compositionOptions" :label="item.value" :key="item.value">
                    {{ item.label }}
                  </el-checkbox-button>
                </el-checkbox-group>
              </div>
            </el-collapse-item>
            <el-collapse-item title="色彩" name="color">
              <template slot="title">
                <div class="search-filter-label">色彩</div>
              </template>
              <div class="search-filter-item">
                <el-checkbox-group
                  @change="handleCheckBox('color',$event)"
                  v-model="searchForm.color">
                  <el-checkbox-button v-for="item in colorOptions" :label="item.value" :key="item.value">
                    {{ item.label }}
                  </el-checkbox-button>
                </el-checkbox-group>
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
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
            <el-dropdown class="btn" v-show="multipleSelection.length" @command="handleCommand">
              <el-button class="search-operate" type="primary">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="item in settingBtn" :key="item.icon" :icon="item.icon" v-show="item.show"
                                  :command="item.icon">
                  {{ item.label }}
                </el-dropdown-item>
                <el-dropdown-item icon="el-icon-share" v-show="multipleSelection.length===1"
                                  command="el-icon-share">
                  分享
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
            <div style="font-size: 14px;color: #666666;font-weight: 400;">共<span
              style="color: #222222;font-weight: bold;padding: 0 4px;">{{ total }}</span>个结果
            </div>
            <!--            <div class="total">{{ viewData.length }}/{{ total }}</div>-->
            <div style="display: flex;align-items: center;">
              <el-dropdown trigger="click" @command="handleSort">
                <el-button type="primary" size="mini" class="btn all-btn">
                  <div class="button" style="display: flex;align-items: center;"><i
                    class="el-icon-sort search-icon"/>{{
                      searchForm.sort ? searchForm.sort === 'download' ? '下载' : '最新上传' : '默认'
                    }}
                  </div>
                </el-button>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item command="default" :disabled="!searchForm.sort">默认</el-dropdown-item>
                  <el-dropdown-item command="download" :disabled="searchForm.sort==='download'">下载</el-dropdown-item>
                  <el-dropdown-item command="upload" :disabled="searchForm.sort==='upload'">最新上传
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
              <!--              <i style="margin-left: 32px;" :class="[viewType,'viewType']"-->
              <!--                 :title="viewType === 'el-icon-s-grid' ? '列表视图' : '卡片视图'"/>-->
              <img style="cursor: pointer;margin: 0 24px;" v-if="viewType==='el-icon-s-grid'"
                   @click="handleView('el-icon-picture')"
                   title="列表视图" alt="view-icon"
                   src="../../assets/home/table-view-icon.png"/>
              <img style="cursor: pointer;margin: 0 24px;" v-if="viewType==='el-icon-picture'"
                   @click="handleView('el-icon-s-grid')"
                   title="卡片视图" alt="view-icon"
                   src="../../assets/home/card-view-icon.png"/>
              <div class="all-select" v-permission="assetRole" @click="handleAllSelect">
                <i class="el-icon-circle-check"/>
                全选
              </div>
            </div>
            <!--        <i :class="[viewType,'viewType']" :title="viewType === 'el-icon-s-grid' ? '列表视图' : '卡片视图'"-->
            <!--           @click="viewType = viewType === 'el-icon-s-grid' ? 'el-icon-picture' : 'el-icon-s-grid'"/>-->
          </div>
        </div>
        <div class="info-content">
          <div v-show="viewType==='el-icon-s-grid'" class="container"
               :style="{width:showSearch?'calc(100% - 15.625rem)':'100%'}">
            <TableView :show-select="assetRole" :table-data="viewData" @changeSelect="handleChangeSelect"
                       @onScroll="handleSearch" @selected="handleBtn"
                       :total="total"
                       ref="table"></TableView>
          </div>
          <div v-show="viewType==='el-icon-picture'" class="container card-view-content"
               v-infinite-scroll="handleCardViewScroll"
               :style="{width:showSearch?'calc(100% - 15.625rem)':'100%'}">
            <SearchCardView :show-check-box="assetRole" :list-data="viewData" @select="handleCardViewSelect"/>
          </div>
        </div>
        <div style="display: none" v-html="errorData"></div>
      </div>
    </div>
    <select-folder-dialog :visible.sync="showFolderSelect" @finish="setPathInput"></select-folder-dialog>
    <!--    <el-dialog width="320px" title="删除资产" :visible.sync="dialogDeleteFolderVisible" @open="handleDeleteDialog"-->
    <!--               :modal-append-to-body="false" :append-to-body="true">-->
    <!--      <div style="color: #222222">{{ deleteTitle }}</div>-->
    <!--      <p style="max-height: 180px;overflow: auto;color: #222222" v-html="deleteContent"></p>-->
    <!--      <span slot="footer" class="dialog-footer">-->
    <!--        <el-button @click="dialogDeleteFolderVisible = false">取 消</el-button>-->
    <!--        <el-button type="danger" :loading="deleteLoading"-->
    <!--                   @click="deleteAsset">删 除</el-button>-->
    <!--      </span>-->
    <!--    </el-dialog>-->

    <DeleteDialog :visible.sync="dialogDeleteFolderVisible" :list="multipleSelection" @finish="handleDeleteDialog"/>

    <ShareDialog :visible.sync="showShareDialog" :share-data="shareDialogData"/>
  </el-drawer>
</template>

<script>
import {
  showOptions,
  searchFileType,
  authorizationScopeCheckBox,
  portraitOptions,
  minorModelImageDisclosureOptions,
  propertyReleaseStatusOptions,
  sourceOptions,
  defaultBreadcrumb,
  whetherRecommendedOptions,
  colorOptions,
  compositionOptions,
  types
} from '@/utils'
import SelectFolderDialog from '@/components/SelectFolderDialog/SelectFolderDialog'
import TableView from '@/components/TableView/TableView'
import DeleteDialog from '@/components/DeleteDialog/DeleteDialog'
import { command, downloadZip, searchAsset, searchPopularTag } from '@/api/api'
import zteStore from '@/store'
import { mapState } from 'pinia'
import SearchCardView from '@/components/SearchCardView/SearchCardView'
import ShareDialog from '@/components/ShareDialog/ShareDialog'
import dayjs from 'dayjs'
import { downloadByGet } from '@/api'

export default {
  name: 'SearchDrawer',
  components: {
    SearchCardView,
    SelectFolderDialog,
    TableView,
    ShareDialog,
    DeleteDialog
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
        icon: 'el-icon-download',
        label: '下载',
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
      searchFileType,
      authorizationScopeCheckBox,
      portraitOptions,
      minorModelImageDisclosureOptions,
      propertyReleaseStatusOptions,
      whetherRecommendedOptions,
      colorOptions,
      compositionOptions: compositionOptions.filter(i => i.value),
      sourceOptions,
      tags: [],
      showFolderSelect: false,
      activeCollapse: ['fileType'],
      dateValueFormat: 'yyyy-MM-dd HH:mm:ss',
      searchForm: {
        fileType: [],
        portrait: [],
        source: [],
        scopeAuthorization: [],
        durationAuthorization: [],
        prismExpirationDateStart: '',
        prismExpirationDateEnd: '',
        recommend: [],
        composition: [],
        color: [],
        sort: ''
      },
      pickerOptionsStart: {
        disabledDate: time => this.disabledDateStart(time)
      },
      pickerOptionsEnd: {
        disabledDate: time => this.disabledDateEnd(time)
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
      errorData: '',
      multipleSelection: [],
      showShareDialog: false,
      shareDialogData: null
    }
  },
  methods: {
    init () {
      const flag = {
        fileType: [],
        portrait: [],
        source: [],
        scopeAuthorization: [],
        durationAuthorization: [],
        prismExpirationDateStart: '',
        prismExpirationDateEnd: '',
        recommend: [],
        composition: [],
        color: [],
        sort: ''
      }
      const {
        query: {
          search,
          keywords,
          pathInput,
          fileType,
          recommend,
          sort
        }
      } = this.$route
      fileType && (flag.fileType = [fileType])
      recommend && (flag.recommend = [recommend])
      recommend && (this.activeCollapse = [...this.activeCollapse, 'recommend'])
      sort && (flag.sort = sort)
      this.search = keywords
      this.pathInput = pathInput
      pathInput && this.handleTags('pathInput')
      this.searchForm = { ...flag }
      this.handleSearch()
    },
    async handleSearch (first = true) {
      first && (this.offset = 0);
      (first && !!this.$refs.table) && (this.$refs.table.disabled = false)
      this.loading = true
      const searchType = this.searchForm.fileType.map(e => types[e]).join(';')
      const portrait = this.searchForm.portrait.length ? this.searchForm.portrait[0] : ''
      const source = this.searchForm.source.length ? this.searchForm.source[0] : ''
      const authorizationScope = this.searchForm.scopeAuthorization.length ? this.searchForm.scopeAuthorization[0] : ''
      const recommend = this.searchForm.recommend.length ? this.searchForm.recommend[0] : ''
      const composition = this.searchForm.composition.length ? this.searchForm.composition[0] : ''
      const color = this.searchForm.color.length ? this.searchForm.color[0] : ''
      const sorObj = this.searchForm.sort === 'download' || this.searchForm.sort === 'upload' ? {
        orderBy: this.searchForm.sort === 'download' ? 'jcr:content/metadata/dc:download' : 'jcr:created',
        sortOrder: 'DESC'
      } : {}
      try {
        const {
          results: {
            records,
            total
          }
        } = await searchAsset({
          name: this.search,
          parentPath: this.pathInput || defaultBreadcrumb[0].id,
          fileType: searchType,
          portrait,
          source,
          authorizationScope,
          recommend,
          composition,
          color,
          ...sorObj,
          prismExpirationDateStart: this.searchForm.prismExpirationDateStart,
          prismExpirationDateEnd: this.searchForm.prismExpirationDateEnd,
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
        this.$nextTick(() => {
          this.$refs.table.$refs.table.clearSelection()
        })
      }
    },
    closeSearch () {
      const flag = {
        fileType: [],
        portrait: [],
        source: [],
        scopeAuthorization: [],
        durationAuthorization: [],
        prismExpirationDateStart: '',
        prismExpirationDateEnd: '',
        recommend: [],
        composition: [],
        color: [],
        sort: ''
      }
      this.searchForm = { ...flag }
      this.activeCollapse = ['fileType']
      this.tags = []
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
      command === 'el-icon-download' && this.handleDownload()
      command === 'el-icon-share' && this.handleShare()
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
      // const length = this.$refs.table.$refs.table.selection.length
      // this.deleteTitle = length === 1 ? '您即将删除以下资产:' : `您即将删除以下 ${length} 个资产:`
      // this.deleteContent = this.$refs.table.$refs.table.selection.map((e, index) => index + 1 === length ? `${e.properties['jcr:title'] || e.name}` : `${e.properties['jcr:title'] || e.name}<br>`).join('')
      this.dialogDeleteFolderVisible = false
      this.handleSearch()
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
    },
    handleCheckBox (key, val) {
      if (val.length > 1) {
        const [_, b] = val
        this.$set(this.searchForm, key, [b])
      }
      this.handleSearch()
    },
    handleFileType () {
      this.handleSearch()
    },
    disabledDateStart (time) {
      if (!this.searchForm.prismExpirationDateEnd) {
        return false
      }
      const flag = new Date(this.searchForm.prismExpirationDateEnd).getTime()
      const day = 24 * 60 * 60 * 1000
      const offset = time.getTime() % day
      return flag - time.getTime() - offset < 0
    },
    disabledDateEnd (time) {
      if (!this.searchForm.prismExpirationDateStart) {
        return false
      }
      const flag = new Date(this.searchForm.prismExpirationDateStart).getTime()
      const day = 24 * 60 * 60 * 1000
      const offset = time.getTime() % day
      return time.getTime() - flag + offset < 0
    },
    handleDatePicker (key, val) {
      const start = new Date(this.searchForm.prismExpirationDateStart)
      const end = new Date(this.searchForm.prismExpirationDateEnd)
      if (!val) {
        this.handleSearch()
        return
      }
      if (start.getTime() > end.getTime()) {
        this.$message.error(key === 'prismExpirationDateStart' ? `开始日期不晚于 ${this.searchForm.prismExpirationDateEnd}` : `结束日期不早于 ${this.searchForm.prismExpirationDateStart}`)
        this.$set(this.searchForm, key, '')
      } else {
        this.handleSearch()
      }
    },
    handleSort (command) {
      this.$set(this.searchForm, 'sort', command === 'download' ? command : command === 'upload' ? 'upload' : '')
      this.handleSearch()
    },
    handleView (type) {
      // this.loading = true
      this.viewType = type
      // setTimeout(() => {
      //   this.loading = false
      // }, 1000)
    },
    handleCardViewScroll () {
      if (this.viewData.length >= this.total) return
      this.handleSearch(false)
    },
    handleChangeSelect (arr) {
      this.multipleSelection = arr
      const flag = this.viewData
      this.viewData = [...flag.map(i => ({
        ...i,
        select: arr.some(k => k.assetId === i.assetId)
      }))]
    },
    handleCardViewSelect ({
      row,
      val
    }) {
      this.$nextTick(() => {
        this.$refs.table.$refs.table.toggleRowSelection(row, val)
      })
    },
    async handleDownload () {
      if (this.multipleSelection.some(i => i.metadata && 'prism:expirationDate' in i.metadata && dayjs().isAfter(dayjs(i.metadata['prism:expirationDate'])))) {
        this.$message.error('此素材已到期，请联系管理员')
        return
      }
      try {
        this.loading = true
        const length = this.multipleSelection.length
        const [flag] = this.multipleSelection
        if (length === 1) {
          const name = flag.metadata && ('dc:title' in flag.metadata) ? flag.metadata['dc:title'] : flag.name
          await downloadByGet(`${flag.path}`, name)
        } else {
          const str = this.multipleSelection.map(i => `path=${i.path}`).join('&')
          const res = await downloadZip(`${flag.path}.assetdownload.zip/zte.zip?${str}&_charset_=utf-8&downloadAssets=true&licenseCheck=false&flatStructure=true&downloadRenditions=false&downloadSubassets=false`)
          const url = window.URL.createObjectURL(res)
          const a = document.createElement('a')
          a.href = url
          a.download = '文件下载.zip'
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          window.URL.revokeObjectURL(url)
        }
      } finally {
        this.loading = false
      }
    },
    handleShare () {
      const [flag] = this.multipleSelection
      this.shareDialogData = flag
      this.showShareDialog = true
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
      padding: 28px 0;
      box-sizing: border-box;
      background: #F7F8FA;
      height: calc(100vh - 64px);
      overflow-y: auto;

      .path {
        padding: 0 20px;

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

    .search-location::-webkit-scrollbar {
      width: 8px;
      background-color: #F7F8FA;
    }

    .search-location::-webkit-scrollbar-thumb {
      background: #ccc; // 滑块颜色
      border-radius: 5px; // 滑块圆角
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

    .search-container {
      margin-top: 16px;
      //height: 66%;
      //overflow-y: auto;

      /deep/ .el-collapse {
        border-top: unset;
        border-bottom: unset;
      }

      /deep/ .el-collapse-item__header {
        background-color: #F7F8FA;
        display: flex;
        padding: 0 1rem;
        border-bottom: none;
      }

      /deep/ .el-collapse-item__arrow {
        margin: 0 8px 0 0;
        order: 1;
      }

      .search-filter-label {
        order: 2;
        font-size: 14px;
        font-weight: 400;
        color: #3D3D3D;
      }

      /deep/ .el-collapse-item__wrap {
        background: unset;
        border-bottom: unset;
      }

      /deep/ .el-radio-button__inner,
      /deep/ .el-checkbox-button__inner {
        border-radius: 16px;
        margin-right: 8px;
        margin-bottom: 8px;
        padding: 8px 18px;
        font-size: 14px;
        font-weight: 400;
        color: #666666;
        box-shadow: unset;
        border: 1px solid #CFD9E0;
      }

      /deep/ .el-collapse-item__content {
        padding-bottom: 8px;
        padding-left: 36px;
        padding-right: 12px;
      }

      /deep/ .el-radio-button__orig-radio:checked + .el-radio-button__inner,
      /deep/ .el-checkbox-button.is-checked .el-checkbox-button__inner {
        background: #ECFAFF;
        border: 1px solid #CDE6EF !important;
        color: #008ED3;
        box-shadow: unset;
      }

      /deep/ .el-checkbox-button.is-focus .el-checkbox-button__inner {
        border-color: #CFD9E0;
      }

      /deep/ .el-input__inner {
        border-radius: 16px;
        height: 32px;
        line-height: 32px;
      }

      /deep/ .el-input__icon {
        line-height: 32px;
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
    align-items: center;
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

  .card-view-content::-webkit-scrollbar {
    width: 8px;
    background-color: rgb(235, 235, 235);
  }

  .card-view-content::-webkit-scrollbar-thumb {
    background: #ccc; // 滑块颜色
    border-radius: 5px; // 滑块圆角
  }

  .card-view-content {
    margin-bottom: 108px;
    overflow-y: auto;
  }

  /deep/ .el-table {
    .el-table__body-wrapper {
      overflow-y: auto !important;
      height: calc(100vh - 261px) !important;

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
  z-index: 2222 !important;
  background: rgba(0, 0, 0, 0.6);
}

/deep/ .btn {
  height: 100%;

  &.create-folder {
    height: 32px;
    font-size: 14px;
    color: #3D3D3D;
    background: transparent;
    border-radius: 16px;
    border: 0;
    -webkit-transition: .3s ease-out;
    transition: .3s ease-out;

    &:hover {
      background: #ECFAFF;
    }

    .el-icon-folder {
      display: inline-block;
      width: 20px;
      height: 20px;
      background: url("../../assets/home/holdings.png") no-repeat center;

      &:before {
        display: none;
      }
    }

    .el-icon-sort {
      display: inline-block;
      width: 20px;
      height: 20px;
      background: url("../../assets/home/sort.png") no-repeat center;

      &:before {
        display: none;
      }
    }
  }

  &.all-btn {
    display: flex !important;
    align-items: center;
    height: 32px;
    font-size: 14px;
    color: #3D3D3D;
    background: transparent;
    border-radius: 16px;
    border: 0;
    -webkit-transition: .3s ease-out;
    transition: .3s ease-out;

    i {
      font-size: 20px;
    }

    &:hover {
      background: #ECFAFF;
    }
  }
}
</style>
