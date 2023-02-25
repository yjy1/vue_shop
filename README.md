 ## 3.登录/退出功能
    3.3登录功能实现
        3.路由导航守卫控制访问权限
        如果用户没有登录，但是直接通过URL访问特定页面，需要重新导航到登录页面

        //为路由对象，添加 beforeEach 导航守卫
        router.beforeEach((to, from, next) => {
            //如果用户访问的登录页，直接放行
            if (to.path ==='/login') return next()
            // 从 sessionstorage 中获取到 保存的 token 值
            const tokenStr = window.sessionStorage.getItem('token')
            // 没有token，强制跳转到登录页
            if (!tokenStr) return next('/login')
            next()
        })

  
    3.4 退出
        退出功能实现原理
        基于 token 的方式实现退出比较简单，只需要销毁本地的 token 即可。这样，后续的请求就不会携带token，必须重新登录生成一个新的 token 之后才可以访问页面

        // 清空token
        window.sessionStorage.clear()//跳转到登录页
        this.$router.push('/login')

## 4.主页布局
    4.2左侧菜单布局
        菜单分为二级，并且可以折叠.
        <el-menu>
            <el-submenu>
                <!-- 这个 template 是一级菜单的内容模板-->
                <i class="el-icon-menu"></i>
                <span>一级菜单</span>
                <!-- 在一级菜单中，可以嵌套二级菜单-->
                <el-menu-item>
                    <i class="el-icon-menu"></i>
                    <span slot="title">二级菜单</span>
                </el-menu-item>
            </el-submenu>
        </el-menu>

    4.3通过接口获取菜单数据
        通过axios请求拦截器添加 token，保证拥有获取数据的权限
        // axios请求拦截
        axios.interceptors.request .use(config => {
            // 为请求头对象，添加 Token 验证的 Authorization 字段
            config.headers.Authorization = window.sessionStorage.getItem('token')return config
        })