<template>
  <AppShell>
    <header class="page-header workbench-hero">
      <div>
        <p class="eyebrow">ORDER OPS</p>
        <h1>我的订单</h1>
        <p>跟踪进行中的飞防作业，核对面积、位置、收益和订单状态，完成或取消当前可操作订单。</p>
      </div>
    </header>

    <section class="overview-grid order-overview">
      <article class="stat-card highlight">
        <span>全部</span>
        <strong>{{ orderStats.all }}</strong>
        <small>当前列表</small>
      </article>
      <article class="stat-card">
        <span>进行中</span>
        <strong>{{ orderStats.running }}</strong>
        <small>可继续操作</small>
      </article>
      <article class="stat-card">
        <span>已完成</span>
        <strong>{{ orderStats.completed }}</strong>
        <small>已计入收入</small>
      </article>
      <article class="stat-card">
        <span>已取消</span>
        <strong>{{ orderStats.cancelled }}</strong>
        <small>不计入收入</small>
      </article>
    </section>

    <div class="toolbar-row">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          :class="{ active: currentStatus === tab.value }"
          :disabled="loading"
          @click="changeTab(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <section v-if="loading" class="order-list">
      <article v-for="item in 4" :key="item" class="order-card skeleton-card">
        <span />
        <strong />
        <p />
      </article>
    </section>

    <p v-else-if="error" class="notice error">{{ error }}</p>

    <EmptyState
      v-else-if="orders.length === 0"
      title="暂无订单"
      description="切换订单状态，或前往任务大厅接取新的植保任务。"
    />

    <section v-else class="order-list">
      <article v-for="order in orders" :key="order.orderId" class="order-card order-card-pro">
        <div class="order-main">
          <div class="card-topline">
            <span :class="statusClass(order.orderStatus)">{{ order.statusLabel || '订单状态' }}</span>
            <small>{{ order.orderNo || '订单编号待生成' }}</small>
          </div>

          <h2>{{ order.taskTitle || '未命名订单' }}</h2>
          <p class="muted">{{ order.locationName || '地点待确认' }}</p>

          <div class="metric-row metric-grid">
            <span>{{ order.areaMu || 0 }} 亩</span>
            <span>{{ order.distanceKm || 0 }} km</span>
            <span>接单 {{ formatTime(order.acceptedTime) }}</span>
            <span>完成 {{ formatTime(order.completedTime) }}</span>
          </div>
        </div>

        <div class="order-side">
          <span>订单收入</span>
          <strong>{{ money(order.actualIncome || order.expectedIncome) }}</strong>
          <div v-if="[1, 2].includes(order.orderStatus)" class="action-row">
            <button class="secondary-button" type="button" :disabled="busyId === order.orderId" @click="handleComplete(order.orderId)">
              {{ busyId === order.orderId ? '处理中' : '完成' }}
            </button>
            <button class="danger-button" type="button" :disabled="busyId === order.orderId" @click="handleCancel(order.orderId)">
              取消
            </button>
          </div>
        </div>
      </article>
    </section>

    <FeedbackToast :message="toast.message" :type="toast.type" />
  </AppShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import AppShell from '../components/AppShell.vue'
import EmptyState from '../components/EmptyState.vue'
import FeedbackToast from '../components/FeedbackToast.vue'
import { cancelOrder, completeOrder, getMyOrders } from '../api/order'

const tabs = [
  { label: '全部', value: 'all' },
  { label: '进行中', value: 'running' },
  { label: '已完成', value: 'completed' }
]

const currentStatus = ref('all')
const orders = ref([])
const loading = ref(true)
const error = ref('')
const busyId = ref(null)
const toast = reactive({
  message: '',
  type: 'info'
})

const orderStats = computed(() => ({
  all: orders.value.length,
  running: orders.value.filter((order) => [1, 2].includes(order.orderStatus)).length,
  completed: orders.value.filter((order) => order.orderStatus === 3).length,
  cancelled: orders.value.filter((order) => order.orderStatus === 0).length
}))

function money(value) {
  return `¥${Number(value || 0).toLocaleString()}`
}

function formatTime(value) {
  if (!value) return '待确认'
  return String(value).replace('T', ' ').slice(0, 16)
}

function statusClass(status) {
  return {
    'status-running': [1, 2].includes(status),
    'status-completed': status === 3,
    'status-cancelled': status === 0
  }
}

function showToast(message, type = 'info') {
  toast.message = message
  toast.type = type
  window.setTimeout(() => {
    toast.message = ''
  }, 2400)
}

async function fetchOrders() {
  loading.value = true
  error.value = ''

  try {
    const data = await getMyOrders({ status: currentStatus.value, page: 1, size: 10 })
    orders.value = data?.records || []
  } catch (err) {
    error.value = err.message || '订单加载失败'
  } finally {
    loading.value = false
  }
}

function changeTab(status) {
  currentStatus.value = status
  fetchOrders()
}

async function handleComplete(orderId) {
  if (busyId.value) return

  busyId.value = orderId

  try {
    await completeOrder(orderId)
    showToast('订单已完成', 'success')
    fetchOrders()
  } catch (err) {
    showToast(err.message || '操作失败', 'error')
  } finally {
    busyId.value = null
  }
}

async function handleCancel(orderId) {
  if (busyId.value) return

  busyId.value = orderId

  try {
    await cancelOrder(orderId)
    showToast('订单已取消', 'success')
    fetchOrders()
  } catch (err) {
    showToast(err.message || '操作失败', 'error')
  } finally {
    busyId.value = null
  }
}

onMounted(fetchOrders)
</script>
