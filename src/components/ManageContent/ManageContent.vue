<template>
  <div class="container-content">
    <el-breadcrumb separator-class="el-icon-arrow-right" class="bread-crumb">
      <el-breadcrumb-item class="bread-crumb-item" v-for="(item,index) in breadcrumb"
                          :key="item.id" @click.native="handleBreadCrumb(item.id,index)">{{ item.title }}
      </el-breadcrumb-item>
    </el-breadcrumb>
    <div class="manage-container">
      <div class="search-container">
        <search class="left-content"/>
        <div class="right-content">
          <el-button v-permission="assetRole" type="primary" size="mini" @click="createFolderDialog" class="btn">
            <div class="button"><i class="el-icon-folder search-icon"/>新建文件夹</div>
          </el-button>
          <el-button v-permission="assetRole" type="primary" size="mini" @click="showUpload=true" class="btn">
            <div class="button"><i class="el-icon-upload search-icon"/>上传</div>
          </el-button>
          <el-button v-permission="assetRole" type="primary" size="mini" class="btn" @click="handleAllSelect">
            <div class="button"><i class="el-icon-circle-check search-icon"/>全选</div>
          </el-button>
          <el-dropdown v-show="showSettingBtn()" :hide-on-click="false" class="btn" style="margin-left: 10px;"
                       @command="handleSettingCommand">
            <el-button type="primary" size="mini" class="btn">
              操作<i class="el-icon-arrow-down el-icon--right"></i>
            </el-button>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item v-for="item in settingBtn" :key="item.icon" :icon="item.icon" v-show="item.show"
                                :command="item.icon">
                {{ item.label }}
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
        </div>
      </div>
      <div class="filter-container">
        <div class="filter-item">
          <el-select v-model="searchForm.fileType" clearable placeholder="文件类型">
            <el-option
              v-for="item in fileTypeSelect"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <el-select v-model="searchForm.portrait" clearable placeholder="人像">
            <el-option
              v-for="item in portraitSelect"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <el-select v-model="searchForm.authorization" clearable placeholder="授权状态">
            <el-option
              v-for="item in authorizationSelect"
              :key="item.value"
              :label="item.label"
              :value="item.value">
            </el-option>
          </el-select>
        </div>
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
        <div class="filter-item" style="padding-right: 12px">
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
        <div class="filter-item" style="padding-right: 12px">
          <el-popover
            placement="bottom"
            trigger="click"
            @show="showUpdateTime = !showUpdateTime"
            @hide="showUpdateTime = !showUpdateTime">
            <el-date-picker
              v-model="searchForm.updateTime"
              type="datetimerange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
              :default-time="['00:00:00']">
            </el-date-picker>
            <div slot="reference" class="update-time">
              <span>修改时间</span>
              <i :class="['el-icon-arrow-down','time-icon',{iconTime:showUpdateTime}]"/>
            </div>
          </el-popover>
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
              v-if="assetRole"
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
            <el-table-column
              prop="name"
              label="名称">
            </el-table-column>
            <!--            width="240"-->
            <el-table-column
              label="标题">
              <template slot-scope="scope">
                <span
                  v-if="scope.row.metadata && ('jcr:title' in scope.row.metadata||'dc:title' in scope.row.metadata)">
                  {{ scope.row.metadata['jcr:title'] || scope.row.metadata['dc:title'] }}
                </span>
                <span v-else>{{ scope.row.properties ? scope.row.properties['jcr:title'] : '' }}</span>
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
          </el-table>
        </div>
        <div v-show="dropDownValue==='el-icon-picture'">
          卡片视图{{ lastCrumb.id }}
        </div>
        <div v-show="dropDownValue==='el-icon-s-data'">
          列视图{{ lastCrumb.id }}
        </div>
      </div>

      <el-dialog width="360px" title="创建文件夹" :visible.sync="dialogAddFolderVisible" @close="folderDialogClose">
        <el-form label-position="top" label-width="80px" :model="folderForm">
          <el-form-item label="标题" :required="true">
            <el-input v-model="folderForm.folderTitle" @input="handleFolderName"></el-input>
          </el-form-item>
          <el-tooltip :value="showPopover" :manual="true" popper-class="my-popper">
            <div slot="content">资源已存在</div>
            <el-form-item label="名称">
              <el-input v-model="folderForm.folderName"></el-input>
            </el-form-item>
          </el-tooltip>
          <el-form-item label="排序">
            <el-date-picker
              style="width: 100%;"
              v-model="folderForm.sort"
              type="datetime"
              :value-format="dateValueFormat"
              default-time="00:00:00">
            </el-date-picker>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="dialogAddFolderVisible = false">取 消</el-button>
        <el-button type="primary" :disabled="!folderForm.folderTitle||!folderForm.folderName||showPopover"
                   :loading="folderLoading"
                   @click="createFolder">确 定</el-button>
      </span>
      </el-dialog>
      <el-dialog width="320px" title="删除资产" :visible.sync="dialogDeleteFolderVisible" @open="handleDeleteDialog">
        <div style="color: #222222">{{ deleteTitle }}</div>
        <p style="max-height: 180px;overflow: auto;color: #222222" v-html="deleteContent"></p>
        <span slot="footer" class="dialog-footer">
        <el-button @click="dialogDeleteFolderVisible = false">取 消</el-button>
        <el-button type="danger" :loading="folderLoading"
                   @click="deleteAsset">删 除</el-button>
      </span>
      </el-dialog>
    </div>
    <drawer :drawer.sync="showDrawer" :title="drawerTitle" :selectData="drawerSelectData"
            @finish="handleCopyAndMove"/>
    <upload :dialog-visible.sync="showUpload" @finish="refresh" :exist-data="listViewData"/>
    <detail-drawer :drawer.sync="showDetailDrawer" :all-detail-data="detailArr" :detail="detailData"
                   @move="handleDetailToMove"/>
    <div style="display: none" v-html="errorData"></div>
  </div>

