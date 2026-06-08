<template>
  <AppShell>
    <header class="page-header">
      <div>
        <p class="eyebrow">ORDERS</p>
        <h1>我的订单</h1>
        <p>跟踪进行中的作业，完成或取消当前订单。</p>
      </div>
    </header>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        :class="{ active: currentStatus === tab.value }"
        @click="changeTab(tab.value)"
      >
        {{ tab.label }}
      </button>
    </div>

    <section v-if="loading" class="order-list">
      <article v-for="item in 3" :key="item" class="order-card skeleton-card">
        <span />
        <strong />
        <p />
      </article>
    </section>

    <p v-else-if="error" class="notice error">{{ error }}</p>

    <EmptyState
      v-else-if="orders.length === 0"
      title="暂无订单"
      description="切换订单状态或前往任务大厅接取新任务。"
    />

    <section v-else class="order-list">
      <article v-for="order in orders" :key="order.orderId" class="order-card">
        <div class="card-topline">
          <span>{{ order.statusLabel || '订单状态' }}</span>
          <strong>{{ money(order.actualIncome || order.expectedIncome) }}</strong>
        </div>
        <h2>{{ order.taskTitle || '未命名订单' }}</h2>
        <p class="muted">{{ order.locationName || '地点待确认' }}</p>
        <div class="metric-row">
          <span>{{ order.areaMu || 0 }} 亩</span>
          <span>{{ order.distanceKm || 0 }} km</span>
          <span>{{ order.orderNo }}</span>
        </div>

        <div v-if="[1, 2].includes(order.orderStatus)" class="action-row">
          <button class="secondary-button" type="button" :disabled="busyId === order.orderId" @click="handleComplete(order.orderId)">
            完成
          </button>
          <button class="danger-button" type="button" :disabled="busyId === order.orderId" @click="handleCancel(order.orderId)">
            取消
          </button>
        </div>
      </article>
    </section>

    <FeedbackToast :message="toast.message" :type="toast.type" />
  </AppShell>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue'
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

function money(value) {
  return `¥${Number(value || 0).toLocaleString()}`
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
