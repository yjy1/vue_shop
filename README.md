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