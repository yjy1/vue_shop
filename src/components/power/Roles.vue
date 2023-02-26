<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>角色管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <el-row>
                <el-col :span="2">
                    <el-button type="primary">添加角色</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表区域 -->
            <el-table :data="rolesList" style="width: 100%" border stripe>
                <el-table-column type="expand">
                    <template slot-scope="scope">
                        <!-- {{ scope.row }} -->
                        <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id"
                            :class="['vcenter', 'bdbottom', i1 === 0 ? 'bdtop' : '']">
                            <!-- 渲染一级权限 -->
                            <el-col :span="5">
                                <el-tag closable @close="removeRightsById(scope.row, item1.id)">
                                    {{ item1.authName }}
                                </el-tag>
                                <i class="el-icon-caret-right
        "></i>
                            </el-col>
                            <!-- 渲染二级和三级权限 -->
                            <el-col :span="19">
                                <!-- 通过for循环 嵌套渲染二级权限 -->
                                <el-row :class="['vcenter', i2 !== 0 ? 'bdtop' : '']" v-for="(item2, i2) in item1.children"
                                    :key="item2.id">
                                    <el-col :span="6">
                                        <el-tag closable type="success" @close="removeRightsById(scope.row, item2.id)">{{
                                            item2.authName }}</el-tag>
                                        <i class="el-icon-caret-right
        "></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-row :class="[i3 != 0 ? 'bdtop' : '']" v-for="(item3, i3) in item2.children"
                                            :key="item3.id">
                                            <el-col>
                                                <el-tag closable @close="removeRightsById(scope.row, item3.id)"
                                                    type="warning">
                                                    {{ item3.authName }}
                                                </el-tag>

                                            </el-col>
                                        </el-row>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="roleName" label="角色名称" width="180">
                </el-table-column>
                <el-table-column prop="roleDesc" label="角色描述">
                </el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
                        <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
                        <el-button type="warning" icon="el-icon-setting" size="mini"
                            @click="showSetRightsDialog(scope.row)">分配权限</el-button>
                    </template>

                </el-table-column>
            </el-table>
        </el-card>

        <!-- 分配权限的对话框 -->
        <el-dialog title="分配权限" :visible.sync="setRightsdialogVisible" width="30%"  @close="closeRightsDialog" >
            <!-- 树形控件 -->
            <el-tree :data="rightsTree" :props="treeProps"  show-checkbox node-key="id" :default-expand-all="true" :default-checked-keys="defKeys"   ref="treeRef"></el-tree>

            <span slot="footer" class="dialog-footer" >
                <el-button @click="setRightsdialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveRights()">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>


<script>
export default {
    data() {
        return {
            rolesList: [],
            // 控制分配权限对话框的显隐
            setRightsdialogVisible:false,
            rightsTree:[],
            treeProps: {
                children: 'children',
                label: 'authName'
            },
            // 默认勾选的节点的 key 的数组	
            defKeys:[],
            checkedArr:[],
            // 当前行的id
            rowId:''
        }
    },
    created() {
        this.getRolesList()
    },
    methods: {
        async getRolesList() {
            const { data: res } = await this.$http(`roles`)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.rolesList = res.data
            console.log(res)
        },
        async removeRightsById(role, rightId) {
            const result = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).catch(err => err)

            if (result !== 'confirm') return this.$message.info('取消了删除')

            const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success(res.meta.msg)

            // this.getRolesList()
            role.children = res.data

        },
        async showSetRightsDialog(row) {
            this.rowId = row.id

            this.setRightsdialogVisible = true
            // 获取所有权限
            const {data:res} =  await this.$http.get(`rights/tree`)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

            this.rightsTree = res.data
            // 勾选已有权限
          
            this.defKeys = this.getLeafKeys(row,[])
            // console.log(this.getLeafKeys(row,[]))
        },
       
        // 通过递归的方式，获取当前角色下三级权限的id，并保存到defKeys数组中
        getLeafKeys(node,arr){
            // 如果node节点不包含children属性，则为三级节点
            if(!node.children){
                console.log('node')
                arr.push(node.id)
                // console.log('node---',arr)
               
            }else{
                node.children.forEach(item => {
                    this.getLeafKeys(item,arr)
                });
            }
            return arr
        },
        closeRightsDialog(){
            this.defKeys = []
        },
        async saveRights(){
            let keys = [
                ...this.$refs.treeRef.getCheckedKeys(),
                ...this.$refs.treeRef.getHalfCheckedKeys()
            ]
            console.log(keys.join(','))
 
            let rids = keys.join(',')
            const { data: res } = await this.$http.post(`roles/${this.rowId}/rights`, { params: { rids } })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.$message.success(res.meta.msg)

            this.setRightsdialogVisible = false
            this.getRolesList()
        },
         
    }
}
</script>

<style lang="less" scoped>
.el-tag {
    margin-top: 15px;
    margin-left: 65px;
}

.bdtop {
    border-top: 1px solid #eee;
}

.bdbottom {
    border-bottom: 1px solid #eee;
}

.vcenter {
    display: flex;
    align-items: center;
}
</style>