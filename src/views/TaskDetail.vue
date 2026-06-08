<template>
  <AppShell>
    <button class="back-button" type="button" @click="router.back()">
      <PhArrowLeft :size="18" />
      返回任务大厅
    </button>

    <section v-if="loading" class="detail-layout">
      <article class="detail-card skeleton-detail">
        <span />
        <strong />
        <p />
        <p />
        <p />
      </article>
      <aside class="detail-side skeleton-detail">
        <span />
        <strong />
        <p />
      </aside>
    </section>

    <p v-else-if="error" class="notice error">{{ error }}</p>

    <section v-else-if="task" class="detail-layout">
      <article class="detail-card">
        <div class="detail-hero">
          <div>
            <p class="eyebrow">TASK DETAIL</p>
            <h1>{{ task.taskTitle || '任务详情' }}</h1>
            <p>{{ task.locationName || '地点待确认' }}</p>
          </div>
          <div class="tag-row">
            <span v-for="tag in task.tags || []" :key="tag">{{ tag }}</span>
            <span v-if="!(task.tags || []).length">无标签</span>
          </div>
        </div>

        <section class="detail-section">
          <div class="section-heading">
            <span>01</span>
            <h2>基础信息</h2>
          </div>
          <div class="detail-grid">
            <InfoItem label="详细地址" :value="task.detailAddress" />
            <InfoItem label="作业面积" :value="`${task.areaMu || 0} 亩`" />
            <InfoItem label="距离" :value="`${task.distanceKm || 0} km`" />
            <InfoItem label="作物类型" :value="task.cropType" />
            <InfoItem label="服务类型" :value="task.serviceType" />
            <InfoItem label="截止时间" :value="formatTime(task.deadlineTime)" />
          </div>
        </section>

        <section class="detail-section">
          <div class="section-heading">
            <span>02</span>
            <h2>作业要求</h2>
          </div>
          <div class="detail-grid">
            <InfoItem label="电池要求" :value="`${task.requiredBatteryCount || 0} 组`" />
            <InfoItem label="药剂名称" :value="task.pesticideName" />
            <InfoItem label="药剂用量" :value="task.pesticideDosage" />
            <InfoItem label="联系人" :value="task.contactName" />
            <InfoItem label="联系电话" :value="task.contactPhone" />
          </div>
        </section>

        <section class="description-block">
          <div class="section-heading">
            <span>03</span>
            <h2>任务说明</h2>
          </div>
          <p>{{ task.description || '暂无任务说明' }}</p>
        </section>
      </article>

      <aside class="detail-side">
        <div class="income-block">
          <span>预估收入</span>
          <strong>{{ money(task.expectedIncome) }}</strong>
          <small>最终收入以后端订单结算为准</small>
        </div>

        <div class="status-card">
          <span>任务状态</span>
          <strong>{{ task.statusLabel || '待接单' }}</strong>
          <p>{{ acceptReason }}</p>
        </div>

        <button class="primary-button detail-action" type="button" :disabled="submitting || task.status !== 1" @click="handleAccept">
          <PhCheckCircle :size="19" />
          {{ submitting ? '接单中...' : task.status === 1 ? '确认接单' : '当前不可接单' }}
        </button>
      </aside>
    </section>

    <FeedbackToast :message="toast.message" :type="toast.type" />
  </AppShell>
</template>

<script setup>
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PhArrowLeft, PhCheckCircle } from '@phosphor-icons/vue'
import AppShell from '../components/AppShell.vue'
import FeedbackToast from '../components/FeedbackToast.vue'
import { acceptTask } from '../api/order'
import { getTaskDetail } from '../api/task'

const InfoItem = defineComponent({
  props: {
    label: String,
    value: [String, Number]
  },
  setup(props) {
    return () => h('div', { class: 'info-item' }, [
      h('span', props.label),
      h('strong', props.value || '待确认')
    ])
  }
})

const route = useRoute()
const router = useRouter()
const task = ref(null)
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const toast = reactive({
  message: '',
  type: 'info'
})

const acceptReason = computed(() => {
  if (!task.value) return ''
  if (task.value.status === 1) return '资料完整，当前飞手可确认接单。'
  return task.value.statusLabel ? `当前状态为“${task.value.statusLabel}”，不可重复接单。` : '任务当前状态不可接单。'
})

function money(value) {
  return `¥${Number(value || 0).toLocaleString()}`
}

function formatTime(value) {
  if (!value) return '待确认'
  return String(value).replace('T', ' ').slice(0, 16)
}

function showToast(message, type = 'info') {
  toast.message = message
  toast.type = type
  window.setTimeout(() => {
    toast.message = ''
  }, 2400)
}

async function fetchDetail() {
  loading.value = true
  error.value = ''

  try {
    task.value = await getTaskDetail(route.params.id)
  } catch (err) {
    error.value = err.message || '任务详情加载失败'
  } finally {
    loading.value = false
  }
}

async function handleAccept() {
  if (submitting.value || !task.value || task.value.status !== 1) return

  submitting.value = true

  try {
    await acceptTask(task.value.id)
    showToast('接单成功', 'success')
    router.replace('/orders')
  } catch (err) {
    showToast(err.message || '接单失败', 'error')
  } finally {
    submitting.value = false
  }
}

onMounted(fetchDetail)
</script>
