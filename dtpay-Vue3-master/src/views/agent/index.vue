<template>
  <div class="app-container">
     <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
        <el-form-item label="代理商名称" prop="agentName">
           <el-input
              v-model="queryParams.agentName"
              placeholder="请输入代理商名称"
              clearable
              style="width: 200px"
              @keyup.enter="handleQuery"
           />
        </el-form-item>
        <el-form-item label="状态" prop="status">
           <el-select v-model="queryParams.status" placeholder="代理商状态" clearable style="width: 200px">
              <el-option
                 v-for="dict in dt_channel_status"
                 :key="dict.value"
                 :label="dict.label"
                 :value="dict.value"
              />
           </el-select>
        </el-form-item>
        <el-form-item>
           <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
           <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
     </el-form>

     <el-row :gutter="10" class="mb8">
        <el-col :span="1.5">
           <el-button
              type="primary"
              plain
              icon="Plus"
              @click="handleAdd"
              v-hasPermi="['system:agent:add']"
           >添加代理商</el-button>
        </el-col>
        <el-col :span="1.5">
           <el-button
              type="success"
              plain
              icon="Edit"
              :disabled="single"
              @click="handleUpdate"
              v-hasPermi="['system:agent:edit']"
           >修改</el-button>
        </el-col>
        <el-col :span="1.5">
           <el-button
              type="danger"
              plain
              icon="Delete"
              :disabled="multiple"
              @click="handleDelete"
              v-hasPermi="['dt:agent:remove']"
           >删除</el-button>
        </el-col>
        <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
     </el-row>

     <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="代理商编号" align="center" prop="id" />
        <el-table-column label="代理商名称" align="center" prop="agentName" />
        <el-table-column label="联系人" align="center" prop="contactPerson" />
        <el-table-column label="登录用户名" align="center" prop="orgAccount" />
        <el-table-column label="结算费率" align="center" prop="rate" />
        <el-table-column label="状态" align="center" prop="status">
        <template #default="scope">
              <dict-tag :options="dt_channel_status" :value="scope.row.status" />
        </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
           <template #default="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
           </template>
        </el-table-column>
        <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
           <template #default="scope">
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['dt:agent:edit']">修改</el-button>
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['dt:agent:remove']">删除</el-button>
           </template>
        </el-table-column>
     </el-table>

     <pagination
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
     />

     <!-- 添加或修改渠道对话框 -->
     <el-dialog :title="title" v-model="open" width="800px" append-to-body>
        <el-form ref="postRef" :model="form" :rules="rules" label-width="150px">
         <el-form-item label="法人身份证正面" prop="rxm">
            <el-upload
    :file-list="rxmFileList"
    list-type="picture-card"
    action="#"
    :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove"
    limit="1"
    :http-request="(params) => httpRequest(params,'01')"
    :before-upload="beforeUpload"
  >
    <el-icon><Plus /></el-icon>
  </el-upload>
           </el-form-item>
           <el-form-item label="法人身份证反面" prop="ghm">
            <el-upload
    :file-list="ghmFileList"
    action="#"
    list-type="picture-card"
    :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove"
    :http-request="(params) => httpRequest(params,'02')"
    :before-upload="beforeUpload"
  >
    <el-icon><Plus /></el-icon>
  </el-upload>
           </el-form-item>
           <el-form-item label="身份证号" prop="idCard">
              <el-input v-model="form.idCard"  placeholder="请输入身份证号" />
           </el-form-item>  
         <el-form-item label="代理商名称" prop="agentName">
              <el-input v-model="form.agentName" placeholder="请输入渠道名称" />
           </el-form-item>
           <el-form-item label="上级代理商" prop="parentId">
                     <el-select
               v-model="agentValue"
               placeholder="请选择"
               size="large"
               style="width: 240px"
               @change="changeAgent"
            >
               <el-option
               v-for="item in agentOptions"
               :key="item.id"
               :label="item.agentName"
               :value="item.id"
               />
            </el-select>
           </el-form-item>
           <el-form-item label="登录用户名" prop="orgAccount">
              <el-input v-model="form.orgAccount" placeholder="请输入登录用户名" />
           </el-form-item>
           <el-form-item label="联系人姓名" prop="contactPerson">
              <el-input v-model="form.contactPerson" placeholder="请输入联系人姓名" />
           </el-form-item>
           <el-form-item label="联系人手机" prop="contactTel">
              <el-input v-model="form.contactTel"  placeholder="请输入联系人手机" />
           </el-form-item>
           <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                 <el-radio
                    v-for="dict in dt_channel_status"
                    :key="dict.value"
                    :label="dict.value"
                 >{{ dict.label }}</el-radio>
              </el-radio-group>
           </el-form-item>
           <el-form-item label="地区" prop="areaId">
                           <el-select
                     v-model="pvalue"
                     placeholder="请选择"
                     size="large"
                     style="width: 240px"
                     @change="pChange($event,'p')"
                  >
                     <el-option
                     v-for="item in options"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"
                     />
                  </el-select>
                  <el-select v-model="cvalue" placeholder="请选择" style="width: 240px" size="large" @change="pChange($event,'c')" >
                     <el-option
                     v-for="item in cityOptions"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"
                     />
                  </el-select>
                  <el-select
                     v-model="avalue"
                     placeholder="请选择"
                     size="large"
                     style="width: 240px"
                     @change="pChange($event,'a')"
                  >
                     <el-option
                     v-for="item in areaOptions"
                     :key="item.value"
                     :label="item.label"
                     :value="item.value"
                     />
                  </el-select>
            </el-form-item>
           <el-form-item label="详细地址" prop="address">
              <el-input v-model="form.address" type="textarea" placeholder="请输入详细地址" />
           </el-form-item>
           <el-form-item label="代理商邮箱" prop="email">
              <el-input v-model="form.email"  placeholder="请输入代理商邮箱" />
           </el-form-item>
           <el-form-item label="银行卡卡号面" prop="bankNo">
            <el-upload
    :file-list="bankNoFileList"
    list-type="picture-card"
    action="#"
    :on-preview="handlePictureCardPreview"
    :on-remove="handleRemove"
    limit="1"
    :http-request="(params) => httpRequest(params,14)"
    :before-upload="beforeUpload"
  >
    <el-icon><Plus /></el-icon>
  </el-upload>
           </el-form-item>
           <el-form-item label="银行卡号" prop="bankNumber">
              <el-input v-model="form.bankNumber" placeholder="请输入银行卡号" />
           </el-form-item>
           <el-form-item label="微信费率" prop="wechatRate">
              <el-input v-model="form.wechatRate"  placeholder="请输入微信费率" />
           </el-form-item>
           <el-form-item label="支付宝费率" prop="alipayRate">
              <el-input v-model="form.alipayRate"  placeholder="请输入支付宝费率" />
           </el-form-item>
           <el-form-item label="云闪付费率" prop="unionRate">
              <el-input v-model="form.unionRate"  placeholder="请输入云闪付费率" />
           </el-form-item>
           <el-form-item label="聚合支付费率" prop="rate">
              <el-input v-model="form.rate"  placeholder="请输入聚合支付费率" />
           </el-form-item>
        
        </el-form>
        <template #footer>
           <div class="dialog-footer">
              <el-button type="primary" @click="submitForm">确 定</el-button>
              <el-button @click="cancel">取 消</el-button>
           </div>
        </template>
     </el-dialog>
  </div>
