<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图 -->
        <el-card>
            <el-alert title="注意:只允许为第三级分类设置相关参数!" show-icon :closable="false" type="warning">
            </el-alert>

            <el-row class="selectArea">
                <el-col>
                    <span>选择商品分类：</span>
                    <el-cascader expand-trigger="hover" :props="parentCateProps" :options="parentCateList"
                        v-model="selectedKeys" @change="handleChange" clearable>
                    </el-cascader>

                    <el-tabs v-model="activeName" @tab-click="handleClick">
                        <el-tab-pane label="动态参数" name="many">
                            <el-button type="primary" size="mini" :disabled="isBtnDisabled"
                                @click="addParams">添加参数</el-button>
                            <!-- 动态参数表格 -->
                            <el-table :data="manyDataList" border stripe>
                                <el-table-column type="expand">
                                    <template slot-scope="scope">
                                        <el-tag class="attrTag" v-for="(item, i) in scope.row.attr_vals" :key="i" closable
                                            @close="closeTag(scope.row,i)">
                                            {{ item }}
                                        </el-tag>
                                        <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                            v-model="scope.row.inputValue" ref="saveTagInput" size="small" width="96px"
                                            @keyup.enter.native="handleInputConfirm(scope.row)"
                                            @blur="handleInputConfirm(scope.row)">
                                        </el-input>
                                        <el-button v-else class="button-new-tag" size="small"
                                            @click="showInput(scope.row)">+ New
                                            Tag</el-button>

                                    </template>
                                </el-table-column>
                                <el-table-column type="index"></el-table-column>
                                <el-table-column label="参数名称" prop="attr_name"></el-table-column>

                                <el-table-column label="操作">
                                    <template slot-scope="scope">
                                        <el-button type="primary" @click="showModifyDialog(scope.row)" icon="el-icon-edit"
                                            size="mini">编辑</el-button>
                                        <el-button type="danger" icon="el-icon-delete" size="mini"
                                            @click="handleDelete(scope.row)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                        <el-tab-pane label="静态参数" name="only">
                            <el-button type="primary" size="mini" :disabled="isBtnDisabled"
                                @click="addParams">添加参数</el-button>
                            <!-- 静态参数表格 -->
                            <el-table :data="onlyDataList" border stripe>
                                <el-table-column type="expand">
                                    <template slot-scope="scope">
                                        <el-tag class="attrTag" v-for="(item, i) in scope.row.attr_vals" :key="i" closable
                                            @close="closeTag(scope.row,i)">
                                            {{ item }}
                                        </el-tag>
                                        <el-input class="input-new-tag" v-if="scope.row.inputVisible"
                                            v-model="scope.row.inputValue" ref="saveTagInput" size="small" width="96px"
                                            @keyup.enter.native="handleInputConfirm(scope.row)"
                                            @blur="handleInputConfirm(scope.row)">
                                        </el-input>
                                        <el-button v-else class="button-new-tag" size="small"
                                            @click="showInput(scope.row)">+ New
                                            Tag</el-button>

                                    </template>
                                </el-table-column>
                                <el-table-column type="index"></el-table-column>
                                <el-table-column label="属性名称" prop="attr_name"></el-table-column>

                                <el-table-column label="操作">
                                    <template slot-scope="scope">
                                        <el-button type="primary" icon="el-icon-edit" size="mini"
                                            @click="showModifyDialog(scope.row)">编辑</el-button>
                                        <el-button type="danger" icon="el-icon-delete" size="mini"
                                            @click="handleDelete(scope.row)">删除</el-button>
                                    </template>
                                </el-table-column>
                            </el-table>
                        </el-tab-pane>
                    </el-tabs>
                </el-col>

            </el-row>
        </el-card>

        <!-- 添加参数的对话框 -->
        <el-dialog :title="'添加' + titleText" :visible.sync="addParamsDialogVisible" width="50%"
            @close="closeAddParamsDialog">
            <el-form ref="addParamsRef" :model="addParamsForm" :rules="addParamsRules" label-width="80px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="addParamsForm.attr_name"></el-input>
                </el-form-item>

            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="addParamsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveAddParams">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 修改参数的对话框 -->
        <el-dialog :title="'修改' + titleText" :visible.sync="modifyParamsDialogVisible" width="50%"
            @close="closeModifyParamsDialog">
            <el-form ref="modifyParamsRef" :model="modifyParamsForm" :rules="modifyParamsRules" label-width="80px">
                <el-form-item :label="titleText" prop="attr_name">
                    <el-input v-model="modifyParamsForm.attr_name"></el-input>
                </el-form-item>

            </el-form>

            <span slot="footer" class="dialog-footer">
                <el-button @click="modifyParamsDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveModify">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {

            parentCateProps: {
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
                checkStrictly: "false"
            },
            parentCateList: [],
            selectedKeys: [],
            activeName: 'many',
            manyDataList: [],
            onlyDataList: [],
            addParamsDialogVisible: false,
            modifyParamsDialogVisible: false,
            addParamsForm: {
                attr_name: '',

            },
            modifyParamsForm: {
                attr_name: '',

            },
            addParamsRules: {
                attr_name: [
                    { required: true, message: `请输入${this.titleText}`, trigger: 'blur' },
                    { min: 1, max: 15, message: `${this.titleText}长度在 1 到 15 个字符`, trigger: 'blur' }
                ]
            },
            modifyParamsRules: {
                attr_name: [
                    { required: true, message: `请输入${this.titleText}`, trigger: 'blur' },
                    { min: 1, max: 15, message: `${this.titleText}长度在 1 到 15 个字符`, trigger: 'blur' }
                ]
            },
            rowInfo: {}
        }
    },
    created() {
        this.getParentCateList()
    },
    computed: {
        isBtnDisabled() {

            if (this.selectedKeys.length !== 3) return true
            return false
        },
        cateId() {
            if (this.selectedKeys.length === 3) return this.selectedKeys[2]
            return null
        },
        titleText() {
            if (this.activeName === 'many') return '动态参数'
            else return '静态属性'
        }
    },
    // 方法
    methods: {
        async closeTag(row,tagIndex) {
            row.attr_vals.splice(tagIndex,1)
            // 提交参数到后台
            const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                attr_name: row.attr_name,
                attr_sel: row.attr_sel,
                attr_vals: row.attr_vals.join(',')
            })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

            console.log(res.data)
            this.$message.success(res.meta.msg)
            // 重新加载用户列表
            row.attr_vals = res.data.attr_vals.split(',')
        }, 

        showInput(row) {
            row.inputVisible = true;
            // 让文本框自动获得焦点
            // $nextTick 方法的作用，就是当页面上元素被重新渲染之后，才会指定回调函数中的代码
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });

            // this.$refs.saveTvagInput.$refs.input.focus();
        },

        async handleInputConfirm(row) {
            let inputValue = row.inputValue;
            if (inputValue) {
                row.attr_vals.push(inputValue);

                // 提交参数到后台
                const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                    attr_name: row.attr_name,
                    attr_sel: row.attr_sel,
                    attr_vals: row.attr_vals.join(',')
                })
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

                console.log(res.data)
                this.$message.success(res.meta.msg)
                // 重新加载用户列表
                row.attr_vals = res.data.attr_vals.split(',')
            }
            row.inputVisible = false;
            row.inputValue = '';
        }
        ,
        async handleDelete(row) {
            this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(async () => {
                // 发送删除请求
                const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${row.attr_id}`)
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

                this.$message.success(res.meta.msg)
                // 重新加载用户列表
                this.getParamsData()
            }).catch(() => {
                this.$message({
                    type: 'info',
                    message: '已取消删除'
                });
            });


        },
        closeModifyParamsDialog() {
            this.$refs.modifyParamsRef.resetFields()
        },
        saveModify() {
            this.$refs.modifyParamsRef.validate(async valid => {
                if (!valid) return

                const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.rowInfo.attr_id}`, {
                    attr_name: this.modifyParamsForm.attr_name,
                    attr_sel: this.activeName,
                })
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

                this.modifyParamsDialogVisible = false
                this.$message.success(res.meta.msg)
                this.getParamsData()
            })
        },
        async showModifyDialog(row) {
            this.modifyParamsDialogVisible = true
            this.rowInfo.attr_id = row.attr_id
            // 显示之前的数据
            console.log(this.cateId, row.attr_id)
            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${row.attr_id}`, {
                attr_sel: this.activeName,
            })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

            this.modifyParamsForm.attr_name = res.data.attr_name
        },
        saveAddParams() {
            this.$refs.addParamsRef.validate(async valid => {
                if (!valid) return

                let id = this.cateId
                const { data: res } = await this.$http.post(`categories/${id}/attributes`, {
                    attr_name: this.addParamsForm.attr_name,
                    attr_sel: this.activeName,
                    // attr_vals: this.activeName === 'many' ? '' 
                })
                if (res.meta.status !== 201) return this.$message.error(res.meta.msg)

                this.addParamsDialogVisible = false
                this.$message.success(res.meta.msg)
                this.getParamsData()
            })

        },
        handleChange() {
            this.getParamsData()
        },
        async getParentCateList() {
            const { data: res } = await this.$http.get('categories', { params: { type: '3' } })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

            this.parentCateList = res.data
            console.log(res.data)
        },
        handleClick() {
            this.getParamsData()
        },
        // 加载参数列表
        async getParamsData() {
            if (this.selectedKeys.length !== 3) {
                this.selectedKeys = []
                this.manyDataList = []
                this.onlyDataList = []
                return
            }
            console.log(this.activeName)

            const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)


            res.data.forEach(item => {
                item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                item.inputVisible = false
                item.inputValue = ''
            })

            if (this.activeName === 'many') this.manyDataList = res.data
            else this.onlyDataList = res.data
            console.log(res.data)

        },
        addParams() {
            console.log(this.activeName)
            // if(this.activeName === 'many'){
            this.addParamsDialogVisible = true
            // }
        },
        closeAddParamsDialog() {
            this.$refs.addParamsRef.resetFields()
        }
    }
}
</script>

<style lang="less" scoped>
.el-tag+.el-tag {
    margin-left: 10px;
}

.button-new-tag {
    margin-left: 10px;
    height: 32px;
    line-height: 30px;
    padding-top: 0;
    padding-bottom: 0;
}

.input-new-tag {
    width: 90px;
    margin-left: 10px;
    vertical-align: bottom;
}

.selectArea {
    margin-top: 15px;
}

.attrTag {
    margin: 15px;
}</style>
