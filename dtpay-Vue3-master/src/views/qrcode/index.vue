<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="二维码编号" prop="qrCode">
            <el-input
               v-model="queryParams.qrCode"
               placeholder="请输入二维码编号"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <!-- <el-form-item label="所属商户" prop="postName"> 
            <el-input
               v-model="queryParams.postName"
               placeholder="请输入商户名称"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>-->
         <el-form-item label="状态" prop="qrStatus">
            <el-select v-model="queryParams.qrStatus" placeholder="二维码状态" clearable style="width: 200px">
               <el-option
                  v-for="dict in dt_qr_status"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
               />
            </el-select>
         </el-form-item>
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
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
               v-hasPermi="['dt:qrcode:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['dt:qrcode:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['dt:qrcode:remove']"
            >删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['dt:qrcode:export']"
            >导出</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="multiple"
               @click="allocationQR"
               v-hasPermi="['dt:qrcode:allocationQR']"
            >划拨二维码</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="二维码编号" align="center" prop="qrCode" />
         <el-table-column label="所属代理商" align="center" prop="agentId" />
         <el-table-column label="二维码" align="center" prop="qrUrl">
            <template #default="{row}">    
               <img style="width: 100px; height: 100px;" :key="qrCode" :src="url+row.qrUrl" alt="">
            </template>
         </el-table-column>
         <!-- <el-table-column label="所属商户" align="center" prop="postName" /> -->
         <el-table-column label="状态" align="center" prop="qrStatus">
            <template #default="scope">
               <dict-tag :options="dt_qr_status" :value="scope.row.qrStatus" />
            </template>
         </el-table-column>
         <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['dt:qrcode:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['dt:qrcode:remove']">删除</el-button>
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

      <!-- 添加或修改二维码对话框 -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
         <el-form ref="postRef" :model="form" :rules="rules" label-width="80px">
            
            <el-form-item label="数量" prop="number">
               <el-input-number v-model="form.number" controls-position="right" :min="5" />
            </el-form-item>
            <el-form-item label="状态" prop="qrStatus">
               <el-radio-group v-model="form.qrStatus">
                  <el-radio
                     v-for="dict in dt_qr_status"
                     :key="dict.value"
                     :label="dict.value"
                  >{{ dict.label }}</el-radio>
               </el-radio-group>
            </el-form-item>
            <el-form-item label="备注" prop="remark">
               <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
            </el-form-item>
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="submitForm">确 定</el-button>
               <el-button @click="cancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>

      <!-- 划拨二维码对话框 -->
      <el-dialog :title="title" v-model="allocationOpen" width="700px" append-to-body>
         <el-form ref="allocationPostRef" :model="allocationForm" :rules="qrRules" label-width="80px">
            
            <el-form-item label="请选择代理商" required prop="agentId">
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
         </el-form>
         <template #footer>
            <div class="dialog-footer">
               <el-button type="primary" @click="allocationSubmitForm">确 定</el-button>
               <el-button @click="allocationCancel">取 消</el-button>
            </div>
         </template>
      </el-dialog>
   </div>
</template>

<script setup name="qrCode">
import { listPost, addPost, delPost, getPost, updatePost, postAllocationQR } from "@/api/qrcode/post";
import { parentAgent } from  "@/api/agent/agent";
import { reactive } from "vue";

const envUrl = import.meta.env.VITE_APP_BASE_API;
const url =ref(envUrl);
const { proxy } = getCurrentInstance();
const { dt_qr_status } = proxy.useDict("dt_qr_status");

const postList = ref([]);
const open = ref(false);
const allocationOpen = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");
let agentOptions = []
const agentValue = ref('')
const allocationForm = ref(
   {
      agentId:'',
      qrCodeIds:''
   }
)
const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    qrCode: undefined,
    qrStatus: undefined
  },
  rules: {
    qrStatus: [{ required: true, message: "状态不能为空", trigger: "blur" }],
    number  : [{ required: true, message: "二维码数量不能为空", trigger: "blur" }],
  }
});

const rulesData = reactive({
   qrRules: {
    agentId: [{ required: true, message: "代理商不能为空", trigger: "blur" }],
  }
})

const { queryParams, form, rules } = toRefs(data);

const { qrRules } = toRefs(rulesData);

/** 查询二维码列表 */
function getList() {
  loading.value = true;
  listPost(queryParams.value).then(response => {
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
    number: 0,
    qrStatus: "0",
    remark: undefined
  };
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
  title.value = "添加二维码";
}
/** 修改按钮操作 */
function handleUpdate(row) {
  console.log("进入到修改方法"); 
  reset();
  const id = row.id || ids.value;
  console.log("id:"+id);
  getPost(id).then(response => {
    form.value = response.data;
    form.value.number = 5;
    open.value = true;
    title.value = "修改二维码信息";
  });
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs["postRef"].validate(valid => {
    if (valid) {
      if (form.value.id != undefined) {
        updatePost(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addPost(form.value).then(response => {
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
  const qrIds = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除二维码编号为"' + qrIds + '"的数据项？').then(function() {
    return delPost(qrIds);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download("dt/qrcode/export", {
    ...queryParams.value
  }, `QR_${new Date().getTime()}.xlsx`);
}

/** 划拨二维码 */
function allocationQR() {
  console.log("进入到划拨二维码方法"); 
  reset();
  allocationForm.value.qrCodeIds = ids.value;
  console.log("id:"+ ids.value);
  allocationOpen.value = true;
  title.value = "划拨二维码";
  parentAgent(null).then(response => {
   agentOptions = response.data;
 });
}

function changeAgent(e){
   console.log("选择的代理商:"+e)
   allocationForm.value.agentId = e;
}

/** 取消按钮 */
function allocationCancel() {
  allocationOpen.value = false;
  //reset();
}

/** 划拨二维码 */
function allocationSubmitForm() {
  let idValues = ids.value.join(',');
  console.log("ids:"+idValues)
  //allocationForm.value.agentId
  const data ={'ids':idValues,"agentId":allocationForm.value.agentId}
  //data = JSON.parse(data);
  proxy.$refs["allocationPostRef"].validate(valid => {
    if (valid) {
      postAllocationQR(data).then(response => {
        console.log("response:"+response.data)
        proxy.$modal.msgSuccess("划拨二维码成功");
        allocationOpen.value = false;
        getList();
     }); 
    }
  });
}

getList();
</script>