</template>

<script setup name="agent">
import { uploadImg,listAgent,getAgent,addAgent,delAgent,ylArea,parentAgent,updateAgent} from "@/api/agent/agent";
//import { formProps, UploadProps, UploadUserFile } from "element-plus";

const { proxy } = getCurrentInstance();
const { dt_channel_status } = proxy.useDict("dt_channel_status");

const postList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
let ghmFileList = []
let rxmFileList = []
let bankNoFileList = []
let options = []
let cityOptions = []
let areaOptions = []
let agentOptions = []
const pvalue = ref('')
const cvalue = ref('')
const avalue = ref('')
const agentValue = ref('')

const data = reactive({
 form: {
   imgInfo:{}
 },
 queryParams: {
   pageNum: 1,
   pageSize: 10,
   agentName: undefined,
   status: undefined
 },
 rules: {
   agentName: [{ required: true, message: "代理商名称不能为空", trigger: "blur" }],
   contactPerson: [{ required: true, message: "联系人姓名不能为空", trigger: "blur" }],
   status: [{ required: true, message: "代理商状态不能为空", trigger: "blur" }],
   bankNumber: [{ required: true, message: "银行卡号不能为空", trigger: "blur" }],
   idCard: [{ required: true, message: "身份证号不能为空", trigger: "blur" }],
   ghm: [{ required: true, message: "身份证正面不能为空", trigger: "blur" }],
   rxm: [{ required: true, message: "身份证反面不能为空", trigger: "blur" }],
   contactTel: [{ required: true, message: "联系人手机不能为空", trigger: "blur" }],
   address: [{ required: true, message: "详细地址不能为空", trigger: "blur" }], 
   bankNo: [{ required: true, message: "银行卡卡号面不能为空", trigger: "blur" }],
   wechatRate: [{ required: true, message: "微信费率不能为空", trigger: "blur" }], 
   alipayRate: [{ required: true, message: "支付宝费率不能为空", trigger: "blur" }], 
   unionRate: [{ required: true, message: "云闪付费率不能为空", trigger: "blur" }], 
   rate: [{ required: true, message: "聚合支付费率不能为空", trigger: "blur" }], 
   areaId: [{ required: true, message: "地区不能为空", trigger: "blur" }],
   parentId: [{ required: true, message: "上级机构不能为空", trigger: "blur" }],  
}
});

