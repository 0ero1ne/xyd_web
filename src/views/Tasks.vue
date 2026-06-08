<template>
  <AppShell>
    <header class="page-header workbench-hero">
      <div>
        <p class="eyebrow">TASK DISPATCH</p>
        <h1>任务大厅</h1>
        <p>查看当前可接的农业无人机植保任务，按作物、服务类型、距离和预估收入快速筛选，优先处理更适合当前作业半径的订单。</p>
      </div>
      <button class="ghost-button" type="button" :disabled="loading" @click="fetchTasks">
        <PhArrowClockwise :size="18" />
        {{ loading ? '刷新中' : '刷新任务' }}
      </button>
    </header>

    <section class="overview-grid">
      <article class="stat-card highlight">
        <span>可接任务</span>
        <strong>{{ tasks.length }}</strong>
        <small>当前推荐池</small>
      </article>
      <article class="stat-card">
        <span>最高预估收入</span>
        <strong>{{ money(summary.maxIncome) }}</strong>
        <small>单笔任务</small>
      </article>
      <article class="stat-card">
        <span>最近距离</span>
        <strong>{{ summary.nearestDistance }} km</strong>
        <small>作业半径</small>
      </article>
      <article class="stat-card">
        <span>总面积</span>
        <strong>{{ summary.totalArea }} 亩</strong>
        <small>待作业田块</small>
      </article>
    </section>

    <section class="filter-panel" aria-label="任务筛选">
      <label>
        作物类型
        <select v-model="filters.crop">
          <option value="">全部作物</option>
          <option v-for="crop in cropOptions" :key="crop" :value="crop">{{ crop }}</option>
        </select>
      </label>
      <label>
        服务类型
        <select v-model="filters.service">
          <option value="">全部服务</option>
          <option v-for="service in serviceOptions" :key="service" :value="service">{{ service }}</option>
        </select>
      </label>
      <label>
        收入排序
        <select v-model="filters.incomeSort">
          <option value="">默认</option>
          <option value="desc">收入从高到低</option>
          <option value="asc">收入从低到高</option>
        </select>
      </label>
      <label>
        距离排序
        <select v-model="filters.distanceSort">
          <option value="">默认</option>
          <option value="asc">距离从近到远</option>
          <option value="desc">距离从远到近</option>
        </select>
      </label>
    </section>

    <section v-if="loading" class="task-grid">
      <article v-for="item in 6" :key="item" class="task-card skeleton-card">
        <span />
        <strong />
        <p />
        <p />
      </article>
    </section>

    <p v-else-if="error" class="notice error">{{ error }}</p>

    <EmptyState
      v-else-if="filteredTasks.length === 0"
      title="暂无匹配任务"
      description="可以调整筛选条件，或稍后刷新任务大厅查看新的植保需求。"
    />

    <section v-else class="task-grid">
      <article v-for="task in filteredTasks" :key="task.id" class="task-card task-card-pro">
        <div class="card-topline">
          <span class="badge badge-status">{{ task.statusLabel || '待接单' }}</span>
          <strong>{{ money(task.expectedIncome) }}</strong>
        </div>

        <div>
          <h2>{{ task.taskTitle || '未命名任务' }}</h2>
          <p class="muted">{{ task.locationName || '地点待确认' }}</p>
        </div>

        <div class="metric-row metric-grid task-metrics">
          <span>{{ task.areaMu || 0 }} 亩</span>
          <span>{{ task.distanceKm || 0 }} km</span>
        </div>

        <div class="task-badge-row">
          <span class="badge badge-crop">{{ task.cropType || '作物待定' }}</span>
          <span class="badge badge-service">{{ task.serviceType || '服务待定' }}</span>
        </div>

        <div class="tag-row">
          <span v-for="tag in task.tags || []" :key="tag" class="badge" :class="tagClass(tag)">{{ tag }}</span>
          <span v-if="!(task.tags || []).length" class="badge badge-condition">资料完整度待确认</span>
        </div>

        <RouterLink class="secondary-button card-action" :to="`/tasks/${task.id}`">
          查看详情
          <PhArrowRight :size="18" />
        </RouterLink>
      </article>
    </section>
  </AppShell>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { PhArrowClockwise, PhArrowRight } from '@phosphor-icons/vue'
import AppShell from '../components/AppShell.vue'
import EmptyState from '../components/EmptyState.vue'
import { getRecommendTasks } from '../api/task'

const tasks = ref([])
const loading = ref(true)
const error = ref('')
const filters = reactive({
  crop: '',
  service: '',
  incomeSort: '',
  distanceSort: ''
})

const cropOptions = computed(() => uniqueOptions('cropType'))
const serviceOptions = computed(() => uniqueOptions('serviceType'))

const summary = computed(() => {
  const incomes = tasks.value.map((task) => Number(task.expectedIncome || 0))
  const distances = tasks.value.map((task) => Number(task.distanceKm || 0)).filter((value) => value > 0)
  const totalArea = tasks.value.reduce((sum, task) => sum + Number(task.areaMu || 0), 0)

  return {
    maxIncome: incomes.length ? Math.max(...incomes) : 0,
    nearestDistance: distances.length ? Math.min(...distances).toFixed(1) : '0.0',
    totalArea: Number(totalArea.toFixed(1))
  }
})

const filteredTasks = computed(() => {
  const result = tasks.value
    .filter((task) => !filters.crop || task.cropType === filters.crop)
    .filter((task) => !filters.service || task.serviceType === filters.service)

  if (filters.incomeSort) {
    result.sort((a, b) => {
      const diff = Number(a.expectedIncome || 0) - Number(b.expectedIncome || 0)
      return filters.incomeSort === 'asc' ? diff : -diff
    })
  }

  if (filters.distanceSort) {
    result.sort((a, b) => {
      const diff = Number(a.distanceKm || 0) - Number(b.distanceKm || 0)
      return filters.distanceSort === 'asc' ? diff : -diff
    })
  }

  return result
})

function uniqueOptions(key) {
  return [...new Set(tasks.value.map((task) => task[key]).filter(Boolean))]
}

function money(value) {
  return `¥${Number(value || 0).toLocaleString()}`
}

function tagClass(tag) {
  const text = String(tag || '')

  if (text.includes('电池') || text.includes('今日') || text.includes('距离') || text.includes('可飞')) {
    return 'badge-condition'
  }

  if (text.includes('喷') || text.includes('防') || text.includes('除') || text.includes('播')) {
    return 'badge-service'
  }

  return 'badge-crop'
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
