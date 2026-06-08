<template>
  <AppShell>
    <header class="page-header workbench-hero">
      <div>
        <p class="eyebrow">PILOT CENTER</p>
        <h1>个人工作台</h1>
        <p>查看飞手资料、作业收入和账户状态，保持接单身份与平台登录状态清晰可控。</p>
      </div>
    </header>

    <section class="profile-workbench">
      <article class="profile-card profile-identity">
        <div class="avatar">{{ displayName.slice(0, 1) }}</div>
        <div>
          <p class="eyebrow">认证飞手</p>
          <h2>{{ displayName }}</h2>
          <p>{{ userInfo?.phone || '手机号未填写' }}</p>
          <span>{{ userInfo?.role || 'pilot' }}</span>
        </div>
      </article>

      <article class="stat-card highlight">
        <span>累计收入</span>
        <strong>{{ money(summary.totalIncome) }}</strong>
        <small>已完成订单统计</small>
      </article>

      <article class="stat-card">
        <span>已完成订单</span>
        <strong>{{ summary.completedOrderCount || 0 }}</strong>
        <small>平台结算口径</small>
      </article>

      <article class="stat-card">
        <span>进行中订单</span>
        <strong>{{ runningOrderCount }}</strong>
        <small>当前飞手订单</small>
      </article>
    </section>

    <section class="profile-lower">
      <article class="account-panel">
        <div class="section-heading">
          <span>账户</span>
          <h2>账户信息</h2>
        </div>
        <div class="detail-grid compact">
          <div class="info-item">
            <span>用户名</span>
            <strong>{{ userInfo?.username || displayName }}</strong>
          </div>
          <div class="info-item">
            <span>手机号</span>
            <strong>{{ userInfo?.phone || '待完善' }}</strong>
          </div>
          <div class="info-item">
            <span>角色</span>
            <strong>{{ userInfo?.role || 'pilot' }}</strong>
          </div>
        </div>
      </article>

      <article class="logout-panel">
        <div>
          <span>登录状态</span>
          <strong>当前账号已登录</strong>
          <p>退出后会清除本地 token 和 userInfo，并返回登录页。</p>
        </div>
        <button class="danger-button logout-button" type="button" @click="handleLogout">
          <PhSignOut :size="19" />
          退出登录
        </button>
      </article>
    </section>

    <p v-if="loading" class="notice">正在加载收入与订单统计...</p>
    <p v-else-if="error" class="notice error">{{ error }}</p>
  </AppShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhSignOut } from '@phosphor-icons/vue'
import AppShell from '../components/AppShell.vue'
import { getIncomeSummary, getMyOrders } from '../api/order'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)
const error = ref('')
const runningOrderCount = ref(0)
const summary = reactive({
  totalIncome: 0,
  completedOrderCount: 0
})

const userInfo = computed(() => authStore.userInfo || {})
const displayName = computed(() => userInfo.value.username || userInfo.value.nickname || userInfo.value.phone || '飞手')

function money(value) {
  return `¥${Number(value || 0).toLocaleString()}`
}

async function fetchSummary() {
  loading.value = true
  error.value = ''

  try {
    const [incomeData, runningData] = await Promise.all([
      getIncomeSummary(),
      getMyOrders({ status: 'running', page: 1, size: 10 })
    ])
    summary.totalIncome = incomeData?.totalIncome || 0
    summary.completedOrderCount = incomeData?.completedOrderCount || 0
    runningOrderCount.value = runningData?.total ?? runningData?.records?.length ?? 0
  } catch (err) {
    error.value = err.message || '统计加载失败'
  } finally {
    loading.value = false
  }
}

function handleLogout() {
  authStore.logout()
  router.replace('/login')
}

onMounted(fetchSummary)
</script>
