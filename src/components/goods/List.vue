<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>商品列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getGoodsList">
                        <el-button slot="append" icon="el-icon-search" @click="handleSearch"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="showAddDialog">添加商品</el-button>
                </el-col>
            </el-row>


            <el-table :data="goodsList" style="width: 100%" border stripe>

                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="goods_name" label="商品名称" width="280">
                </el-table-column>
                <el-table-column prop="goods_price" label="价格(元)">
                </el-table-column>
                <el-table-column prop="goods_number" label="数量">
                </el-table-column>
                <el-table-column prop="goods_weight" label="重量">
                </el-table-column>
                <el-table-column prop="goods_state" label="商品状态">
                </el-table-column>
                <el-table-column prop="add_time" label="添加时间">
                    <template slot-scope="scope">
                        {{ scope.row.add_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column prop="upd_time" label="更新时间">
                    <template slot-scope="scope">
                        {{ scope.row.upd_time | dateFormat}}
                    </template>
                </el-table-column>
                <el-table-column prop="hot_mumber" label="热销品数量">
                </el-table-column>
                <el-table-column prop="is_promote" label="是否是热销品">
                </el-table-column>

                <el-table-column prop="mg_state" label="操作" width="180">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-tooltip class="item" effect="dark" content="修改" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini"
                                @click="showEditDialog(scope.row)"></el-button>
                        </el-tooltip>

                        <!-- 删除按钮 -->
                        <el-tooltip class="item" effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini"
                                @click="handleDelete(scope.row)"></el-button>
                        </el-tooltip>

                    </template>
                </el-table-column>
            </el-table>

             <!-- 分页区域 -->
             <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum" :page-sizes="[50, 100, 150, 200]" :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper" :total="total">
            </el-pagination>
        </el-card>

         <!-- 添加对话框 -->
         <el-dialog title="添加商品" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
                <el-form-item label="商品名称" prop="goods_name">
                    <el-input v-model="addForm.goods_name"></el-input>
                </el-form-item>
                <el-form-item label="分类列表" prop="goods_cat">
                    <el-input v-model="addForm.goods_cat"></el-input>
                </el-form-item>
                <el-form-item label="价格" prop="goods_price">
                    <el-input v-model="addForm.goods_price"></el-input>
                </el-form-item>
                <el-form-item label="数量" prop="goods_number">
                    <el-input v-model="addForm.goods_number"></el-input>
                </el-form-item>
                <el-form-item label="重量" prop="goods_weight">
                    <el-input v-model="addForm.goods_weight"></el-input>
                </el-form-item>
                <el-form-item label="介绍" prop="goods_introduce">
                    <el-input v-model="addForm.goods_introduce"></el-input>
                </el-form-item>
                <el-form-item label="上传的图片" prop="pics">
                    <el-input v-model="addForm.pics"></el-input>
                </el-form-item>
                <el-form-item label="商品的参数（数组）" prop="attrs">
                    <el-input v-model="addForm.attrs"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="addUser">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            addFormRules:{

            },
            addForm:{
                goods_name:'',
                goods_cat:'',
                goods_price:'',
                goods_number:'',
                goods_weight:'',
                goods_introduce:'',
                pics:'',
                attrs:'',
            },
            addDialogVisible:false,
            total: 0,
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 100
            },
            goodsList: []
        }
    },
    created() {
        this.getGoodsList()
    },
    methods: {
        showAddDialog(){
            // this.addDialogVisible = true
            this.$router.push('/goods/add')
        },
        async handleDelete(row){
            this.$confirm('此操作将永久删除该数据, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                // 发送删除请求
                console.log(row)
                const { data: res } = await this.$http.delete(`goods/${row.goods_id}`)
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

                this.$message.success(res.meta.msg)
                
                // 重新加载列表
                this.getGoodsList()
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });
          
        },
        handleSearch(){
            this.getGoodsList()
        },
         // 监听page改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getGoodsList()
        },
        // 监听页码值改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getGoodsList()
        },
        async getGoodsList() {
            const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

            this.goodsList = res.data.goods
            this.total = res.data.total
            console.log(res.data)
        }
    }
}
</script>

<style lang="less" scoped>
 
</style>