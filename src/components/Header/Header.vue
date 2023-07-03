<template>
  <div>
    <div class="header-container">
      <div class="header-cnt">
        <div class="logo">
          <img class="Logo-img" :src="require('../../assets/home/logo-white.png')" alt="zte 中兴" />
          <span>品牌数字内容管理平台</span>
        </div>
        <div class="right-box">
          <div class="sculpture-wrap">
<!--            <img :src="require('../../assets/user/user-img.png')" alt="img">-->
            ZTE
          </div>
          <div class="user-info" :class="showBox?'active':''">
            <div class="user-name" @click="handleDropDown">{{ assetRole ? '素材组管理员用户' : '素材组普通用户' }}</div>
            <div class="info-box">
<!--              <span class="user-data"><a href="www.baidu.com">个人资料</a></span>-->
              <span class="log-off" @click="handleLoginOut">注销</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="header-box"></div>
  </div>
</template>

<script>
import { loginOut } from '@/api/api'
import zteStore from '@/store'
import { mapState } from 'pinia/dist/pinia'

export default {
  name: 'HeaderNav',
  data () {
    return {
      showBox: false
    }
  },

  computed: {
    ...mapState(zteStore, ['assetRole'])
  },
  methods: {
    handleDropDown () {
      if (this.showBox === false) {
        this.showBox = true
      } else {
        this.showBox = false
      }
    },
    handleLoginOut () {
      this.$confirm('确定退出素材库', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          await loginOut()
          sessionStorage.removeItem('assetRole')
          // window.location.href = '/apps/granite/core/content/login.html'
        } finally {
          location.reload()
        }
      })
    }
  }
}

</script>

<style lang="scss">
  .hear-nav .header-container {
    width: 100%;
    height: 64px;
    position: fixed;
    top: 0;
    left:0;
    z-index: 2100;
    background-color: #008ED3;
    box-shadow: 0 1px 2px 0 rgba(0,0,0,0.06), 0 1px 3px 0 rgba(0,0,0,0.1);

    .header-cnt {
      padding: 0 40px;
      display: flex;
      justify-content: space-between;
      align-items:center;

      .logo {
        height: 64px;
        display: flex;
        align-items:center;

        img {
          height: 28px;
        }

        span {
          display: inline-block;
          font-size: 16px;
          color: #fff;
          line-height: 26px;
          padding-left: 16px;
        }
      }

      .right-box {
        display: flex;
        align-items:center;
        position: relative;

        .sculpture-wrap {
          width: 32px;
          height: 32px;
          overflow: hidden;
          margin-right: 8px;
          border-radius: 16px;
          background: #ffffff;
          color: #008ed3;
          line-height: 32px;
          text-align: center;
          font-size: 12px;
          font-weight: 700;
        }

        .user-info {

          .user-name {
            display: flex;
            align-items:center;
            font-size: 14px;
            color: #ffffff;
            line-height: 20px;
            padding-right: 20px;
            position: relative;
            cursor: pointer;

            &:after {
              content: '';
              display: inline-block;
              width: 20px;
              height: 20px;
              background: url("../../assets/user/user-down.png") no-repeat center;
              background-size: cover;
              position: absolute;
              top: 0;
              right: 0;
              -webkit-transition: .3s ease-out;
              transition: .3s ease-out;
            }
          }

          .info-box {
            width:102px;
            height: 0;
            background: #FFFFFF;
            box-shadow: 0 1px 1px 0 rgba(0,0,0,0.05), 0 2px 5px 0 rgba(50,50,105,0.15);
            border-radius: 5px;
            position: absolute;
            top: -50%;
            left: 50%;
            -webkit-transition: .3s ease-out;
            transition: .3s ease-out;
            transform: translateX(-50%);
            padding: 8px 0;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            overflow: hidden;
            opacity: 0;

            span {
              display: block;
              font-size: 14px;
              color: #222222;
              line-height: 20px;
              text-align: center;
              cursor: pointer;
              -webkit-transition: .6s ease-out;
              transition: .6s ease-out;
              border-radius: 5px;
              position: relative;
              padding: 8px 18px;
              opacity: 0;

              &:hover {
                background: #ECFAFF;
              }
            }

            .user-data {
              padding-left: 47px;

              a {
                color: #222222;
                text-decoration: none;
              }
              &:before {
                content: '';
                display: inline-block;
                width: 23px;
                height: 18px;
                background: url("../../assets/user/user-data.png") no-repeat center;
                background-size: cover;
                position: absolute;
                top: 50%;
                left: 18px;
                transform: translateY(-50%);
              }
            }

            .log-off {
              padding-left: 47px;

              &:before {
                content: '';
                display: inline-block;
                width: 20px;
                height: 20px;
                background: url("../../assets/user/user-off.png") no-repeat center;
                background-size: cover;
                position: absolute;
                top: 50%;
                left: 18px;
                transform: translateY(-50%);
              }
            }
          }
        }

        .user-info.active {
          .info-box {
            height: 52px;
            top: 42px;
            opacity: 1;

            span {
              opacity: 1;
            }
          }

          .user-name {
            &:after {
              transform: rotate(180deg);
            }
          }
        }
      }

    }
  }

  .hear-nav .header-box {
    width: 100%;
    height: 64px;
  }
</style>
