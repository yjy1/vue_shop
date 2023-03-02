import Vue from 'vue'
import Router from 'vue-router'
// import Login from '../components/Login'
const Login = ()=> import('../components/Login') 
const Home = ()=> import('../components/Home') 
const Welcome = ()=> import('../components/Welcome') 
const Users = ()=> import('../components/users/Users.vue') 
const Rights = ()=> import('../components/power/Rights.vue') 
const Roles = ()=> import('../components/power/Roles.vue') 
const Cate = ()=> import('../components/goods/Cate.vue') 
const Params = ()=> import('../components/goods/Params.vue') 
const List = ()=> import('../components/goods/List.vue') 
const Add = ()=> import('../components/goods/Add.vue') 
const Order = ()=> import('../components/order/Order.vue') 
const Report = ()=> import('../components/report/Report.vue') 




// import Home from '../components/Home'
// import Welcome from '../components/Welcome'
// import Users from '../components/users/Users.vue'
// import Rights from '../components/power/Rights.vue'
// import Roles from '../components/power/Roles.vue'
// import Cate from '../components/goods/Cate.vue'
// import Params from '../components/goods/Params.vue'
// import List from '../components/goods/List.vue'
// import Add from '../components/goods/Add.vue'
// import Order from '../components/order/Order.vue'
// import Report from '../components/report/Report.vue'
import '../assets/css/global.css'

Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home', 
      component: Home, 
      redirect:'/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/rights', component: Rights },
        { path: '/roles', component: Roles },
        { path: '/categories', component: Cate },
        { path: '/params', component: Params },
        {
          path: '/goods',
          component: List,
        },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report },
      ]
    },  

  ]
})

// 挂载路由导航守卫、
router.beforeEach((to, from, next) => {
  // must call `next`
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行
  //      next() 放行  next('/login')  强制跳转

  if (to.path === '/login') return next()

  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')

  next()
})

export default router