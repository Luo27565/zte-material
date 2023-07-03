export default {
  inserted (el, binding) {
    const { value } = binding
    value === false && (el.parentNode && el.parentNode.removeChild(el))
  }
}
