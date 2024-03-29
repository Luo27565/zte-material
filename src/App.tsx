import { Component, Mixins } from 'vue-property-decorator'
import { RouteHelperMixin } from '@/components/RouteHelper/RouteHelperMixin'
import Index from '@/page/Index/Index.vue'
import { Constants } from '@mavice/aem-vue-editable-components'

@Component
export default class App extends Mixins(RouteHelperMixin) {
  render (createElement: Function) {
    return <div class={Constants._PAGE_CLASS_NAMES} data-cq-data-path={this.cqPath}>
      {createElement(Index)}
      {this.childComponents}
      {/* <router-view></router-view> */}
    </div>
  }
}
