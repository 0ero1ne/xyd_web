<template>
  <AppShell>
    <header class="page-header">
      <div>
        <p class="eyebrow">PROFILE</p>
        <h1>我的页面</h1>
        <p>查看飞手账号和累计作业收入。</p>
      </div>
    </header>

    <section class="profile-grid">
      <article class="profile-card">
        <div class="avatar">{{ displayName.slice(0, 1) }}</div>
        <div>
          <h2>{{ displayName }}</h2>
          <p>{{ userInfo?.phone || '手机号未填写' }}</p>
          <span>无人机飞手</span>
        </div>
      </article>

      <article class="stat-card">
        <span>累计收入</span>
        <strong>{{ money(summary.totalIncome) }}</strong>
      </article>

      <article class="stat-card">
        <span>已完成订单数</span>
        <strong>{{ summary.completedOrderCount || 0 }}</strong>
      </article>
    </section>

    <p v-if="loading" class="notice">正在加载收入统计...</p>
    <p v-else-if="error" class="notice error">{{ error }}</p>

    <button class="danger-button logout-button" type="button" @click="handleLogout">
      <PhSignOut :size="19" />
      退出登录
    </button>
  </AppShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhSignOut } from '@phosphor-icons/vue'
import AppShell from '../components/AppShell.vue'
import { getIncomeSummary } from '../api/order'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(true)
const error = ref('')
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
    const data = await getIncomeSummary()
    summary.totalIncome = data?.totalIncome || 0
    summary.completedOrderCount = data?.completedOrderCount || 0
  } catch (err) {
    error.value = err.message || '收入统计加载失败'
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
