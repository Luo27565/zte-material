<template>
  <div class="container home-top">
    <div class="content">
      <search class="home-top-search" ref="search"/>
      <div class="popular-tags" v-if="popularTags.length">
        <span class="item" v-for="item in popularTags" :key="item.key" @click="handleTags(item.label)">
          {{ item.label }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import search from '@/components/Search/Search'
import { searchPopularTag } from '@/api/api'

export default {
  name: 'HomeTop',
  components: {
    search
  },
  data () {
    return {
      popularTags: []
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
    }
  },
  mounted () {
    this.getTags()
  }
}
</script>

<style scoped lang="scss">
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
      border-radius:30px;
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
          box-shadow: 0 1px 1px 0 rgba(0,0,0,0.05), 0 2px 5px 0 rgba(50,50,105,0.15);
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
              &.select-all:before{
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
          &:before{
            font-weight: bolder;
            color: #4E5969;
            font-size: 26px;
          }
        }
      }
    }

    .popular-tags {
      margin-top: 14px;
      display: flex;
      align-items: center;
      justify-content: center;

      .item {
        display: inline-block;
        color: #FFFFFF;
        font-size: 14px;
        cursor: pointer;
        margin: 0 4px;
        padding: 0 10px;
        line-height: 24px;
        background: rgba(255,255,255,0.5);
        border-radius: 1014px;
        -webkit-transition: .3s ease-out;
        transition: .3s ease-out;

        &:hover {
          background:#ECFAFF;
          color: #008ED3;
        }
      }
    }
  }
}
</style>