</template>

<script>
import search from '@/components/Search/Search'
import drawer from '@/components/Drawer/Drawer'
import upload from '@/components/Upload/Upload'
import detailDrawer from '@/components/DetailDrawer/DetailDrawer'
import zteStore from '@/store'
import { mapState, mapActions } from 'pinia'
import { getTree, command, getJSON, folderTree, searchPopularTag, createFolderByAem } from '@/api/api'
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

dayjs.extend(isBetween)
dayjs.extend(utc)

export default {
  name: 'ManageContent',
  components: {
    search,
    drawer,
    upload,
    detailDrawer
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
      showUpdateTime: false,
      showAuthorizationDuration: false,
      dateValueFormat: 'yyyy-MM-dd HH:mm:ss',
      drawerTitle: 'move',
      drawerSelectData: [],
      detailArr: [],
      detailData: {},
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
      deleteTitle: '',
      deleteContent: ''
    }
  },
  methods: {
    ...mapActions(zteStore, ['setBreadcrumb', 'setSelected', 'getTreeData']),
    handleSettingCommand (command) {
      command === 'el-icon-delete' && (this.dialogDeleteFolderVisible = true)
      command === 'el-icon-position' && this.handleRemove()
      command === 'el-icon-copy-document' && this.handleCopy()
      command === 'el-icon-info' && this.handleJump()
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
    handleFolderName () {
      this.folderForm.folderName = this.folderForm.folderTitle
    },
    async createFolder () {
      this.folderLoading = true
      try {
        const res = await getJSON(this.lastCrumb.id)
        this.folderJson = Object.keys(res)
        if (this.folderJson.some(e => e === this.folderForm.folderName)) {
          this.showPopover = true
        } else {
          const formData = new FormData()
          formData.append('./jcr:content/jcr:title', this.folderForm.folderTitle)
          formData.append(':name', this.folderForm.folderName)
          if (this.folderForm.sort) {
            formData.append('./jcr:content/dc:sort', dayjs(this.folderForm.sort).format())
            formData.append('./jcr:content/dc:sort@TypeHint', 'Date')
          }
          const res = await createFolderByAem(`${this.lastCrumb.id}/${this.folderForm.folderName}`, formData)
          // const { success } = await createFolder({
          //   ...this.folderForm,
          //   filePath: this.lastCrumb.id
          // })
          if (res['status.code'] === 200 || res['status.code'] === 201) {
            this.$message({
              message: '创建成功',
              type: 'success'
            })
            this.dialogAddFolderVisible = false
            this.folderJson = []
            await this.initByListView(this.lastCrumb.id)
            await this.getTreeData()
          } else {
            this.$message({
              message: res['status.message'],
              type: 'error'
            })
          }
        }
      } finally {
        this.folderLoading = false
      }
    },
    folderDialogClose () {
      this.folderForm.folderTitle = ''
      this.folderForm.folderName = ''
      this.folderForm.sort = ''
      this.folderLoading = false
      this.showPopover = false
    },
    handleDeleteDialog () {
      const length = this.$refs.table.selection.length
      this.deleteTitle = length === 1 ? '您即将删除以下资产:' : `您即将删除以下 ${length} 个资产:`
      this.deleteContent = this.$refs.table.selection.map((e, index) => index + 1 === length ? `${e.properties['jcr:title'] || e.name}` : `${e.properties['jcr:title'] || e.name}<br>`).join('')
    },
    async deleteAsset () {
      this.folderLoading = true
      try {
        const formData = new FormData()
        formData.append('cmd', 'deletePage')
        this.$refs.table.selection.forEach(e => {
          formData.append('path', e.path)
        })
        try {
          await command(formData)
          this.dialogDeleteFolderVisible = false
          this.$message({
            message: '删除成功',
            type: 'success'
          })
          await this.initByListView(this.lastCrumb.id)
          if (this.$refs.table.selection.some(e => e.nodeType !== 'dam:Asset')) {
            await this.getTreeData()
          }
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
        this.folderLoading = false
      }
    },
    handleSelectionChange (selection) {
      this.settingBtn = [...this.settingBtn.map(e => ({
        ...e,
        show: e.icon === 'el-icon-info' ? selection.length === 1 || selection.every(e => e.nodeType === 'dam:Asset') : e.show
      }))]
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
    }
  }
}
</script>

<style lang="scss" scoped>
.container-content {
  height: 100%;
  display: flex;
  flex-direction: column;

  .bread-crumb {
    padding: 12px 0 12px 12px;
    font-size: 16px;
    color: #222222;

    /deep/ .el-breadcrumb__inner {
      cursor: pointer;
    }

    .bread-crumb-item:not(:last-child) :hover {
      color: #409eff;
    }
  }

  .manage-container {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .search-container {
      box-sizing: border-box;
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding: 8px 12px 8px 0;
      border: 1px solid #f3f5f8;

      .left-content {
        display: flex;
        height: 45px;
        width: 36%;
        align-items: center;

        /deep/ .input {
          padding-left: 12px;

          .el-input__inner {
            border-top: 1px solid rgb(170, 170, 170);
            border-left: 1px solid rgb(170, 170, 170);
            border-bottom: 1px solid rgb(170, 170, 170);
            border-radius: 6px 0 0 6px;
            height: 45px;
            line-height: 45px;
          }
        }

        /deep/ .button {
          border-radius: 0 6px 6px 0;
        }
      }

      .right-content {
        display: flex;
        height: 45px;
        align-items: center;

        .btn {
          height: 100%;
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
      background-color: rgb(242, 242, 242);
      padding: 6px 0;
      flex-wrap: nowrap;

      .filter-item {
        position: relative;
        flex: 1;

        .update-time {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-sizing: border-box;
          color: #222222;
          padding-left: 15px;
          font-size: 14px;
          cursor: pointer;

          .time-icon {
            transition: all .3s;
          }

          .iconTime {
            transform: rotate(-180deg);
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
          background-color: rgb(242, 242, 242);
          color: #222222;
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

    .content {
      background-color: rgb(242, 242, 242);
      flex: 1;

      .list-view {
        height: 100%;

        /deep/ .el-table__header-wrapper .el-checkbox {
          display: none;
        }

        /deep/ .el-table tbody tr:hover > td {
          cursor: pointer;
          background-color: rgb(237, 237, 237);
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
</style>
<style>
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