const { queryParams, form, rules } = toRefs(data);
function httpRequest(item,picMode){
   let formData =new FormData()
   formData.append("file", item.file)
   formData.append("picMode",picMode)
   uploadImg(formData).then(response=>{
      console.log("fileId:"+response.data)
      if("01" == picMode){//01 rxm  02 ghm 14 银行卡
         form.value.rxm = response.data 
         console.log("rxm:"+form.value.rxm)
      }else if("02" == picMode){
         form.value.ghm = response.data
         console.log("ghm:"+form.value.ghm) 
      }else if("14" == picMode){
         form.value.bankNo = response.data
         console.log("bankNo:"+form.value.bankNo) 
      }
   }) 
}

function pChange(e,city){
   console.log("省份value:"+e)
   console.log("city value:"+city)
   const param = {"parentCode":e}
   if('a' == city){//
      //赋值
      console.log("a-area:"+e)
      form.value.areaId = e
   }else{
      ylArea(param).then(response => {
         if('p'==city){
            cityOptions = response.data;
         }else{
            areaOptions = response.data
         }
         
      });
   }
}

function changeAgent(e){
   form.value.parentId = e;
}

function beforeUpload(file){
   if (file.type.indexOf("image/") == -1) {
    proxy.$modal.msgError("文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。");
    return false
   }
   // options.img = import.meta.env.VITE_APP_BASE_API + response.imgUrl;
}
/** 查询订单列表 */
function getList() {
 loading.value = true;
 listAgent(queryParams.value).then(response => {
   postList.value = response.rows;
   total.value = response.total;
   loading.value = false;
 });
}
/** 取消按钮 */
function cancel() {
 open.value = false;
 reset();
}
/** 表单重置 */
function reset() {
 form.value = {
   agentCode: undefined,
   agentName: undefined,
   bankNumber: undefined,
   email: undefined,
   status: "0",
   address: undefined,
   rxm:undefined,
   ghm:undefined,
   bankNo:undefined
 };

 ghmFileList = []
 rxmFileList = []
 bankNoFileList = []
 proxy.resetForm("postRef");
}
/** 搜索按钮操作 */
function handleQuery() {
 queryParams.value.pageNum = 1;
 getList();
}
/** 重置按钮操作 */
function resetQuery() {
 proxy.resetForm("queryRef");
 handleQuery();
}
/** 多选框选中数据 */
function handleSelectionChange(selection) {
 ids.value = selection.map(item => item.id);
 single.value = selection.length != 1;
 multiple.value = !selection.length;
}
/** 新增按钮操作 */
function handleAdd() {
 reset();
 open.value = true;
 const param = {"parentCode":'0'}
 ylArea(param).then(response => {
   options = response.data;
 });

 parentAgent(null).then(response => {
   agentOptions = response.data;
 });

 title.value = "新增代理商";
}
/** 修改按钮操作 */
function handleUpdate(row) {
 reset();
 const id = row.id || ids.value;
 getAgent(id).then(response => {
   
   const param = {"parentCode":'0'}
 ylArea(param).then(response => {
   options = response.data;
 });

 parentAgent(null).then(response => {
   agentOptions = response.data;
 });
   form.value = response.data;
   console.log("edit:"+form.value.imgInfo)
   const imgInfos = JSON.parse(form.value.imgInfo)
	const map = new Map(Object.entries(imgInfos));
   const rates = JSON.parse(form.value.rate)
	const rateMap = new Map(Object.entries(rates));
   form.value.wechatRate = rateMap.get("wechat")
   form.value.alipayRate = rateMap.get("alipay")
   form.value.unionRate = rateMap.get("union")
   form.value.rate = rateMap.get("rate")

	form.value.ghm = map.get("02") 
   let ghmSrc = import.meta.env.VITE_APP_BASE_API +"/profile/"+ map.get("02")+".png"
   console.log("ghm:"+import.meta.env.VITE_APP_BASE_API+"/profile/" + map.get("02")+".png")
	form.value.rxm = map.get("01")
   form.value.bankNo = map.get("14")
   let rxmSrc = import.meta.env.VITE_APP_BASE_API +"/profile/"+ map.get("01")+".png"
   let bankNoSrc = import.meta.env.VITE_APP_BASE_API +"/profile/"+ map.get("14")+".png" 
   let fileListGhm = {"name":map.get("02"),"url":ghmSrc}
   let fileListRxm = {"name":map.get("01"),"url":rxmSrc}
   let fildListBankNo = {"name":map.get("14"),"url":bankNoSrc}
   ghmFileList.push(fileListGhm)
   rxmFileList.push(fileListRxm)
   bankNoFileList.push(fildListBankNo)
   open.value = true;
   title.value = "修改代理商";
 });
}
/** 提交按钮 */
function submitForm() {
 proxy.$refs["postRef"].validate(valid => {
   if (valid) {
     if (form.value.id != undefined) {
      let imgInfoValue = {"01":form.value.rxm,"02":form.value.ghm,"14":form.value.bankNo}
      let rateValue = {"wechat":form.value.wechatRate,"alipay":form.value.alipayRate,"union":form.value.unionRate,"rate":form.value.rate}
      form.value.imgInfo=imgInfoValue
       form.value.rate = rateValue
       updateAgent(form.value).then(response => {
         proxy.$modal.msgSuccess("修改成功");
         open.value = false;
         getList();
       });
     } else {
      let imgInfoValue = {"01":form.value.rxm,"02":form.value.ghm,"14":form.value.bankNo}
      let rateValue = {"wechat":form.value.wechatRate,"alipay":form.value.alipayRate,"union":form.value.unionRate,"rate":form.value.rate}
      form.value.imgInfo=imgInfoValue
       form.value.rate = rateValue
       addAgent(form.value).then(response => {
         proxy.$modal.msgSuccess("新增成功");
         open.value = false;
         getList();
       });
     }
   }
 });
}
/** 删除按钮操作 */
function handleDelete(row) {
 const agentIds = row.id || ids.value;
 proxy.$modal.confirm('是否确认删除代理商编号为"' + agentIds + '"的数据项？').then(function() {
   return delAgent(agentIds);
 }).then(() => {
   getList();
   proxy.$modal.msgSuccess("删除成功");
 }).catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
 proxy.download("dt/agent/export", {
   ...queryParams.value
 }, `agent_${new Date().getTime()}.xlsx`);
}

getList();
</script>
