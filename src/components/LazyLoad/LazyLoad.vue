<template>
  <img v-lazy :data-src="src" v-bind="$attrs" @error="handleError"/>
</template>

<script>
function lazyBinding (el) {
  const obServer = new IntersectionObserver(entries => {
    if (entries.find(v => v.intersectionRatio)) {
      el.src = el.dataset.src
      obServer.unobserve(el)
    }
  })
  obServer.observe(el)
}

export default {
  name: 'LazyLoad',
  inheritAttrs: false,
  props: {
    src: {
      type: String,
      default: ''
    }
  },
  directives: {
    lazy: {
      bind (el, binding) {
        lazyBinding(el, binding)
      },
      componentUpdated (el, binding) {
        lazyBinding(el, binding)
      }
    }
  },
  methods: {
    handleError (event) {
      this.$emit('error', event)
    }
  }
}
</script>

<style scoped>

</style>
