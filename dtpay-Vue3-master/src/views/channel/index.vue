<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="渠道名称" prop="channelName">
            <el-input
               v-model="queryParams.channelName"
               placeholder="请输入渠道名称"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="渠道编号" prop="channelCode">
            <el-input
               v-model="queryParams.channelCode"
               placeholder="请输入渠道号"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="渠道状态" clearable style="width: 200px">
               <el-option
                  v-for="dict in dt_channel_status"
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
               v-hasPermi="['system:post:add']"
            >新增</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['system:post:edit']"
            >修改</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['dt:channel:remove']"
            >删除</el-button>
         </el-col>
         <!-- <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['system:post:export']"
            >导出</el-button>
         </el-col> -->
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="渠道编号" align="center" prop="channelCode" />
         <el-table-column label="渠道名称" align="center" prop="channelName" />
         <el-table-column label="渠道机构ID" align="center" prop="orgId" />
         <el-table-column label="终端编号" align="center" prop="orgTermNo" />
         <el-table-column label="渠道状态" align="center" prop="status">
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
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['dt:channel:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['dt:channel:remove']">删除</el-button>
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
      <el-dialog :title="title" v-model="open" width="500px" append-to-body>
         <el-form ref="postRef" :model="form" :rules="rules" label-width="80px">
            <el-form-item label="渠道名称" prop="channelName">
               <el-input v-model="form.channelName" placeholder="请输入渠道名称" />
            </el-form-item>
            <el-form-item label="渠道简称" prop="chnNickName">
               <el-input v-model="form.chnNickName" placeholder="请输入渠道简称" />
            </el-form-item>
            <el-form-item label="渠道ID" prop="orgId">
               <el-input v-model="form.orgId" placeholder="请输入渠道ID" />
            </el-form-item>
            <el-form-item label="渠道终端号" prop="orgTermNo">
               <el-input v-model="form.orgTermNo" placeholder="请输入渠道终端号" />
            </el-form-item>
            <el-form-item label="秘钥" prop="privateKey">
               <el-input v-model="form.privateKey" type="textarea" placeholder="请输入秘钥" />
            </el-form-item>
            <el-form-item label="渠道状态" prop="status">
               <el-radio-group v-model="form.status">
                  <el-radio
                     v-for="dict in dt_channel_status"
                     :key="dict.value"
                     :label="dict.value"
                  >{{ dict.label }}</el-radio>
               </el-radio-group>
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

<script setup name="channel">
import { listPost, addPost, delPost, getPost, updatePost } from "@/api/channel/post";

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

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    channelCode: undefined,
    channelName: undefined,
    status: undefined
  },
  rules: {
    channelName: [{ required: true, message: "渠道名称不能为空", trigger: "blur" }],
    orgId: [{ required: true, message: "渠道机构号不能为空", trigger: "blur" }],
    status: [{ required: true, message: "渠道状态不能为空", trigger: "blur" }],
    privateKey: [{ required: true, message: "私钥不能为空", trigger: "blur" }],
   //  orgTermNo:[{ required: true, message: "渠道终端号不能为空", trigger: "blur" }],
   }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询订单列表 */
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
    channelCode: undefined,
    channelName: undefined,
    orgId: undefined,
    orgTermNo: undefined,
    status: "0",
    privateKey: undefined
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
  ids.value = selection.map(item => item.channelCode);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加支付渠道";
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const channelCode = row.channelCode || ids.value;
  getPost(channelCode).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改支付渠道";
  });
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs["postRef"].validate(valid => {
    if (valid) {
      if (form.value.channelCode != undefined) {
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
  const channelCodes = row.channelCode || ids.value;
  proxy.$modal.confirm('是否确认删除渠道编号为"' + channelCodes + '"的数据项？').then(function() {
    return delPost(channelCodes);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download("dt/channel/export", {
    ...queryParams.value
  }, `channel_${new Date().getTime()}.xlsx`);
}

getList();
</script>
