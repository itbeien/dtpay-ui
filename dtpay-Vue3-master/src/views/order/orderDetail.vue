<template>
   <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
         <el-form-item label="订单编号" prop="orderId">
            <el-input
               v-model="queryParams.orderId"
               placeholder="请输入订单编号"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="商户编号" prop="mercNo">
            <el-input
               v-model="queryParams.mercNo"
               placeholder="请输入商户编号"
               clearable
               style="width: 200px"
               @keyup.enter="handleQuery"
            />
         </el-form-item>
         <el-form-item label="状态" prop="status">
            <el-select v-model="queryParams.status" placeholder="订单状态" clearable style="width: 200px">
               <el-option
                  v-for="dict in dt_pay_status"
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
         <!-- <el-col :span="1.5">
            <el-button
               type="primary"
               plain
               icon="Plus"
               @click="handleAdd"
               v-hasPermi="['dt:order:add']"
            >新增</el-button>
         </el-col> -->
         <!-- <el-col :span="1.5">
            <el-button
               type="success"
               plain
               icon="Edit"
               :disabled="single"
               @click="handleUpdate"
               v-hasPermi="['dt:order:edit']"
            >退款</el-button>
         </el-col> -->
         <el-col :span="1.5">
            <el-button
               type="danger"
               plain
               icon="Delete"
               :disabled="multiple"
               @click="handleDelete"
               v-hasPermi="['dt:order:remove']"
            >删除</el-button>
         </el-col>
         <el-col :span="1.5">
            <el-button
               type="warning"
               plain
               icon="Download"
               @click="handleExport"
               v-hasPermi="['dt:order:export']"
            >导出</el-button>
         </el-col>
         <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
      </el-row>

      <el-table v-loading="loading" :data="postList" @selection-change="handleSelectionChange">
         <el-table-column type="selection" width="55" align="center" />
         <el-table-column label="订单编号" align="center" prop="orderId" />
         <el-table-column label="商户编号" align="center" prop="mercNo" />
         <el-table-column label="渠道商户号" align="center" prop="payingMercNo" />
         <el-table-column label="渠道商户名称" align="center" prop="payingMercName" />
         <el-table-column label="支付流水号" align="center" prop="tradeSeq" />
         <el-table-column label="支付机构流水号" align="center" prop="bankTradeSeq" />
         <el-table-column label="订单金额(元)" align="center" prop="orderAmount" />
         <el-table-column label="订单状态" align="center" prop="payStatus">
            <template #default="scope">
               <dict-tag :options="dt_pay_status" :value="scope.row.status" />
            </template>
         </el-table-column>
         <el-table-column label="创建时间" align="center" prop="createTime" width="180">
            <template #default="scope">
               <span>{{ parseTime(scope.row.creationTime) }}</span>
            </template>
         </el-table-column>
         <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handlePayQuery(scope.row)" v-hasPermi="['dt:order:payQuery']">同步支付状态</el-button>
               <el-button link type="primary" icon="Edit" @click="handleRefund(scope.row)" v-hasPermi="['dt:order:refund']">退款</el-button>
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['dt:payseq:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['dt:payseq:remove']">删除</el-button>
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
            <el-form-item label="订单编号" prop="orderId">
               <el-input v-model="form.orderId" placeholder="请输入订单编号" disabled="true"/>
            </el-form-item>
            <el-form-item label="商户编号" prop="mercNo">
               <el-input v-model="form.mercNo" placeholder="请输入商户编号" disabled="true"/>
            </el-form-item>
            <el-form-item label="订单金额" prop="orderAmount">
               <el-input-number v-model="form.orderAmount" controls-position="right" :min="0" disabled="true"/>
            </el-form-item>
            <el-form-item label="订单状态" prop="status">
               <el-radio-group v-model="form.status">
                  <el-radio
                     v-for="dict in dt_pay_status"
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

<script setup name="payseq">
import { listPost, addPost, delPost, getPost, updatePost,refunOrder,payQuery } from "@/api/order/payseq";

const { proxy } = getCurrentInstance();
const { dt_pay_status } = proxy.useDict("dt_pay_status");

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
    orderId: undefined,
    mercNo: undefined,
    status: undefined
  },
  rules: {
    orderId: [{ required: true, message: "订单编号不能为空", trigger: "blur" }],
    mercNo: [{ required: true, message: "商户编号不能为空", trigger: "blur" }],
    orderAmount: [{ required: true, message: "订单金额不能为空", trigger: "blur" }],
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
    orderId: undefined,
    mercNo: undefined,
    orderAmount: undefined,
    postSort: 0,
    status: "0",
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
  ids.value = selection.map(item => item.tradeSeq);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}
/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加订单";
}

/** 退款操作 */
function handleRefund(row) {
  //reset();
  //const orderId = row.orderId || ids.value;
  const orderId = row.orderId;
  const payingMercNo = row.payingMercNo;
  const payAmount = row.orderAmount; 
  console.log("orderId:"+orderId);
  const data = {"orgTrace":orderId,"orgMercode":payingMercNo,"payAmount":payAmount}
  proxy.$modal.confirm('是否确认进行退款订单编号为"' + orderId + '"的数据项？').then(function() {
    return refunOrder(data);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("退款成功");
  }).catch(() => {});
}

function handlePayQuery(row){
     //reset();
  //const orderId = row.orderId || ids.value;
  const orderId = row.orderId;
  const payingMercNo = row.payingMercNo;
  console.log("orderId:"+orderId);
  const data = {"orgTrace":orderId,"orgMercode":payingMercNo}
  proxy.$modal.confirm('进行支付状态查询订单编号为"' + orderId + '"的数据项？').then(function() {
    return payQuery(data);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("同步支付状态成功");
  }).catch(() => {});
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const tradeSeq = row.tradeSeq || ids.value;
  console.log("tradeSeq:"+tradeSeq);
  getPost(tradeSeq).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改状态";
  });
}
/** 提交按钮 */
function submitForm() {
  proxy.$refs["postRef"].validate(valid => {
    if (valid) {
      if (form.value.tradeSeq != undefined) {
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
  const tradeSeqs = row.tradeSeq || ids.value;
  proxy.$modal.confirm('是否确认删除订单编号为"' + tradeSeqs + '"的数据项？').then(function() {
    return delPost(tradeSeqs);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download("dt/payseq/export", {
    ...queryParams.value
  }, `payseq_${new Date().getTime()}.xlsx`);
}

getList();
</script>
