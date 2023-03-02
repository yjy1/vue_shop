// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import './plugins/element'
import 'element-ui/lib/theme-chalk/index.css';

import axios from 'axios'
import TreeTable from 'vue-table-with-tree-grid'
import VueQuillEditor from 'vue-quill-editor'
import NProgress from 'nprogress'

import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import 'nprogress/nprogress.css'


axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'


axios.interceptors.request.use(config => {
  NProgress.start()
  console.log(window.sessionStorage.getItem('token'))

  config.headers.Authorization = window.sessionStorage.getItem('token')
  // 在最后必须 return config
  return config
})

axios.interceptors.response.use((config) => {
  NProgress.done()
  console.log('dddddddddddddddddd',config)
  return config
} )

Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor, /* { default global options } */)


Vue.filter('dateFormat', function (orginVal) {
  const dt = new Date(orginVal)

  const y = dt.getFullYear()
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')

  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')

  const ss = (dt.getSeconds() + '').padStart(2, '0')

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
