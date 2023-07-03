<template>
  <div class="container">
    <div class="content">
      <search ref="search"/>
      <div class="popular-tags" v-if="popularTags.length">
        <span>热门标签：</span>
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
.container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;

  .content {
    width: 60%;
    display: flex;
    flex-direction: column;

    .popular-tags {
      color: #FFFFFF;
      margin-top: 20px;
      padding-left: 118px;
      font-size: 16px;
      font-weight: bold;

      .item {
        cursor: pointer;
      }

      .item:not(:last-child) {
        margin-right: 16px;
      }
    }
  }

}
</style>
