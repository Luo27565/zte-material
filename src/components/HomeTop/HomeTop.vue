<template>
  <div class="container home-top">
    <div class="content">
      <search class="home-top-search" ref="search"/>
      <div class="popular-tags-container">
        <div style="order: 5;color: #008ED3;" v-if="popularTags.length">
          热门标签：
        </div>
        <div class="popular-tags" v-if="popularTags.length">
        <span class="item" v-for="item in popularTags" :key="item.key" @click="handleTags(item.label)">
          {{ item.label }}
        </span>
        </div>
        <el-popover placement="bottom" width="340" v-model="showPopper" v-if="assetRole" @show="getTags"
                    @hide="tagForm.tag = ''"
                    popper-class="popular-tags-popper">
          <div>
            <div class="tag-list">
              <div v-for="item in popularTags" :key="item.key" class="tag-list-item">
                <span>{{ item.label }}</span>
                <i @click="handleDeleteTag(item.key)" class="el-icon-delete"/>
              </div>
            </div>
            <el-form :rules="rules" :model="tagForm" ref="tagForm">
              <el-form-item prop="tag">
                <el-input class="add-input" v-model="tagForm.tag" clearable placeholder="请输入标签标题">
                  <el-button @click="handleAddTag" slot="append" class="add-btn" type="primary">新增</el-button>
                </el-input>
              </el-form-item>
            </el-form>
          </div>
          <span class="item" slot="reference">编辑推荐</span>
        </el-popover>

      </div>
    </div>
  </div>
</template>

<script>
import search from '@/components/Search/Search'
import { searchPopularTag, deleteTag, addTag } from '@/api/api'
import { mapState } from 'pinia/dist/pinia'
import zteStore from '@/store'

export default {
  name: 'HomeTop',
  components: {
    search
  },
  computed: {
    ...mapState(zteStore, ['assetRole'])
  },
  data () {
    const checkTag = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入标签名称'))
      } else if (value.includes('/')) {
        return callback(new Error('请输入正确的标签名称'))
      } else {
        return callback()
      }
    }
    return {
      popularTags: [],
      tagForm: {
        tag: ''
      },
      showPopper: false,
      rules: {
        tag: [{
          validator: checkTag,
          trigger: 'blur'
        }]
      }
    }
  },
  methods: {
    handleTags (label) {
      this.$refs.search.input = label
      this.$refs.search.handleInput()
    },
    async getTags () {
      const { results } = await searchPopularTag()
      const flag = Object.keys(results)
      this.popularTags = flag.map(e => ({
        label: results[e],
        key: e
      }))
    },
    async handleDeleteTag (key) {
      const [_, val] = key.split('popular-tags:')
      const formData = new FormData()
      formData.append('tagPath', `/content/cq:tags/popular-tags/${val}`)
      const {
        status,
        success,
        errorMessage
      } = await deleteTag(formData)
      if (status === 200 && success) {
        this.$message.success('删除标签成功')
        await this.getTags()
        this.showPopper = false
      } else {
        this.$message.error(`删除标签失败，${errorMessage}`)
      }
    },
    handleAddTag () {
      this.$refs.tagForm.validate(async valid => {
        if (valid) {
          const formData = new FormData()
          formData.append('./jcr:title', this.tagForm.tag)
          formData.append('_charset_', 'UTF-8')
          const res = await addTag(`/content/cq:tags/popular-tags/${this.tagForm.tag}`
            , formData)
          if (res['status.code'] === 200 || res['status.code'] === 201) {
            this.$message.success({
              message: '添加标签成功',
              duration: 3000,
              onClose: () => {
                this.getTags()
                this.showPopper = false
              }
            })
          } else {
            this.$message.error(
              `失败 ${res['status.message']}`
            )
          }
        }
      })
    }
  },
  mounted () {
    this.getTags()
  }
}
</script>

<style scoped lang="scss">
/deep/ .add-btn {
  background: #008ED3 !important;
  border: 1px solid #008ED3 !important;
  color: #FFFFFF !important;
  border-radius: 0 16px 16px 0 !important;
}

/deep/ .add-input .el-input__inner {
  border-radius: 16px 0 0 16px !important;
}

/deep/ .add-input .el-input-group__append {
  border-radius: 0 16px 16px 0 !important;
}

