<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="商户编号" prop="merchantNo">
            <el-input
               v-model="queryParams.merchantNo"
               placeholder="请输入商户编号"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="渠道商户号" prop="orgMerCode">
            <el-input
               v-model="queryParams.orgMerCode"
               placeholder="请输入渠道商户号"
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
               v-hasPermi="['dt:merchant:add']"
            >新增</el-button>
         </el-col> -->
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['dt:merchant:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['dt:merchant:remove']"
            >删除</el-button>
         </el-col>
         <!-- <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['dt:merchant:export']"
            >导出</el-button>
         </el-col> -->
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="商户编号" align="center" prop="merchantNo" />
         <el-table-column label="商户名称" align="center" prop="payingMercName" />
         <el-table-column label="渠道ID" align="center" prop="orgId" />
         <el-table-column label="渠道商户号" align="center" prop="orgMerCode" />
         <el-table-column label="渠道终端编号" align="center" prop="orgTermNo" />
         <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['dt:merchant:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['dt:merchant:remove']">删除</el-button>
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

      <!-- 添加或修改岗位对话框 -->
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
         <el-form ref="postRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="商户编号" prop="merchantNo">
               <el-input v-model="form.merchantNo" placeholder="请输入商户编号" disabled="true"/>
            </el-form-item>
            <el-form-item label="商户名称" prop="payingMercName">
               <el-input v-model="form.payingMercName" placeholder="请输入商户名称" disabled="true" />
            </el-form-item>
            <el-form-item label="渠道ID" prop="orgId">
               <el-input v-model="form.orgId" placeholder="请输入渠道ID"/>
            </el-form-item>
            <el-form-item label="渠道商户号" prop="orgMerCode">
               <el-input v-model="form.orgMerCode" placeholder="请输入渠道商户号"/>
            </el-form-item>
            <el-form-item label="渠道终端号" prop="orgTermNo">
               <el-input v-model="form.orgTermNo" placeholder="请输入渠道终端号"/>
            </el-form-item>
            <el-form-item label="渠道私钥" prop="privateKey">
               <el-input v-model="form.privateKey" type="textarea" placeholder="请输入渠道私钥" />
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

<script setup name="Post">
import { listPost, addPost, delPost, getPost, updatePost } from "@/api/merchant/channelMerchant";

const { proxy } = getCurrentInstance();
const { dt_merchant_status } = proxy.useDict("dt_merchant_status");

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
    merchantNo: undefined,
    orgMerCode: undefined
  },
  rules: {
    payingMercName: [{ required: true, message: "商户名称不能为空", trigger: "blur" }],
    merchantNo: [{ required: true, message: "商户编号不能为空", trigger: "blur" }],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询岗位列表 */
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
    mercNo: undefined,
    mercName: undefined,
    telphone: undefined,
    status: "0"
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
  title.value = "添加岗位";
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const id = row.id || ids.value;
  getPost(id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改渠道商户";
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
  const ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除岗位编号为"' + ids + '"的数据项？').then(function() {
    return delPost(ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download("dt/merchant/export", {
    ...queryParams.value
  }, `merchant_${new Date().getTime()}.xlsx`);
}

getList();
</script>
