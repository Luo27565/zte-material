<template>
  <div class="container-content">
    <el-breadcrumb separator-class="el-icon-arrow-right" class="bread-crumb">
      <el-breadcrumb-item class="bread-crumb-item" v-for="(item,index) in breadcrumb"
                          :key="item.id" @click.native="handleBreadCrumb(item.id,index)">{{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="manage-container">
      <div class="search-filter-container">
        <div class="filter-container">
          <div class="filter-item all-list">
            <el-select v-model="searchForm.fileType" clearable placeholder="文件类型">
              <el-option
                v-for="item in fileTypeSelect"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="filter-item user-list">
            <el-select v-model="searchForm.portrait" clearable placeholder="人像">
              <el-option
                v-for="item in portraitSelect"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <!--          <div class="filter-item">-->
          <!--            <el-select v-model="searchForm.authorization" clearable placeholder="授权状态">-->
          <!--              <el-option-->
          <!--                v-for="item in authorizationSelect"-->
          <!--                :key="item.value"-->
          <!--                :label="item.label"-->
          <!--                :value="item.value">-->
          <!--              </el-option>-->
          <!--            </el-select>-->
          <!--          </div>-->
          <div class="filter-item">
            <el-select v-model="searchForm.source" clearable placeholder="来源">
              <el-option
                v-for="item in sourceSelect"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="filter-item">
            <el-select v-model="searchForm.scopeAuthorization" clearable placeholder="授权范围">
              <el-option
                v-for="item in scopeAuthorizationSelect"
                :key="item.value"
                :label="item.label"
                :value="item.value">
              </el-option>
            </el-select>
          </div>
          <div class="filter-item">
            <el-popover
              placement="bottom"
              trigger="click"
              @show="showAuthorizationDuration = !showAuthorizationDuration"
              @hide="showAuthorizationDuration = !showAuthorizationDuration">
              <el-date-picker
                v-model="searchForm.durationAuthorization"
                type="datetimerange"
                start-placeholder="开始时间"
                :value-format="dateValueFormat"
                end-placeholder="结束时间"
                :default-time="['00:00:00']">
              </el-date-picker>
              <div slot="reference" class="update-time">
                <span>授权期限</span>
                <i :class="['el-icon-arrow-down','time-icon',{iconTime:showAuthorizationDuration}]"/>
              </div>
            </el-popover>
          </div>
          <!--          <div class="filter-item">-->
          <!--            <el-popover-->
          <!--              placement="bottom"-->
          <!--              trigger="click"-->
          <!--              @show="showUpdateTime = !showUpdateTime"-->
          <!--              @hide="showUpdateTime = !showUpdateTime">-->
          <!--              <el-date-picker-->
          <!--                v-model="searchForm.updateTime"-->
          <!--                type="datetimerange"-->
          <!--                start-placeholder="开始时间"-->
          <!--                end-placeholder="结束时间"-->
          <!--                :default-time="['00:00:00']">-->
          <!--              </el-date-picker>-->
          <!--              <div slot="reference" class="update-time">-->
          <!--                <span>修改时间</span>-->
          <!--                <i :class="['el-icon-arrow-down','time-icon',{iconTime:showUpdateTime}]"/>-->
          <!--              </div>-->
          <!--            </el-popover>-->
          <!--          </div>-->
        </div>
        <div class="search-container">
          <search class="left-content"/>
          <div class="right-content">
            <el-button v-permission="assetRole" type="primary" size="mini" @click="createFolderDialog"
                       class="btn create-folder">
              <div class="button"><i class="el-icon-folder search-icon"/>新建文件夹</div>
            </el-button>
            <!--          <el-button v-permission="assetRole" type="primary" size="mini" @click="showUpload=true" class="btn">-->
            <!--            <div class="button"><i class="el-icon-upload search-icon"/>上传</div>-->
            <!--          </el-button>-->
            <el-button type="primary" size="mini" class="btn all-btn" @click="handleAllSelect">
              <div class="button"><i class="el-icon-circle-check search-icon"/>全选</div>
            </el-button>
            <el-dropdown v-permission="assetRole" v-show="showSettingBtn()" :hide-on-click="false" class="btn"
                         style="margin-left: 10px;"
                         @command="handleSettingCommand">
              <el-button type="primary" size="mini" class="btn operate-btn">
                操作<i class="el-icon-arrow-down el-icon--right"></i>
              </el-button>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="item in settingBtn" :key="item.icon" :icon="item.icon" v-show="item.show"
                                  :command="item.icon">
                  {{ item.label }}
                </el-dropdown-item>
                <el-dropdown-item icon="el-icon-download" v-show="showDownloadBox"
                                  command="download">
                  下载
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <el-dropdown @command="handleCommand" v-if="false">
              <i :class="`${dropDownValue} menu-icon`"/>
              <el-dropdown-menu slot="dropdown">
                <el-dropdown-item v-for="item in dropDownData" :key="item.icon" :icon="item.icon" :command="item.icon"
                                  v-show="item.show"
                                  :class="dropDownValue===item.icon?'showHover':''">
                  {{ item.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </el-dropdown>
            <div class="upload-wrap" v-permission="assetRole" :class="showUploadBox? 'active':''">
              <div class="upload-title" @click="showUpload=true">上传</div>
              <div class="upload-box">
                <span class="upload-file" @click="showUpload=true,showUploadBox=false">上传文件</span>
                <span class="upload-folder" @click="showFolderUpload=true, showUploadBox=false">文件夹上传</span>
              </div>
            </div>
            <div class="download-wrap" v-permission="!assetRole" v-if="showDownloadBox">
              <div class="upload-title" @click="handleDownload">下载</div>
              <div class="upload-box">
                <span class="upload-file" @click="showUpload=true,showUploadBox=false">上传文件</span>
                <span class="upload-folder" @click="showFolderUpload=true, showUploadBox=false">文件夹上传</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="content">
        <div v-show="dropDownValue==='el-icon-s-grid'" class="list-view">
          <el-table
            ref="table"
            v-loading="loading"
            height="100%"
            @cell-click="handleTableCellClick"
            @selection-change="handleSelectionChange"
            :row-style="{height:'48px'}"
            :data="filterListData">
            <el-table-column
              type="selection"
              align="center"
              width="36">
            </el-table-column>
            <el-table-column width="56" align="center">
              <template slot-scope="scope">
                <div class="first-column" @click.stop>
                  <i v-if="scope.row.nodeType!=='dam:Asset'" class="el-icon-folder"/>
                  <template v-else>
                    <el-image v-if="scope.row.renditions" :src="`${baseUrl}${scope.row.renditions.list}`"
                              :preview-src-list="[`${baseUrl}${scope.row.renditions.detail}`]">
                      <div slot="error" class="image-slot">
                        <i class="el-icon-document"></i>
                      </div>
                    </el-image>
                  </template>
                </div>
              </template>
            </el-table-column>
            <!--            <el-table-column-->
            <!--              prop="name"-->
            <!--              label="名称">-->
            <!--            </el-table-column>-->
            <!--            width="240"-->
            <el-table-column
              label="标题/名称">
              <template slot-scope="scope">
                <span
                  v-if="scope.row.metadata && ('jcr:title' in scope.row.metadata||'dc:title' in scope.row.metadata)">
                  {{ scope.row.metadata['jcr:title'] || scope.row.metadata['dc:title'] || scope.row.name }}
                </span>
                <span v-else>{{
                    scope.row.properties ? scope.row.properties['jcr:title'] ? scope.row.properties['jcr:title'] : scope.row.name : scope.row.name
                  }}</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="tagsText"
              label="标签">
            </el-table-column>
            <!--            width="120"-->
            <el-table-column
              label="类型">
              <template slot-scope="scope">
                <template v-if="scope.row.metadata">
                  <span>{{ scope.row.metadata['dc:format'] | formatType }}</span>
                </template>
                <template v-else>
                  <span v-if="scope.row.nodeType!=='dam:Asset'">文件夹</span>
                </template>
              </template>
            </el-table-column>
            <!--            width="120"-->
            <el-table-column
              label="大小">
              <template slot-scope="scope">
                <template v-if="scope.row.metadata">
                  <span>{{ scope.row.metadata['dam:size'] | formatSize }}</span>
                </template>
              </template>
            </el-table-column>
            <!--            width="160"-->
            <el-table-column
              label="尺寸">
              <template slot-scope="scope">
                <template v-if="scope.row.metadata">
                  <span v-if="scope.row.metadata['tiff:ImageWidth']&&scope.row.metadata['tiff:ImageLength']">
                    {{ `${scope.row.metadata['tiff:ImageWidth']} x ${scope.row.metadata['tiff:ImageLength']}` }}
                  </span>
                </template>
              </template>
            </el-table-column>
            <!--            width="200"-->
            <el-table-column
              label="修改时间">
              <template slot-scope="scope">
                <template v-if="scope.row.properties">
                  <div style="display: flex;flex-direction: column;">
                    <span>{{ scope.row.properties['jcr:lastModified'] | formatLastModifiedTime }}</span>
                    <span>{{ scope.row.properties['jcr:lastModifiedBy'] }}</span>
                  </div>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="到期状态" width="100">
              <template slot-scope="scope">
                <span v-if="scope.row.metadata&&'prism:expirationDate' in scope.row.metadata">{{
                    scope.row.metadata['prism:expirationDate'] | expiresWhetherFormat
                  }}</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-show="dropDownValue==='el-icon-picture'">
          卡片视图{{ lastCrumb.id }}
        </div>
        <div v-show="dropDownValue==='el-icon-s-data'">
          列视图{{ lastCrumb.id }}
        </div>
      </div>

      <!--      <el-dialog width="360px" title="创建文件夹" :visible.sync="dialogAddFolderVisible" @close="folderDialogClose">-->
      <!--        <el-form label-position="top" label-width="80px" :model="folderForm">-->
      <!--          <el-form-item label="标题" :required="true">-->
      <!--            <el-input v-model="folderForm.folderTitle" @input="handleFolderName"></el-input>-->
      <!--          </el-form-item>-->
      <!--          <el-tooltip :value="showPopover" :manual="true" popper-class="my-popper">-->
      <!--            <div slot="content">资源已存在</div>-->
      <!--            <el-form-item label="名称">-->
      <!--              <el-input v-model="folderForm.folderName"></el-input>-->
      <!--            </el-form-item>-->
      <!--          </el-tooltip>-->
      <!--          <el-form-item label="排序">-->
      <!--            <el-date-picker-->
      <!--              style="width: 100%;"-->
      <!--              v-model="folderForm.sort"-->
      <!--              type="datetime"-->
      <!--              :value-format="dateValueFormat"-->
      <!--              default-time="00:00:00">-->
      <!--            </el-date-picker>-->
      <!--          </el-form-item>-->
      <!--        </el-form>-->
      <!--        <span slot="footer" class="dialog-footer">-->
      <!--        <el-button @click="dialogAddFolderVisible = false">取 消</el-button>-->
      <!--        <el-button type="primary" :disabled="!folderForm.folderTitle||!folderForm.folderName||showPopover"-->
      <!--                   :loading="folderLoading"-->
      <!--                   @click="createFolder">确 定</el-button>-->
      <!--      </span>-->
      <!--      </el-dialog>-->
      <!--      <el-dialog width="320px" title="删除资产" :visible.sync="dialogDeleteFolderVisible" @open="handleDeleteDialog">-->
      <!--        <div style="color: #222222">{{ deleteTitle }}</div>-->
      <!--        <p style="max-height: 180px;overflow: auto;color: #222222" v-html="deleteContent"></p>-->
      <!--        <span slot="footer" class="dialog-footer">-->
      <!--        <el-button @click="dialogDeleteFolderVisible = false">取 消</el-button>-->
      <!--        <el-button type="danger" :loading="folderLoading"-->
      <!--                   @click="deleteAsset">删 除</el-button>-->
      <!--      </span>-->
      <!--      </el-dialog>-->
    </div>
    <CreateFolderDialog v-if="dialogAddFolderVisible" :visible.sync="dialogAddFolderVisible" :path="lastCrumb.id" @finish="createFolderFinish"/>
    <DeleteDialog :visible.sync="dialogDeleteFolderVisible" :list="hasSelectData" @finish="deleteAsset"/>
    <drawer :drawer.sync="showDrawer" :title="drawerTitle" :selectData="drawerSelectData"
            @finish="handleCopyAndMove"/>
    <upload :dialog-visible.sync="showUpload" @finish="refresh" :exist-data="listViewData" @close="handleUploadDialog"/>
    <folderUpload :dialog-visible.sync="showFolderUpload" @finish="refresh" :exist-data="listViewData"/>
    <detail-drawer :drawer.sync="showDetailDrawer" :all-detail-data="detailArr" :detail="detailData"
                   @move="handleDetailToMove"/>
    <!--    <div style="display: none" v-html="errorData"></div>-->
  </div>

</template>

<script>
import search from '@/components/Search/Search'
import drawer from '@/components/Drawer/Drawer'
import upload from '@/components/Upload/Upload'
import folderUpload from '@/components/FolderUpload/FolderUpload.vue'
import detailDrawer from '@/components/DetailDrawer/DetailDrawer'
import DeleteDialog from '@/components/DeleteDialog/DeleteDialog'
import CreateFolderDialog from '@/components/CreateFolderDialog/CreateFolderDialog'
import zteStore from '@/store'
import { mapState, mapActions } from 'pinia'
import {
  getTree,
  folderTree,
  searchPopularTag, downloadZip
} from '@/api/api'
import {
  columnPath,
  baseUrl,
  portraitOptions,
  authorizationScopeCheckBox,
  sourceOptions,
  fileTypeOptions, propertyReleaseStatusOptions
} from '@/utils'
import '@/utils/filter'
import dayjs from 'dayjs'
import isBetween from 'dayjs/plugin/isBetween'
import utc from 'dayjs/plugin/utc'
import { downloadByGet } from '@/api'

dayjs.extend(isBetween)
dayjs.extend(utc)

export default {
  name: 'ManageContent',
  components: {
    search,
    drawer,
    upload,
    detailDrawer,
    folderUpload,
    DeleteDialog,
    CreateFolderDialog
  },
  computed: {
    ...mapState(zteStore, ['assetRole', 'selected', 'breadcrumb', 'lastCrumb']),
    previewList: function () {
      return this.listViewData.filter(v => v.renditions).filter(e => ('detail' in e.renditions)).map(i => `${baseUrl}${i.renditions.detail}`)
    },
    filterListData: function () {
      let res = [...this.listViewData]
      if (this.searchForm.fileType) {
        const typeArr = fileTypeOptions.find(i => i.value === this.searchForm.fileType).type.split(';')
        res = [...res.filter(e => e.metadata).filter(i => typeArr.some(v => v === i.metadata['dc:format']))]
      }
      if (this.searchForm.portrait) {
        if (this.searchForm.portrait === '2') {
          res = [...res.filter(e => !e.metadata || !('dc:portrait' in e.metadata) || e.metadata['dc:portrait'] === this.searchForm.portrait)]
        } else {
          res = [...res.filter(e => e.metadata).filter(i => i.metadata['dc:portrait'] === this.searchForm.portrait)]
        }
      }
      if (this.searchForm.authorization) {
        if (this.searchForm.authorization === 'unknown') {
          res = [...res.filter(e => !e.metadata || !('dc:propertyReleaseStatus' in e.metadata) || e.metadata['dc:propertyReleaseStatus'] === this.searchForm.authorization)]
        } else {
          res = [...res.filter(e => e.metadata).filter(i => i.metadata['dc:propertyReleaseStatus'] === this.searchForm.authorization)]
        }
      }
      if (this.searchForm.source) {
        if (this.searchForm.source === 'other') {
          res = [...res.filter(e => !e.metadata || !('dc:source' in e.metadata) || e.metadata['dc:source'] === this.searchForm.source)]
        } else {
          res = [...res.filter(e => e.metadata).filter(i => i.metadata['dc:source'] === this.searchForm.source)]
        }
      }
      if (this.searchForm.scopeAuthorization) {
        if (this.searchForm.scopeAuthorization === 'other') {
          res = [...res.filter(e => !e.metadata || !('dc:authorizationScope' in e.metadata) || e.metadata['dc:authorizationScope'].includes(this.searchForm.scopeAuthorization))]
        } else {
          res = [...res.filter(e => e.metadata).filter(i => (i.metadata['dc:authorizationScope'] || '').includes(this.searchForm.scopeAuthorization))]
        }
      }
      if (this.searchForm.durationAuthorization) {
        res = [...res.filter(e => e.metadata).filter(i => i.metadata['prism:expirationDate']).filter(v => dayjs(v.metadata['prism:expirationDate']).isBetween(this.searchForm.durationAuthorization[0], dayjs(this.searchForm.durationAuthorization[1])))]
      }
      if (this.searchForm.updateTime) {
        res = [...res.filter(e => e.properties).filter(i => i.properties['jcr:lastModified']).filter(v => dayjs(v.properties['jcr:lastModified']).isBetween(this.searchForm.updateTime[0], dayjs(this.searchForm.updateTime[1])))]
      }
      return res
    }
  },
  mounted () {
    const { id } = this.lastCrumb
    this.initByListView(id)
  },
  watch: {
    selected: {
      handler (val) {
        this.initByListView(val)
      }
    },
    'folderForm.folderName' (val) {
      if (this.folderJson.length) {
        this.showPopover = this.folderJson.some(e => e === val)
      }
    }
  },
  data () {
    return {
      baseUrl,
      errorData: '',
      loading: false,
      showDrawer: false,
      showDetailDrawer: false,
      showUpload: false,
      showFolderUpload: false,
      showUpdateTime: false,
      showUploadBox: false,
      showDownloadBox: false,
      showAuthorizationDuration: false,
      dateValueFormat: 'yyyy-MM-dd HH:mm:ss',
      drawerTitle: 'move',
      drawerSelectData: [],
      detailArr: [],
      detailData: {},
      dataflole: [],
      selectData: [{
        label: '图片',
        value: 0
      }, {
        label: '视频',
        value: 1
      }, {
        label: '字体',
        value: 2
      }, {
        label: '音乐',
        value: 3
      }],
      select: 0,
      // 文件类型
      fileTypeSelect: fileTypeOptions,
      // 人像
      portraitSelect: portraitOptions,
      // 授权状态
      authorizationSelect: propertyReleaseStatusOptions,
      // 来源
      sourceSelect: sourceOptions,
      // 授权范围
      scopeAuthorizationSelect: authorizationScopeCheckBox,
      searchForm: {
        fileType: '',
        portrait: null,
        authorization: null,
        source: null,
        scopeAuthorization: '',
        durationAuthorization: '',
        updateTime: ''
      },
      input: '',
      settingBtn: [{
        icon: 'el-icon-delete',
        label: '删除',
        show: true
      }, {
        icon: 'el-icon-copy-document',
        label: '复制',
        show: true
      }, {
        icon: 'el-icon-position',
        label: '移动',
        show: true
      }, {
        icon: 'el-icon-info',
        label: '属性',
        show: true
      }, {
        icon: 'el-icon-edit-outline',
        label: '编辑',
        show: false
      }
        // , {
        //   icon: 'el-icon-edit',
        //   label: '临时编辑'
        // }
      ],
      dropDownValue: 'el-icon-s-grid',
      dropDownData: [{
        icon: 'el-icon-s-grid',
        label: '列表视图',
        show: true
      }, {
        icon: 'el-icon-picture',
        label: '卡片视图'
      }, {
        icon: 'el-icon-s-data',
        label: '列视图'
      }],
      // 列表视图
      listViewData: [],
      dialogAddFolderVisible: false,
      showPopover: false,
      folderForm: {
        folderName: '',
        folderTitle: '',
        sort: ''
      },
      folderLoading: false,
      folderJson: [],
      dialogDeleteFolderVisible: false,
      hasSelectData: []
    }
  },
  methods: {
    ...mapActions(zteStore, ['setBreadcrumb', 'setSelected', 'getTreeData']),
    handleSettingCommand (command) {
      command === 'el-icon-delete' && (this.hasSelectData = this.$refs.table.selection)
      command === 'el-icon-delete' && (this.dialogDeleteFolderVisible = true)
      command === 'el-icon-position' && this.handleRemove()
      command === 'el-icon-copy-document' && this.handleCopy()
      command === 'el-icon-info' && this.handleJump()
      command === 'download' && this.handleDownload()
      // console.log(command)
    },
    handleJump () {
      const { path } = this.$route
      if (this.$refs.table.selection.length > 1) {
        localStorage.removeItem('multipleData')
        localStorage.setItem('multipleData', JSON.stringify(this.$refs.table.selection))
      }
      const [flag] = this.$refs.table.selection
      this.$router.push({
        path,
        query: {
          path: this.$refs.table.selection.length === 1 ? flag.path : 'multipleData'
        }
      })
    },
    async handleDownload () {
      if (this.$refs.table.selection.some(i => i.metadata && 'prism:expirationDate' in i.metadata && dayjs().isAfter(dayjs(i.metadata['prism:expirationDate'])))) {
        this.$message.error('此素材已到期，请联系管理员')
        return
      }
      try {
        this.loading = true
        const length = this.$refs.table.selection.length
        const [flag] = this.$refs.table.selection
        if (length === 1) {
          const name = flag.metadata && ('dc:title' in flag.metadata) ? flag.metadata['dc:title'] : flag.name
          await downloadByGet(`${flag.path}`, name)
        } else {
          const str = this.$refs.table.selection.map(i => `path=${i.path}`).join('&')
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
    handleCommand (command) {
      if (command !== this.dropDownValue) {
        this.dropDownValue = command
      }
    },
    showSettingBtn () {
      if (!this.$refs.table) return false
      return this.$refs.table.selection.length > 0
    },
    async init (val) {
      const { items } = await getTree(`${columnPath}${val}`)
      this.listViewData = items
    },
    async initByListView (val) {
      this.searchForm = {
        fileType: '',
        portrait: null,
        authorization: null,
        source: null,
        scopeAuthorization: '',
        durationAuthorization: '',
        updateTime: ''
      }
      this.loading = true
      try {
        let { results } = await folderTree(val)
        const tags = await searchPopularTag('/content/cq:tags/zte-asset-tags')
        results = [...results.map(e => ({
          ...e,
          tagsText: e.metadata && 'cq:tags' in e.metadata && e.metadata['cq:tags'] ? e.metadata['cq:tags'].split(';').map(i => tags.results[i]).filter(k => k).join(';') : ''
        }))]
        const first = results.filter(e => e.metadata).filter(i => i.metadata['dc:sort']).map(k => ({
          ...k,
          sort: new Date(k.metadata['dc:sort']).getTime()
        }))
        const last = results.filter(e => !e.metadata || !('dc:sort' in e.metadata) || !e.metadata['dc:sort'])
        this.listViewData = [...first.sort((a, b) => b.sort - a.sort), ...last]
      } finally {
        this.loading = false
      }
    },
    createFolderDialog () {
      this.dialogAddFolderVisible = true
    },
    async createFolderFinish () {
      this.dialogAddFolderVisible = false
      await this.initByListView(this.lastCrumb.id)
      await this.getTreeData()
      // this.folderLoading = true
      // try {
      //   const res = await getJSON(this.lastCrumb.id)
      //   this.folderJson = Object.keys(res)
      //   if (this.folderJson.some(e => e === this.folderForm.folderName)) {
      //     this.showPopover = true
      //   } else {
      //     const formData = new FormData()
      //     formData.append('./jcr:content/jcr:title', this.folderForm.folderTitle)
      //     formData.append(':name', this.folderForm.folderName)
      //     if (this.folderForm.sort) {
      //       formData.append('./jcr:content/dc:sort', dayjs(this.folderForm.sort).format())
      //       formData.append('./jcr:content/dc:sort@TypeHint', 'Date')
      //     }
      //     const res = await createFolderByAem(`${this.lastCrumb.id}/${this.folderForm.folderName}`, formData)
      //     // const { success } = await createFolder({
      //     //   ...this.folderForm,
      //     //   filePath: this.lastCrumb.id
      //     // })
      //     if (res['status.code'] === 200 || res['status.code'] === 201) {
      //       this.$message({
      //         message: '创建成功',
      //         type: 'success'
      //       })
      //       this.dialogAddFolderVisible = false
      //       this.folderJson = []
      //       await this.initByListView(this.lastCrumb.id)
      //       await this.getTreeData()
      //     } else {
      //       this.$message({
      //         message: res['status.message'],
      //         type: 'error'
      //       })
      //     }
      //   }
      // } finally {
      //   this.folderLoading = false
      // }
    },
    folderDialogClose () {
      this.folderForm.folderTitle = ''
      this.folderForm.folderName = ''
      this.folderForm.sort = ''
      this.folderLoading = false
      this.showPopover = false
    },
    async deleteAsset () {
      this.dialogDeleteFolderVisible = false
      await this.initByListView(this.lastCrumb.id)
      if (this.$refs.table.selection.some(e => e.nodeType !== 'dam:Asset')) {
        await this.getTreeData()
      }
    },
    handleSelectionChange (selection) {
      this.settingBtn = [...this.settingBtn.map(e => ({
        ...e,
        show: e.icon === 'el-icon-info' ? selection.length === 1 || selection.every(e => e.nodeType === 'dam:Asset') : e.show
      }))]
      this.showDownloadBox = selection.length === 0 ? false : selection.every(e => e.nodeType === 'dam:Asset')
    },
    handleTableCellClick (row) {
      // console.log(this.breadcrumb)
      // console.log(row)
      const {
        assetId,
        properties,
        nodeType,
        path,
        name
      } = row
      if (nodeType !== 'dam:Asset') {
        this.setBreadcrumb([...this.breadcrumb, {
          id: assetId,
          title: properties ? properties['jcr:title'] : name
        }])
        this.initByListView(path)
      } else {
        this.detailArr = [...this.listViewData.filter(e => e.nodeType === 'dam:Asset')]
        this.detailData = row
        this.showDetailDrawer = true
      }
    },
    handleBreadCrumb (id, index) {
      if (index + 1 === this.breadcrumb.length) return
      this.setBreadcrumb([...this.breadcrumb.filter((_, idx) => idx <= index)])
      this.initByListView(id)
    },
    handleAllSelect () {
      this.$refs.table.toggleAllSelection()
    },
    handleRemove () {
      this.drawerTitle = 'move'
      this.drawerSelectData = this.$refs.table.selection
      this.showDrawer = true
    },
    handleDetailToMove (data) {
      this.drawerTitle = 'move'
      this.drawerSelectData = [{ ...data }]
      this.showDrawer = true
    },
    handleCopy () {
      this.drawerTitle = 'copy'
      this.drawerSelectData = this.$refs.table.selection
      this.showDrawer = true
    },
    handleCopyAndMove (id) {
      this.initByListView(id)
      this.showDrawer = false
    },
    refresh () {
      const { id } = this.lastCrumb
      this.initByListView(id)
    },
    handleUploadBox () {
      if (this.showUploadBox === false) {
        this.showUploadBox = true
      } else {
        this.showUploadBox = false
      }
    },
    handleUploadDialog (flag) {
      flag && this.refresh()
      this.showUpload = false
    }
  }
}
</script>

<style lang="scss" scoped>
.container-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0 20px;

  /deep/ .bread-crumb {
    padding: 24px 10px 20px;
    font-size: 14px;
    line-height: 20px;
    color: #222222;
    border-bottom: 1px solid #E7E7E7;

    &:before {
      display: none;
    }

    &:after {
      display: none;
    }

    .el-breadcrumb__inner {
      cursor: pointer;
      color: #999999;
    }

    .el-icon-arrow-right {
      color: #979797;
    }

    .bread-crumb-item:not(:last-child) :hover {
      color: #409eff;
    }

    .el-breadcrumb__item:last-child {
      .el-breadcrumb__inner {
        color: #222222;
      }
    }
  }

  .manage-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .search-filter-container {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .search-container {
        box-sizing: border-box;
        display: flex;
        justify-content: flex-end;
        padding-left: 20px;

        .left-content {
          display: flex;
          height: 36px;
          border-radius: 18px;
          width: 292px;
          align-items: center;
          position: absolute;
          top: 14px;
          right: 260px;
          z-index: 1999;
          background: #ffffff;

          /deep/ .input {
            padding-left: 12px;

            .el-input__inner {
              border: 0;
              border-radius: 0;
              height: 36px;
              line-height: 36px;
              padding-left: 0;
              padding-right: 24px;
            }

            .el-input__suffix {
              right: 0;

              .el-input__clear {
                font-size: 20px;
                line-height: 36px;
              }
            }
          }

          /deep/ .button {
            border-radius: 0 14px 14px 0;
            height: 28px;
            background: transparent;
            border: 0;
            position: relative;
            margin-right: 4px;
            -webkit-transition: .3s ease-out;
            transition: .3s ease-out;

            .el-icon-search {
              display: inline-block;
              width: 24px;
              height: 24px;
              background: url("../../assets/home/nav-search.png") no-repeat center;
              position: absolute;
              top: 50%;
              right: 10px;
              transform: translateY(-50%);

              &:before {
                display: none;
              }
            }

            &:hover {
              background: #ECFAFF;
            }
          }

          /deep/ .select {
            width: 75px;

            &:after {
              content: '';
              position: absolute;
              top: 50%;
              right: 0;
              height: 16px;
              width: 1px;
              background-color: #BABABA;
              transform: translateY(-50%);
            }

            .el-input {
              height: 100%;

              .el-input__inner {
                height: 36px;
                line-height: 36px;
                border-radius: 18px 0 0 18px;
                padding-right: 26px;
              }

              .el-input__suffix {
                height: 20px;
                top: 50%;
                transform: translateY(-50%);

                .el-input__icon {
                  display: inline-block;
                  width: 20px;
                  height: 20px;
                  background: url("../../assets/home/nav-arrow.png") no-repeat center;
                  transform: none;

                  &.is-reverse {
                    transform: rotate(180deg);
                  }

                  &:before {
                    display: none;
                  }

                  &:after {
                    display: none;
                  }
                }
              }
            }
          }
        }

        .right-content {
          display: flex;
          height: 64px;
          align-items: center;

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
            }

            &.all-btn {
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

          /deep/ .el-dropdown {
            height: 32px;

            .operate-btn {
              height: 32px;
              font-size: 14px;
              color: #3D3D3D;
              background: transparent;
              border-radius: 16px;
              border: 0;
              -webkit-transition: .3s ease-out;
              transition: .3s ease-out;

              i {
                font-size: 14px;
                -webkit-transition: .3s ease-out;
                transition: .3s ease-out;
              }

              &:hover {
                background: #ECFAFF;

                i {
                  transform: rotate(180deg);
                }
              }
            }
          }

          .button {
            display: flex;
            height: 100%;
            align-items: center;

            i {
              font-size: 24px;
              margin-right: 8px;
            }
          }

          .menu-icon {
            font-size: 24px;
            margin-left: 12px;
            margin-right: 24px;
            cursor: pointer;
          }
        }
      }

      .filter-container {
        display: flex;
        flex-wrap: nowrap;
        flex: 1;
        overflow: hidden;
        overflow-x: overlay;
        position: relative;

        &::-webkit-scrollbar {
          height: 6px;
        }

        &::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 5px;
        }

        .filter-item {
          position: relative;
          -webkit-box-flex: 0;
          -webkit-flex: 0 0 102px;
          -ms-flex: 0 0 102px;
          flex: 0 0 102px;
          max-width: 102px;
          margin-right: 8px;

          &.user-list {
            -webkit-flex: 0 0 76px;
            -ms-flex: 0 0 76px;
            flex: 0 0 76px;
            max-width: 76px;
          }

          &.all-list {
            -webkit-flex: 0 0 76px;
            -ms-flex: 0 0 76px;
            flex: 0 0 76px;
            max-width: 76px;
          }

          .filter-item:last-child {
            margin-right: 0;
          }

          &:after {
            display: none;
          }

          .update-time {
            width: 100%;
            height: 100%;
            //display: flex;
            //align-items: center;
            box-sizing: border-box;
            color: #222222;
            padding-left: 15px;
            font-size: 14px;
            cursor: pointer;
            padding-right: 25px;
            position: relative;

            span {
              display: block;
              height: 40px;
              line-height: 40px;
              margin-top: -1px;
            }

            .time-icon {
              transition: all .3s;
              position: absolute;
              top: 50%;
              right: 5px;
              transform: translateY(-50%);
            }

            .iconTime {
              transform: translateY(-50%) rotate(-180deg);
            }
          }
        }

        .filter-item:not(:last-child):after {
          content: '';
          position: absolute;
          right: 0;
          top: 10%;
          width: 1px;
          height: 80%;
          background-color: rgb(121, 121, 121);
          // border-right: 1px solid rgb(121, 121, 121);
        }

        .el-select {

          /deep/ .el-input__inner {
            border: none;
            color: #222222;
            padding-right: 25px;
          }

          /deep/ .el-input__inner {
            &::placeholder {
              color: #222222;
            }
          }

          /deep/ .el-select__caret {
            color: #222222;
          }
        }
      }
    }

    .content {
      background-color: rgb(242, 242, 242);
      flex: 1;

      .list-view {
        height: 100%;

        /deep/ .el-table__header-wrapper {
          .el-checkbox {
            display: none;
          }

          .has-gutter {
            > tr {
              background: #F7F8FA;
              border-radius: 4px;
              overflow: hidden;

              th.el-table__cell {
                background: #F7F8FA;
                border: 0;

                .cell {
                  font-size: 16px;
                  color: #666666;
                  line-height: 24px;
                  font-weight: 400;
                  padding: 0 5px;
                }

                &:first-child {
                  border-radius: 4px 0 0 4px;
                }

                &:last-child {
                  border-radius: 0 4px 4px 0;
                }
              }
            }
          }
        }

        /deep/ .el-table__body-wrapper {
          &::-webkit-scrollbar {
            width: 6px;
          }

          &::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 5px;
          }

          .el-table__body {
            width: 100%;

            .cell {
              padding: 0 5px;
            }
          }
        }

        /deep/ .el-table tbody tr {
          > td {
            border-color: #E7E7E7;
          }

          &:hover {
            > td {
              cursor: pointer;
              background-color: #EFFAFF;
            }
          }
        }

        /deep/ .el-table .el-table__cell:nth-of-type(2) {
          padding: 0;
        }

        /deep/ .el-table .el-table__cell:last-of-type {
          padding: 0;
          font-size: 12px;
        }

        .first-column {
          font-size: 20px;
          height: 48px;
          width: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }
      }
    }

    .download-wrap {
      margin-left: 16px;
      position: relative;
      overflow: hidden;
      -webkit-transition: .3s ease-out;
      transition: .3s ease-out;

      &.active {
        overflow: visible;

        .upload-box {
          opacity: 1;
          right: -13px;
          bottom: -98px;
        }
      }

      .upload-title {
        font-size: 14px;
        color: #ffffff;
        height: 32px;
        line-height: 32px;
        background: #008ED3;
        border-radius: 16px;
        padding: 0 18px 0 34px;
        position: relative;
        cursor: pointer;

        &:before {
          content: '';
          display: inline-block;
          width: 20px;
          height: 20px;
          background: url("../../assets/home/download-white.png") no-repeat center;
          position: absolute;
          top: 50%;
          left: 10px;
          transform: translateY(-50%);
        }
      }

      .upload-box {
        width: 125px;
        background: #FFFFFF;
        box-shadow: 0 6px 24px 0 rgba(0, 0, 0, 0.1148);
        border-radius: 5px;
        position: absolute;
        right: -13px;
        bottom: -150px;
        z-index: 10;
        padding: 8px 0;
        opacity: 0;
        -webkit-transition: .3s ease-out;
        transition: .3s ease-out;

        span {
          display: block;
          font-size: 14px;
          line-height: 20px;
          padding: 8px 12px 8px 42px;
          position: relative;
          color: #444444;
          -webkit-transition: .3s ease-out;
          transition: .3s ease-out;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          cursor: pointer;

          &.upload-file:before {
            content: '';
            display: inline-block;
            width: 20px;
            height: 20px;
            background: url("../../assets/home/file.png") no-repeat center;
            position: absolute;
            top: 50%;
            left: 12px;
            transform: translateY(-50%);
          }

          &.upload-folder:before {
            content: '';
            display: inline-block;
            width: 20px;
            height: 20px;
            background: url("../../assets/home/folder.png") no-repeat center;
            position: absolute;
            top: 50%;
            left: 12px;
            transform: translateY(-50%);
          }

          &:hover {
            background: #ECFAFF;
            color: #000000;
          }
        }
      }
    }

    .upload-wrap {
      margin-left: 16px;
      position: relative;
      overflow: hidden;
      -webkit-transition: .3s ease-out;
      transition: .3s ease-out;

      &.active {
        overflow: visible;

        .upload-box {
          opacity: 1;
          right: -13px;
          bottom: -98px;
        }
      }

      .upload-title {
        font-size: 14px;
        color: #ffffff;
        height: 32px;
        line-height: 32px;
        background: #008ED3;
        border-radius: 16px;
        padding: 0 18px 0 34px;
        position: relative;
        cursor: pointer;

        &:before {
          content: '';
          display: inline-block;
          width: 20px;
          height: 20px;
          background: url("../../assets/home/upload.png") no-repeat center;
          position: absolute;
          top: 50%;
          left: 10px;
          transform: translateY(-50%);
        }
      }

      .upload-box {
        width: 125px;
        background: #FFFFFF;
        box-shadow: 0 6px 24px 0 rgba(0, 0, 0, 0.1148);
        border-radius: 5px;
        position: absolute;
        right: -13px;
        bottom: -150px;
        z-index: 10;
        padding: 8px 0;
        opacity: 0;
        -webkit-transition: .3s ease-out;
        transition: .3s ease-out;

        span {
          display: block;
          font-size: 14px;
          line-height: 20px;
          padding: 8px 12px 8px 42px;
          position: relative;
          color: #444444;
          -webkit-transition: .3s ease-out;
          transition: .3s ease-out;
          -webkit-box-sizing: border-box;
          box-sizing: border-box;
          cursor: pointer;

          &.upload-file:before {
            content: '';
            display: inline-block;
            width: 20px;
            height: 20px;
            background: url("../../assets/home/file.png") no-repeat center;
            position: absolute;
            top: 50%;
            left: 12px;
            transform: translateY(-50%);
          }

          &.upload-folder:before {
            content: '';
            display: inline-block;
            width: 20px;
            height: 20px;
            background: url("../../assets/home/folder.png") no-repeat center;
            position: absolute;
            top: 50%;
            left: 12px;
            transform: translateY(-50%);
          }

          &:hover {
            background: #ECFAFF;
            color: #000000;
          }
        }
      }
    }
  }

  .showHover {
    background-color: #ecf5ff;
    color: #66b1ff;
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

.delete-btn-special {
  background-color: rgb(220, 85, 75) !important;
  border-color: rgb(220, 85, 75) !important;
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
</style>