.home-top {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .content {
    width: 44%;
    display: flex;
    flex-direction: column;

    .container {
      height: 60px;
      border-radius: 30px;
      background: #ffffff;

      /deep/ .select {
        width: 150px;
        height: 50px;
        margin-top: 5px;
        margin-left: 5px;

        &:after {
          display: none;
        }

        .el-input {
          height: 100%;
          position: relative;

          .el-input__inner {
            height: 100%;
            background: #ECFAFF;
            border-radius: 25px;
            font-size: 16px;
            color: #008ED3;
            line-height: 50px;
            padding-left: 30px;
          }

          .el-input__suffix {
            width: 21px;
            height: 21px;
            position: absolute;
            top: 50%;
            right: 24px;
            margin-top: 1px;
            transform: translateY(-50%) rotate(180deg);

            .el-input__icon {
              display: inline-block;
              width: 22px;
              height: 21px;
              background: url("../../assets/home/select-arrow.png") no-repeat center;
              background-size: cover;
              transform: none;

              &:before {
                display: none;
              }

              &:after {
                display: none;
              }
            }
          }

          &:before {
            content: 'ALL';
            font-size: 10px;
            line-height: 20px;
            color: #008ED3;
            display: inline-block;
            width: 20px;
            height: 20px;
            position: absolute;
            top: 50%;
            left: 28px;
            margin-top: 1px;
            transform: translateY(-50%);
          }

          .el-select__caret.is-reverse {
            transform: rotate(180deg);
          }
        }

        .el-select-dropdown {
          border: 0;
          border-radius: 5px;
          box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.05), 0 2px 5px 0 rgba(50, 50, 105, 0.15);

          .popper__arrow {
            display: none;
          }

          .el-select-dropdown__list {
            padding: 0;

            li {
              padding: 12px 28px 12px 58px;
              height: auto;
              font-size: 16px;
              line-height: 20px;
              color: #222222;
              position: relative;

              &:first-child {
                border-radius: 5px 5px 0 0;
              }

              &:last-child {
                border-radius: 0 0 5px 5px;
              }

              &:before {
                content: '';
                display: inline-block;
                width: 20px;
                height: 20px;
                position: absolute;
                top: 50%;
                left: 28px;
                transform: translateY(-50%);
              }

              &.select-all:before {
                content: 'ALL';
                font-size: 10px;
                margin-top: 1px;
              }

              &.select-image:before {
                background: url("../../assets/home/select-image.png") no-repeat center;
              }

              &.select-video:before {
                background: url("../../assets/home/select-video.png") no-repeat center;
              }

              &.select-music:before {
                background: url("../../assets/home/select-music.png") no-repeat center;
              }

              &.select-font:before {
                background: url("../../assets/home/select-font.png") no-repeat center;
              }

              &.select-file:before {
                background: url("../../assets/home/select-file.png") no-repeat center;
              }

              &.selected {
                background: #ECFAFF;
                color: #008ED3;
                font-weight: normal;

                &.select-image:before {
                  background: url("../../assets/home/selected-image.png") no-repeat center;
                }

                &.select-video:before {
                  background: url("../../assets/home/selected-video.png") no-repeat center;
                }

                &.select-music:before {
                  background: url("../../assets/home/selected-music.png") no-repeat center;
                }

                &.select-font:before {
                  background: url("../../assets/home/selected-font.png") no-repeat center;
                }

                &.select-file:before {
                  background: url("../../assets/home/selected-file.png") no-repeat center;
                }
              }
            }
          }
        }

        &[data-class='image'] {
          .el-input {
            &:before {
              content: '';
              background: url("../../assets/home/selected-image.png") no-repeat center;
            }
          }
        }

        &[data-class='video'] {
          .el-input {
            &:before {
              content: '';
              background: url("../../assets/home/selected-video.png") no-repeat center;
            }
          }
        }

        &[data-class='music'] {
          .el-input {
            &:before {
              content: '';
              background: url("../../assets/home/selected-music.png") no-repeat center;
            }
          }
        }

        &[data-class='font'] {
          .el-input {
            &:before {
              content: '';
              background: url("../../assets/home/selected-font.png") no-repeat center;
            }
          }
        }

        &[data-class='file'] {
          .el-input {
            &:before {
              content: '';
              background: url("../../assets/home/selected-file.png") no-repeat center;
            }
          }
        }
      }

      /deep/ .input {
        .el-input__inner {
          height: 100%;
          line-height: 60px;
          font-size: 16px;
          color: #000000;
        }

        .el-input__clear {
          font-size: 24px;
          line-height: 60px;
        }
      }

      /deep/ .button {
        border: 0;
        height: 50px;
        border-radius: 25px;
        background: transparent;
        color: #000000;
        margin-top: 5px;
        margin-right: 5px;
        -webkit-transition: .3s ease-out;
        transition: .3s ease-out;

        &:hover {
          background: #ECFAFF;
        }

        .el-icon-search {
          &:before {
            font-weight: bolder;
            color: #4E5969;
            font-size: 26px;
          }
        }
      }
    }

    .popular-tags-container {
      margin-top: 14px;
      display: flex;
      flex-direction: row-reverse;
      align-items: baseline;

      .popular-tags {
        order: 2;
        flex: 1;
        display: flex;
        align-items: center;
        //justify-content: center;
        flex-wrap: wrap;

        .item {
          display: inline-block;
          color: #FFFFFF;
          font-size: 14px;
          cursor: pointer;
          margin: 0 4px 12px;
          padding: 0 10px;
          line-height: 24px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 1014px;
          -webkit-transition: .3s ease-out;
          transition: .3s ease-out;

          &:hover {
            background: #ECFAFF;
            color: #008ED3;
          }
        }
      }

      .item {
        order: 3;
        display: inline-block;
        font-size: 14px;
        cursor: pointer;
        margin: 0 4px;
        padding: 0 10px;
        line-height: 24px;
        border-radius: 1014px;
        -webkit-transition: .3s ease-out;
        transition: .3s ease-out;
        background: #ECFAFF;
        color: #008ED3;
      }
    }
  }
}

.tag-list::-webkit-scrollbar {
  width: 8px;
  background-color: #F7F8FA;
}

.tag-list::-webkit-scrollbar-thumb {
  background: #ccc; // 滑块颜色
  border-radius: 5px; // 滑块圆角
}

.tag-list {
  margin-top: 12px;
  margin-bottom: 16px;
  max-height: 160px;
  overflow-y: auto;
  padding: 0 12px;

  .tag-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
    color: #222222;

    i {
      cursor: pointer;
    }
  }
}
</style>
