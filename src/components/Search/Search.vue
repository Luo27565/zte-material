<template>
  <div class="container">
    <el-select v-model="select" class="select">
      <el-option
        v-for="item in selectData"
        :key="item.value"
        :label="item.label"
        :value="item.value">
      </el-option>
    </el-select>
    <el-input v-model="input" placeholder="请输入查询内容" @keyup.enter.native="handleInput" class="input" clearable>
    </el-input>
    <el-button type="primary" class="button" @click="handleInput">
      <i class="el-icon-search"/>
    </el-button>
  </div>
</template>

<script>

import { fileTypeOptions } from '@/utils'

export default {
  name: 'Search',
  data () {
    return {
      selectData: fileTypeOptions,
      select: '',
      input: ''
    }
  },
  methods: {
    handleInput () {
      const { path } = this.$route
      this.$router.push({
        path,
        query: {
          search: this.select,
          keywords: this.input
        }
      })
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  height: 100%;
  width: 100%;
  display: flex;

  .select {
    height: 100%;
    flex-shrink: 0;
    width: 100px;
    position: relative;

    /deep/ .el-input__inner {
      border-radius: 12px 0 0 12px;
      text-align: center;
      border: none;
      height: 51px;
      line-height: 51px;
    }
  }

  .select::after {
    content: '';
    position: absolute;
    right: 0;
    top: 10%;
    bottom: 10%;
    height: 80%;
    width: 1px;
    background-color: rgb(170, 170, 170);
  }

  .input {
    height: 100%;
    flex: auto;

    /deep/ .el-input__inner {
      border: none;
      border-radius: 0;
      height: 51px;
      line-height: 51px;
    }
  }

  .button {
    height: 100%;
    font-size: 24px;
    border-radius: 0 12px 12px 0;
  }

}
</style>
