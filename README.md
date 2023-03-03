 ## 访问地址：http://120.79.169.170
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

## 2.项目上线
    2.1 项目上线相关配置
    1.通过 node 创建 web 服务器
    创建 node 项目，并安装express，通过express快速创建 web 服务器，将vue打包生成的dist 文件夹托管为静态资源即可，关键代码如下:
    const express = require('express')// 创建 web 服务器
    const app = express ()
    //托管静态资源
    app.use (express .static('./dist') )
    //启动 web 服务器
    app.listen(80，() => {
        console.log('web server running at http://127.0.0.1')
    }）

    
    2.1项目上线相关配置
        3.配置 HTTPS 服务
        申请 SSL 证书 (https://freessl.org)
        1.进入https://freesslcn/官网，输入要申请的域名并选择品牌
        2.输入自己的邮箱并选择相关选项。
        3.验证DNS(在域名管理后台添加TXT 记录)
        4.验证通过之后，下载SSL证书 (full_chain.pem 公;private.key私钥)
        
         
        4.使用pm2管理应用
        1.在服务器中安装 pm2: npm i pm2 -g
        2.启动项目:pm2 start 脚本--name自定义名称
        3.查看运行项目:pm2 ls
        4.重启项目:pm2 restart 自定义名称
        5.停止项目:pm2 stop 自定义名称
        6.删除项目: pm2 delete 自定义名称
