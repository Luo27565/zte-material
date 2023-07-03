<template>
  <el-table
    class="table-view"
    ref="table"
    :row-style="{height:'48px'}"
    height="100%"
    @selection-change="handleSelectionChange"
    v-el-table-infinite-scroll="handleMore"
    :infinite-scroll-disabled="disabled"
    :infinite-scroll-immediate="false"
    :infinite-scroll-distance='1'
    :infinite-scroll-delay="300"
    :data="tableData">
    <el-table-column
      type="selection"
      align="center"
      v-if="showSelect"
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
      <template slot-scope="scope">
        <div class="name" @click="jump(scope.row)">{{ scope.row.name }}</div>
      </template>
    </el-table-column>
    <el-table-column
      width="280"
      label="标题">
      <template slot-scope="scope">
                <span v-if="scope.row.metadata">
                  {{ scope.row.metadata['jcr:title'] || scope.row.metadata['dc:title'] }}
                </span>
        <span v-else>{{ scope.row.properties ? scope.row.properties['jcr:title'] : '' }}</span>
      </template>
    </el-table-column>
    <el-table-column
      prop="tagsText"
      label="标签">
    </el-table-column>
    <el-table-column
      width="120"
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
    <el-table-column
      width="120"
      label="大小">
      <template slot-scope="scope">
        <template v-if="scope.row.metadata">
          <span>{{ scope.row.metadata['dam:size'] | formatSize }}</span>
        </template>
      </template>
    </el-table-column>
    <el-table-column
      width="160"
      label="尺寸">
      <template slot-scope="scope">
        <template v-if="scope.row.metadata">
                  <span v-if="scope.row.metadata['tiff:ImageWidth']&&scope.row.metadata['tiff:ImageLength']">
                    {{ `${scope.row.metadata['tiff:ImageWidth']} x ${scope.row.metadata['tiff:ImageLength']}` }}
                  </span>
        </template>
      </template>
    </el-table-column>
    <el-table-column
      width="240"
      label="修改时间">
      <template slot-scope="scope">
        <template v-if="scope.row.properties">
          <div style="display: flex;flex-direction: column;">
            <span>{{ scope.row.properties['jcr:lastModified'] | formatLastModifiedTime }}</span>
            <span>{{ scope.row.properties['jcr:lastModifiedBy'] }}{{ showSelect ? 1 : 2 }}</span>
          </div>
        </template>
      </template>
    </el-table-column>
    <detail-drawer :drawer.sync="detailDrawer" :all-detail-data="[detailData]" :detail="detailData"/>
  </el-table>
</template>

<script>
import { baseUrl } from '@/utils'
import ElTableInfiniteScroll from 'el-table-infinite-scroll'
import detailDrawer from '@/components/DetailDrawer/DetailDrawer'

export default {
  name: 'TableView',
  directives: {
    'el-table-infinite-scroll': ElTableInfiniteScroll
  },
  components: {
    detailDrawer
  },
  props: {
    showSelect: {
      type: Boolean,
      default: true
    },
    tableData: {
      type: Array,
      default: () => []
    },
    total: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      baseUrl,
      disabled: false,
      detailDrawer: false,
      detailData: {},
      pathItem: ''
    }
  },
  methods: {
    handleMore () {
      if (this.tableData.length === this.total) {
        this.disabled = true
      } else {
        this.$emit('onScroll', false)
      }
    },
    handleSelectionChange (selection) {
      this.$emit('selected', !!selection.length)
    },
    jump (row) {
      this.detailData = row
      this.detailDrawer = true
      // const { path } = row
      // this.pathItem = path
      // this.infoDrawer = true
      // const { path } = this.$route
      // this.$router.push({
      //   path,
      //   query: {
      //     path: row.path
      //   }
      // })
    }
  }
}
</script>

<style lang="scss" scoped>
.table-view {

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

  /deep/ .el-table__header-wrapper .el-checkbox {
    display: none;
  }

  /deep/ .el-table tbody tr:hover > td {
    cursor: pointer !important;
    background-color: rgb(237, 237, 237);
  }

  /deep/ .el-table .el-table__cell:nth-of-type(2) {
    padding: 0;
  }

  /deep/ .el-table .el-table__cell:last-of-type {
    padding: 0;
    font-size: 12px;
  }
}
</style>
