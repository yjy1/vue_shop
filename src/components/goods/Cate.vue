<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card>
            <!-- 搜索与添加区域 -->
            <el-row>
                <el-col>
                    <el-button type="primary" @click="addCate">添加分类</el-button>
                </el-col>
            </el-row>

            <!--  表格区域 -->
            <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false"
                :show-index='true' index-text='#' border :show-row-hover="false">
                <template slot="cat_deleted_Tpl" slot-scope="scope">
                    <!-- {{ scope.cat_deleted }} -->
                    <i class="el-icon-success" v-if="scope.row.cat_deleted == false" style="color:lightGreen"></i>
                    <i class="el-icon-error" style="color:red" v-else></i>
                </template>

                <template slot="cat_level_Tpl" slot-scope="scope">
                    <el-tag size="mini" type="primary" v-if="scope.row.cat_level === 0">一级</el-tag>
                    <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
                    <el-tag size="mini" type="warning" v-else>三级</el-tag>
                </template>

                <template slot="oprate_Tpl" slot-scope="scope">
                    <el-button size='mini' icon="el-icon-edit" type="primary">编辑</el-button>
                    <el-button size='mini' icon="el-icon-delete" type="danger">删除</el-button>
                </template>
            </tree-table>

            <!-- 分页区域 -->
            <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[1, 2, 5, 10]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

        <!-- 添加分类的对话框 -->
        <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="closeAddCateDialog">
            <el-form ref="addCateRef" :model="addCateForm" :rules="addCateRules" label-width="80px">
                <el-form-item label="分类名称" prop="cat_name">
                    <el-input v-model="addCateForm.cat_name"></el-input>
                </el-form-item>
                <el-form-item label="父级分类">
                    <el-cascader  expand-trigger="hover" :props="parentCateProps" :options="parentCateList" v-model="selectedKeys" @change="handleChange" clearable >
                    </el-cascader>
                </el-form-item>
            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="addCateDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveCate">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script >
export default {
    data() {
        return {
            cateList: [],
            queryInfo: {
                type: '3',
                pagenum: 1,
                pagesize: 5,
            },
            addCateForm: {
                cat_name: '',
                cat_pid: 0,
                cat_level: 0
            },
            addCateRules: {
                cat_name: [
                    { required: true, message: '请输入分类名称', trigger: 'blur' },
                    { min: 3, max: 5, message: '分类名称长度在 3 到 5 个字符', trigger: 'blur' }
                ]
            },
            parentCateProps:{
                value:'cat_id',
                label:'cat_name',
                children:'children',
                checkStrictly :"false"
            },
            selectedKeys:[],
            parentCateList: [],
            total: 0,
            addCateDialogVisible: false,
            // 为table指定列的定义
            columns: [
                {
                    label: '分类名称',
                    prop: 'cat_name'
                },
                {
                    label: '是否有效',
                    prop: 'cat_deleted',
                    minWidth: '200px',
                    type: 'template',
                    template: 'cat_deleted_Tpl',
                },
                {
                    label: '排序',
                    prop: 'cat_level',
                    minWidth: '200px',
                    type: 'template',
                    template: 'cat_level_Tpl',
                },
                {
                    label: '操作',
                    prop: '',
                    minWidth: '200px',
                    type: 'template',
                    template: 'oprate_Tpl',
                },
            ]
        }
    },
    created() {
        this.getCateList()
    },
    methods: {
        async getCateList() {
            const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

            this.cateList = res.data.result
            this.total = res.data.total
            console.log(res.data)
        },
        // 监听page改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getCateList()
        },
        // 监听页码值改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getCateList()
        },
        addCate() {
            this.addCateDialogVisible = true

            this.getParentCateList()
        },
        async getParentCateList() {
            const { data: res } = await this.$http.get('categories', { params: { type: '2' } })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

            this.parentCateList = res.data
            console.log(res.data)
        },
        // 保存
        saveCate() {
            this.$refs.addCateRef.validate(async valid=>{
                if(!valid) return 

                if (this.addCateForm.cat_pid === 0) this.addCateForm.cat_level = 0 //一级分类

                const { data: res } = await this.$http.post('categories', this.addCateForm)
                if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
                
                this.$message.success(res.meta.msg)
                this.addCateDialogVisible = false
                this.getCateList()
            })
        },
        handleChange(value){
            console.log(value )
            console.log(value[0])
            console.log(value[1])

            if(value.length === 1){ // 二级分类
                this.addCateForm.cat_level = 1
                this.addCateForm.cat_pid = value[0]
            }else{ // 三级分类
                this.addCateForm.cat_level = 2
                this.addCateForm.cat_pid = value[1]
            }
        },
        closeAddCateDialog(){
            console.log('close..........')
            this.$refs.addCateRef.resetFields()
            this.selectedKeys = []
            this.addCateForm.cat_level = 0
            this.addCateForm.cat_pid = 0
        }
    }
}
</script>
<style lang="less" scoped>
.treeTable {
    margin-top: 15px;
}
.el-cascader{
    width:100%;
}
</style>