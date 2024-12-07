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
         <el-form-item label="商户编号" prop="merchantNo"> 
            <el-input
               v-model="queryParams.merchantNo"
               placeholder="请输入商户编号"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="商户名称" prop="merchantName"> 
            <el-input
               v-model="queryParams.merchantName"
               placeholder="请输入商户名称"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item> 
         <el-form-item>
            <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
            <el-button icon="Refresh" @click="resetQuery">重置</el-button>
         </el-form-item>
      </el-form>

      <el-row :gutter="10" class="mb8">
         <!-- <el-col :span="1.5">
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
         </el-col> -->
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
         <!-- <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['dt:qrcode:export']"
            >导出</el-button>
         </el-col> -->
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="编号" align="center" prop="id" />
         <el-table-column label="二维码编号" align="center" prop="qrCode" />
         <el-table-column label="商户编号" align="center" prop="merchantNo"/>
         <el-table-column label="商户名称" align="center" prop="merchantName" />
         <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <!-- <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['dt:device:edit']">修改</el-button> -->
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['dt:device:remove']">删除</el-button>
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
   </div>
</template>

<script setup name="merchantDevice">
import { listPost, addPost, delPost, getPost, updatePost } from "@/api/qrcode/merchantDevice";

const envUrl = import.meta.env.VITE_APP_BASE_API;
const url =ref(envUrl);
const { proxy } = getCurrentInstance();
const { dt_qr_status } = proxy.useDict("dt_qr_status");

const postList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    qrCode: undefined,
    merchantNo: undefined
  },
  rules: {
    qrStatus: [{ required: true, message: "状态不能为空", trigger: "blur" }],
    number  : [{ required: true, message: "二维码数量不能为空", trigger: "blur" }],
  }
});

const { queryParams, form, rules } = toRefs(data);

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
  title.value = "二维码商户绑定";
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
    title.value = "修改二维码商户绑定信息";
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

getList();
</script>
