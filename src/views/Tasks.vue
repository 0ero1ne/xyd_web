<template>
  <AppShell>
    <header class="page-header">
      <div>
        <p class="eyebrow">TASK HALL</p>
        <h1>任务大厅</h1>
        <p>查看当前可接的植保飞防任务，优先处理距离近、收益明确的订单。</p>
      </div>
      <button class="ghost-button" type="button" :disabled="loading" @click="fetchTasks">
        <PhArrowClockwise :size="18" />
        刷新
      </button>
    </header>

    <section v-if="loading" class="task-grid">
      <article v-for="item in 4" :key="item" class="task-card skeleton-card">
        <span />
        <strong />
        <p />
        <p />
      </article>
    </section>

    <p v-else-if="error" class="notice error">{{ error }}</p>

    <EmptyState
      v-else-if="tasks.length === 0"
      title="暂无可接任务"
      description="后端暂未返回推荐任务，可以稍后刷新。"
    />

    <section v-else class="task-grid">
      <article v-for="task in tasks" :key="task.id" class="task-card">
        <div class="card-topline">
          <span>{{ task.statusLabel || '待接单' }}</span>
          <strong>{{ money(task.expectedIncome) }}</strong>
        </div>
        <h2>{{ task.taskTitle || '未命名任务' }}</h2>
        <p class="muted">{{ task.locationName || '地点待确认' }}</p>
        <div class="metric-row">
          <span>{{ task.areaMu || 0 }} 亩</span>
          <span>{{ task.distanceKm || 0 }} km</span>
        </div>
        <div class="tag-row">
          <span v-for="tag in task.tags || []" :key="tag">{{ tag }}</span>
        </div>
        <RouterLink class="secondary-button" :to="`/tasks/${task.id}`">
          查看详情
          <PhArrowRight :size="18" />
        </RouterLink>
      </article>
    </section>
  </AppShell>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { PhArrowClockwise, PhArrowRight } from '@phosphor-icons/vue'
import AppShell from '../components/AppShell.vue'
import EmptyState from '../components/EmptyState.vue'
import { getRecommendTasks } from '../api/task'

const tasks = ref([])
const loading = ref(true)
const error = ref('')

function money(value) {
  return `¥${Number(value || 0).toLocaleString()}`
}

async function fetchTasks() {
  loading.value = true
  error.value = ''

  try {
    const data = await getRecommendTasks()
    tasks.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err.message || '任务加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(fetchTasks)
</script>
