<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>订单管理</el-breadcrumb-item>
            <el-breadcrumb-item>订单列表</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-row :gutter="20">
                <el-col :span="8">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrdersList">
                        <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
                    </el-input>
                </el-col>

            </el-row>


            <el-table :data="ordersList" style="width: 100%" border stripe>

                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="order_number" label="订单号" width="280">
                </el-table-column>
                <el-table-column prop="order_price" label="订单价格(元)">
                </el-table-column>
                <el-table-column prop="pay_status" label="是否付款">
                    <template slot-scope="scope">
                        <el-tag v-if="scope.row.pay_status === 0" type="danger">未付款</el-tag>
                        <el-tag v-else type="primary">已付款</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="is_send" label="是否发货">
                </el-table-column>

                <el-table-column prop="create_time" label="下单时间">
                    <template slot-scope="scope">
                        {{ scope.row.create_time | dateFormat }}
                    </template>
                </el-table-column>



                <el-table-column label="操作" width="180">
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-tooltip class="item" effect="dark" content="修改地址" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" size="mini"
                                @click="showEditDialog(scope.row)"></el-button>
                        </el-tooltip>

                        <!-- 删除按钮 -->
                        <el-tooltip class="item" effect="dark" content="查看物流进度" placement="top" :enterable="false">
                            <el-button type="success" icon="el-icon-location" size="mini"
                                @click="showLogisticsProgress(scope.row)"></el-button>
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
        <!-- 修改对话框 -->
        <el-dialog title="修改地址" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
            <!-- 内容主体区域 -->
            <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
                <el-form-item label="省/市/区（县）" prop="address1">
                    <el-cascader :options="cityData" :value="editForm.address1" @change="changeProvince" change-on-select>
                    </el-cascader>
                </el-form-item>
                <el-form-item label="详细地址" prop="address2">
                    <el-input v-model="editForm.address2"></el-input>
                </el-form-item>
            </el-form>
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleBtnSave">确 定</el-button>
            </span>
        </el-dialog>

         <!-- 物流信息对话框 -->
         <el-dialog title="物流信息" :visible.sync="logisDialogVisible" width="50%" @close="editDialogClosed">
            <el-timeline >
                <el-timeline-item
                v-for="(activity, index) in LogisticsList"
                :key="index"
                :timestamp="activity.time">
                {{activity.context}}
                </el-timeline-item>
            </el-timeline>
            
            <!-- 底部区域 -->
            <span slot="footer" class="dialog-footer">
                <el-button @click="logisDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="handleBtnSave">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import cityData from '../../assets/js/city_data2017_element'
export default {
    data() {
        return {
            LogisticsList:[],
            logisDialogVisible:false,
            cityData: cityData,
            editFormRules: {

            },
            editForm: {
                address1: [],
                address2: ''
            },
            editDialogVisible: false,
            total: 0,
            queryInfo: {
                query: '',
                pagenum: 1,
                pagesize: 10,
            },
            ordersList: []
        }
    },
    created() {
        this.getOrdersList()
    },
    methods: {
        async showLogisticsProgress(row){
            this.logisDialogVisible = true

            const { data: res } = await this.$http.get(`/kuaidi/1106975712662` )
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

            this.LogisticsList = res.data
            console.log(res.data)
        },
        changeProvince() {

        },
        handleBtnSave() {

        },
        showEditDialog(row) {
            this.editDialogVisible = true


        },
        // 监听page改变的事件
        handleSizeChange(newSize) {
            this.queryInfo.pagesize = newSize
            this.getOrdersList()
        },
        // 监听页码值改变的事件
        handleCurrentChange(newPage) {
            this.queryInfo.pagenum = newPage
            this.getOrdersList()
        },
        async getOrdersList() {
            const { data: res } = await this.$http.get(`orders`, { params: this.queryInfo })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

            this.ordersList = res.data.goods
            this.total = res.data.total
            console.log(res.data)
        }
    }
}
</script>

<style lang="less" scoped>
.el-cascader {
    width: 100%;
}
</style>