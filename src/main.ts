import './map-components'
import { AuthoringUtils, ModelManager } from '@adobe/aem-spa-page-model-manager'
import Vue from 'vue'
import App from './App'
import './App.scss'
import VueRouter from 'vue-router'
import { Constants } from '@mavice/aem-vue-editable-components'
import {
  Tree,
  Container,
  Aside,
  Header,
  Main,
  Footer,
  Select,
  Option,
  Input,
  Button,
  Tabs,
  TabPane,
  Empty,
  Image,
  Loading,
  Table,
  TableColumn,
  Breadcrumb,
  BreadcrumbItem,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Dialog,
  Form,
  FormItem,
  MessageBox,
  Notification,
  Message,
  Popover,
  Tooltip,
  Drawer,
  Upload,
  Progress,
  DatePicker,
  InputNumber,
  CheckboxGroup,
  Checkbox,
  CheckboxButton,
  Tag,
  Collapse,
  CollapseItem,
  Divider,
  RadioGroup,
  Radio,
  RadioButton,
  InfiniteScroll
} from 'element-ui'
// @ts-ignore
import VueVideoPlayer from 'vue-video-player'
import 'video.js/dist/video-js.css'
import { createPinia, PiniaVuePlugin } from 'pinia'
import Directives from '@/directives/index'

const pinia = createPinia()

Vue.use(VueRouter)
Vue.use(PiniaVuePlugin)
Vue.use(Tree)
Vue.use(Container)
Vue.use(Header)
Vue.use(Main)
Vue.use(Footer)
Vue.use(Aside)
Vue.use(Select)
Vue.use(Option)
Vue.use(Input)
Vue.use(Button)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Empty)
Vue.use(Image)
Vue.use(Loading.directive)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(Breadcrumb)
Vue.use(BreadcrumbItem)
Vue.use(Dropdown)
Vue.use(DropdownMenu)
Vue.use(DropdownItem)
Vue.use(Dialog)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Popover)
Vue.use(Tooltip)
Vue.use(Drawer)
Vue.use(Upload)
Vue.use(Progress)
Vue.use(VueVideoPlayer)
Vue.use(DatePicker)
Vue.use(InputNumber)
Vue.use(CheckboxGroup)
Vue.use(Checkbox)
Vue.use(CheckboxButton)
Vue.use(Tag)
Vue.use(CollapseItem)
Vue.use(Collapse)
Vue.use(Divider)
Vue.use(Directives)
Vue.use(RadioGroup)
Vue.use(Radio)
Vue.use(RadioButton)
Vue.use(InfiniteScroll)

Vue.prototype.$msgbox = MessageBox
Vue.prototype.$alert = MessageBox.alert
Vue.prototype.$confirm = MessageBox.confirm
Vue.prototype.$prompt = MessageBox.prompt
Vue.prototype.$notify = Notification
Vue.prototype.$message = Message

document.addEventListener('DOMContentLoaded', () => {
  ModelManager.initialize().then(pageModel => {
    new Vue({
      router: new VueRouter({
        mode: 'history',
        routes: [
          {
            name: 'root',
            path: '*',
            component: Vue.extend({
              render (createElement: Function) {
                return createElement(App, {
                  props: {
                    cqChildren: pageModel[Constants.CHILDREN_PROP],
                    cqItems: pageModel[Constants.ITEMS_PROP],
                    cqItemsOrder: pageModel[Constants.ITEMS_ORDER_PROP],
                    cqPath: pageModel[Constants.PATH_PROP],
                    isInEditor: AuthoringUtils.isInEditor(),
                    locationPathname: window.location.pathname,
                    injectPropsOnInit: true
                  }
                })
              }
            })
          }
        ]
      }),
      // @ts-ignore
      pinia,
      render (createElement: Function) {
        return createElement(
          'div',
          {
            class: [Constants._PAGE_CLASS_NAMES],
            attrs: {
              'data-cq-data-path': pageModel[Constants.PATH_PROP],
              id: 'spa-root'
            }
          }, [
            createElement('router-view', {
              key: this.$route.query.path
            })
          ]
        )
      }
    }).$mount('#spa-root')
  })
})
