<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable>
                        <el-button slot="append" icon="el-icon-search" @click="search"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true">添加</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表区域 -->
            <el-table :data="usersList" style="width: 100%" border stripe>

                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="username" label="姓名" width="180">
                </el-table-column>
                <el-table-column prop="mobile" label="手机">
                </el-table-column>
                <el-table-column prop="email" label="邮箱">
                </el-table-column>
                <el-table-column prop="role_name" label="角色名称">
                </el-table-column>
                <el-table-column prop="mg_state" label="状态">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="changeState(scope.row)">
                        </el-switch>
                        <!-- {{ scope.row.mg_state }} -->
                    </template>
                </el-table-column>
                <el-table-column prop="mg_state" label="操作">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-tooltip class="item" effect="dark" content="修改" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini"
                                @click="showEditDialog(scope.row)"></el-button>
                        </el-tooltip>

                        <!-- 删除按钮 -->
                        <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini"
                                @click="deleteUser(scope.row)"></el-button>
                        </el-tooltip>
                        <!-- 分配角色按钮 -->
                        <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini"
                                @click="setRole(scope.row)"></el-button>
                        </el-tooltip>

                    </template>
                </el-table-column>
            </el-table>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加用户对话框 -->
        <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addForm.password"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addForm.mobile"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addForm.email"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改用户的对话框 -->
        <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="editForm.username" disabled></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="editForm.mobile"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="editForm.email"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser()">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 分配角色的对话框 -->
        <el-dialog title="分配角色" :visible.sync="setRoleDialogVisible" width="30%" @close="setRoleDialogClose">
            <div>
                <p>当前的用户：{{ userInfo.username }}</p>
                <p>当前的角色：{{ userInfo.role_name }}</p>
                <p>分配角色：
                    <el-select v-model="roleId"  placeholder="请选择">
                        <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id">
                        </el-option>
                    </el-select>
                </p>
                
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRoleDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveSetRole">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
export default {
    data() {

        // 验证邮箱的校验规则
        var checkEmail = (rule, value, cb) => {
            const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z-9_-])+/

            if (regEmail.test(value)) {
                // 合法的邮箱
                return cb()
            }
            cb(new Error('请输入合法的邮箱'))
        }
        // 验证手机的校验规则
        var checkMobile = (rule, value, cb) => {
            const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

            if (regMobile.test(value)) {
                // 合法的手机
                return cb()
            }
            cb(new Error('请输入合法的手机'))
        }

        return {
            usersList: [],
            total: 0,
            queryInfo: {
                query: '',
                // 当前的页数
                pagenum: 1,
                // 当前每页显示多少条数据
                pagesize: 20,
            },

            // 控制添加用户对话框是否显示/隐藏
            addDialogVisible: false,
            editDialogVisible: false,
            setRoleDialogVisible: false,
            // 当前行用户信息
            userInfo: {},
            rolesList: [],
            roleId:'',
            // 添加用户的表单数据
            addForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            addFormRules: {
                username: [
                    { required: true, message: '请输入用户名', trigger: 'blur' },
                    { min: 3, max: 10, message: '用户名长度在3~10个字符之间', trigger: 'blur' }
                ],
                password: [
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 15, message: '密码长度在6~15个字符之间', trigger: 'blur' }
                ],
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机', trigger: 'blur' }, { validator: checkMobile, trigger: 'blur' }
                ]
            },
            // 编辑用户的表单数据
            editForm: {
                username: '',
                password: '',
                email: '',
                mobile: ''
            },
            editFormRules: {
                email: [
                    { required: true, message: '请输入邮箱', trigger: 'blur' }, { validator: checkEmail, trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入手机', trigger: 'blur' }, { validator: checkMobile, trigger: 'blur' }
                ]
            },
        }
    },
    created() {
        this.getUsersList()
    },
    methods: {
        async getUsersList() {
            const { data: res } = await this.$http.get('/users', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            this.usersList = res.data.users
            this.total = res.data.total
        },
        // 监听page改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getUsersList()
        },
        // 监听页码值改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getUsersList()
        },
        // 监听switch状态的改变
        async changeState(userInfo, a) {
            const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
            if (res.meta.status !== 200) {
                userInfo.mg_state = !userInfo.mg_state
                return this.$message.error(res.meta.msg)
            }
            this.$message.success(res.meta.msg)
        },
        search() {
            this.getUsersList()
        },
        // 监听用户对话框的关闭事件
        addDialogClosed() {
            console.log(this.$refs.addFormRef)
            this.$refs.addFormRef.resetFields()
        },
        // 监听编辑用户对话框的关闭事件
        editDialogClosed() {
            console.log(this.$refs.editFormRef)
            this.$refs.editFormRef.resetFields()
        },
        // 点击按钮 添加用户
        addUser() {
            this.$refs.addFormRef.validate(async (valid) => {
                console.log(valid)
                if (!valid) return
                // 发送post请求
                const { data: res } = await this.$http.post('/users', this.addForm)

                if (res.meta.status !== 201) return this.$message.error(res.meta.msg)

                this.$message.success(res.meta.msg)
                this.addDialogVisible = false
                // 重新加载用户列表
                this.getUsersList()
            })

        },
        // 用于编辑用户的对话框
        async showEditDialog(row) {
            this.editDialogVisible = true
            // 显示之前的数据
            const { data: res } = await this.$http.get(`users/${row.id}`)

            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

            this.editForm = res.data
            console.log(res.data)

        },
        // 修改用户信息并提交
        async editUser() {
            console.log(this.editForm)

            this.$refs.editFormRef.validate(async (valid) => {
                console.log(valid)
                if (!valid) return
                // 发送put请求
                const { data: res } = await this.$http.put(`/users/${this.editForm.id}`, { email: this.editForm.email, mobile: this.editForm.mobile })

                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

                this.$message.success(res.meta.msg)
                this.editDialogVisible = false
                // 重新加载用户列表
                this.getUsersList()
            })

        },
        // 删除用户
        deleteUser(row) {
            this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                // 发送删除请求
                const { data: res } = await this.$http.delete(`users/${row.id}`)
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

                this.$message({
                    type: 'success',
                    message: '删除成功!'
                });

                // 重新加载用户列表
                this.getUsersList()
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
        },
        // 展示分配角色的对话框
        async setRole(userInfo) {
            this.userInfo = userInfo
            
            // 获取所有的角色
            const { data: res } = await this.$http.get('roles')
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

            console.log(res.data)
            this.rolesList = res.data
            // this.roleId =  
            this.setRoleDialogVisible = true
        },
        async saveSetRole(){
            if(!this.roleId) this.$message.error('请选择要分配的角色')

            let rid = this.roleId
            console.log('aaaaaaaaaaaaa',rid)
            // const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`, { params: { rid } })
            const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,   { rid } )
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
            
            this.$message.success(res.meta.msg)
            this.setRoleDialogVisible = false
             // 重新加载用户列表
             this.getUsersList()
        },
        setRoleDialogClose(){
            this.roleId = ''
        }
    }
}
</script>

<style lang="less" scoped></style>