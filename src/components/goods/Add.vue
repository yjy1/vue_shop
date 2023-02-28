<template>
    <div>
        <!-- 面包屑导航区域 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>商品管理</el-breadcrumb-item>
            <el-breadcrumb-item>添加商品</el-breadcrumb-item>
        </el-breadcrumb>

        <el-card>
            <el-alert title="添加商品信息" type="info" show-icon center :closable="false">
            </el-alert>
            <el-steps align-center :space="200" :active="activeIndex" finish-status="success">
                <el-step title="基本信息"></el-step>
                <el-step title="商品参数"></el-step>
                <el-step title="商品属性"></el-step>
                <el-step title="商品图片"></el-step>
                <el-step title="商品内容"></el-step>
                <el-step title="完成"></el-step>
            </el-steps>

            <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" label-position="top">
                <!-- tab栏区域 -->
                <el-tabs :tab-position="tabPosition" v-model="activeIndex" style="height: 100%;"
                    :before-leave="handleTabBeforeLeave" @tab-click="handleTabClick">
                    <el-tab-pane label="基本信息" name="0">
                        <el-form-item label="商品名称" prop="goods_name">
                            <el-input v-model="addForm.goods_name"></el-input>
                        </el-form-item>
                        <el-form-item label="商品分类" prop="goods_cat">
                            <!-- <el-input v-model="addForm.goods_cat"></el-input> -->
                            <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps"
                                @change="handleChange">
                            </el-cascader>
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
                       
                    </el-tab-pane>
                    <el-tab-pane label="商品参数" name="1">
                        <el-form-item :label="item.attr_name" v-for="item in targetCates" :key="item.attr_id"> 
                            <el-checkbox-group v-model="item.attr_vals">
                                <el-checkbox border v-for="(item2,i2) in item.attr_vals  " :key="i2" :label="item2"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品属性" name="2">
                        <el-form-item :label="item.attr_name" v-for="item in targetCates2" :key="item.attr_id"> 
                            <el-input v-model="item.attr_vals">{{item.attr_vals}}</el-input>
                        </el-form-item>
                    </el-tab-pane>
                    <el-tab-pane label="商品图片" name="3">
                        <el-upload
                            :headers = 'uploadHeaders'
                            action="http://127.0.0.1:8888/api/private/v1/upload"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :file-list="fileList"
                            list-type="picture"
                            :on-success = 'handleUploadSuccess'	
                            >
                            <el-button size="small" type="primary">点击上传</el-button>
                           
                        </el-upload>
                    </el-tab-pane>
                    <el-tab-pane label="商品内容" name="4">
                        <quill-editor v-model="addForm.goods_introduce"></quill-editor>
                        <el-form-item>
                            <el-button size="small" type="primary" @click="handleBtnAdd">添加商品</el-button>
                        </el-form-item>
                      
                    </el-tab-pane>
                </el-tabs>
            </el-form>
        </el-card>

        
        <el-dialog
        title="提示"
        :visible.sync="previewDialogVisible"
        width="30%"
        >
            <img :src="previewPath" alt="" width="100%"  >
            <span slot="footer" class="dialog-footer">
                <el-button @click="previewDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="previewDialogVisible = false">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import _ from 'lodash'
export default {
    data() {
        return {
            previewDialogVisible:false,
            previewPath:'',
            uploadHeaders: { Authorization: window.sessionStorage.getItem('token') },
            targetCates2:[],
            targetCates: [],
            cateProps: {
                expandTrigger: 'hover',
                value: 'cat_id',
                label: 'cat_name',
                children: 'children',
            },
            cateList: [],
            addFormRules: {

            },
            addForm: {
                goods_name: '',
                goods_cat: [],
                goods_price: '',
                goods_number: '',
                goods_weight: '',
                goods_introduce: '',
                pics: [],
                attrs:  [],
            },
            tabPosition: 'left',
            activeIndex: '0'
        }
    },
    created() {
        this.getCateList()
    },
    computed: {
        cateId() {
            if (this.addForm.goods_cat.length === 3)
                return this.addForm.goods_cat[2]
            else
                return null
        }
    },
    methods: {
         handleBtnAdd(){
            console.log('ddddddddddddd')
            this.$refs.addFormRef.validate(async valid=>{
                if(!valid) return this.$message.error('请填写必填项')

                // 发送请求
                const form = _.cloneDeep(this.addForm)
                form.goods_cat =  form.goods_cat.join(',') 

                // 处理动态参数
                this.targetCates.forEach(item=>{
                    console.log(item.attr_vals)
                    this.addForm.attrs.push({ attr_id: item.attr_id, attr_value:item.attr_vals.join(',')})
                })

                this.targetCates2.forEach(item=>{
                    console.log(item.attr_vals)
                    this.addForm.attrs.push({ attr_id: item.attr_id, attr_value:item.attr_vals })
                })

                form.attrs = this.addForm.attrs
                console.log(form)

                const { data: res } = await this.$http.post(`goods`,  form )
                if (res.meta.status !== 201) return this.$message.error(res.meta.msg)
                return this.$message.success(res.meta.msg)
                
                // console.log(res.data)
            })
        },
        handleUploadSuccess(response, file, fileList){
            console.log(response,file, fileList)
            this.addForm.pics.push({ pic: response.data.tmp_path }) 
        },
        handleRemove(file){
            // console.log( this.addForm.pics )
            let filePath = file.response.data.tmp_path
            let fileIndex = this.addForm.pics.findIndex(item=>{
               return item.pic == filePath
            })
            console.log( fileIndex )
            this.addForm.pics.splice(fileIndex,1)
            console.log( this.addForm )
        },
        handlePreview(file){
            console.log('dsff')
            this.previewPath = file.response.data.url
            // 打开预览窗口
            this.previewDialogVisible = true
        },
        async handleTabClick(tabObj) {
            console.log(tabObj)
            if (tabObj.index == '1') { // 商品参数
                 // 发送请求
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, {params:{sel: 'many'}  })
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

                res.data.forEach(item=>{
                    item.attr_vals = item.attr_vals ? item.attr_vals.split(',') : []
                })
                
                this.targetCates = res.data 
                console.log(this.targetCates)
            }else if(tabObj.index == '2'){ // 商品属性
                // 发送请求
                const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

                
                
                this.targetCates2 = res.data 
                console.log(this.targetCates2)
            }
           
        },
        handleTabBeforeLeave(activeName, oldActiveName) {
            console.log(activeName, oldActiveName)
            if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
                this.$message.error('请先选择商品分类')
                return false
            }
        },
        handleChange(node) {
            console.log(this.addForm.goods_cat)

            if (this.addForm.goods_cat.length < 3) {
                this.addForm.goods_cat = []
                return
            }
        },
        async getCateList() {
            const { data: res } = await this.$http.get(`categories`)
            if (res.meta.status !== 200) return this.$message.error(res.meta.msg)

            this.cateList = res.data
            console.log(res.data)
        },
        handleSave() {

        }
    }
}
</script>
<style lang="less" scoped>
  .quill-editor{ height:300px; } 
.el-steps {
    margin-top: 15px;
    font-size: 13px;
}

.el-tabs {
    margin-top: 15px;
}
</style>