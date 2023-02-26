<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <!-- 用户列表区域 -->
            <el-table :data="rightsList" style="width: 100%" border stripe>

                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="authName" label="权限说明" width="180">
                </el-table-column>
                <el-table-column prop="level" label="权限层级">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.level === '0'" type="success">一级</el-tag>
                        <el-tag v-else-if="scope.row.level === '1'" type="info">二级</el-tag>
                        <el-tag v-else type="warning">三级</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="pid" label="权限父 ID">
                </el-table-column>
                <el-table-column prop="path" label="对应访问路径">
                </el-table-column>
            </el-table>
        </el-card>
    </div>
</template>

<script>
export default {
    data() {
        return {
            // 权限列表
            rightsList: []
        }
    },
    created() {
        // 获取所有的权限
        this.getRightsList()
    },
    methods: {
        async getRightsList() {
            const { data: res } = await this.$http.get(`rights/list `)

            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

            this.rightsList = res.data
            console.log(res)
        }
    }
}
</script>

<style lang="less" scoped></style>