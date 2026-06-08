<template>
  <main class="auth-page">
    <section class="auth-copy">
      <RouterLink class="auth-brand" to="/login">
        <span class="auth-logo">
          <img :src="logoUrl" alt="云航植保" />
        </span>
        <span>
          <strong>云航植保</strong>
          <small>飞手 Web 工作台</small>
        </span>
      </RouterLink>

      <div class="auth-copy-main">
        <p class="eyebrow">PILOT ACCESS</p>
        <h1>创建飞手账号，进入植保任务调度网络。</h1>
        <p>注册后可进入 Web 工作台，查看附近任务、管理订单，并追踪你的作业收入。</p>
      </div>

      <div class="auth-proof">
        <span>农业无人机</span>
        <span>任务调度</span>
        <span>收入统计</span>
      </div>

      <div class="auth-metrics" aria-label="平台能力">
        <div>
          <span>身份角色</span>
          <strong>飞手 pilot</strong>
        </div>
        <div>
          <span>登录状态</span>
          <strong>Web 存储</strong>
        </div>
        <div>
          <span>订单收益</span>
          <strong>持续追踪</strong>
        </div>
      </div>
    </section>

    <section class="auth-card">
      <div class="form-heading auth-form-heading">
        <div>
          <span>创建账号</span>
          <p>注册云航植保飞手工作台</p>
        </div>
        <RouterLink to="/login">返回登录</RouterLink>
      </div>

      <form @submit.prevent="handleSubmit">
        <label>
          用户名称
          <input v-model.trim="form.username" autocomplete="name" placeholder="张三" />
        </label>

        <label>
          手机号码
          <input v-model.trim="form.phone" autocomplete="tel" placeholder="13800000000" />
        </label>

        <label>
          密码
          <input v-model="form.password" autocomplete="new-password" type="password" placeholder="至少 6 位" />
        </label>

        <p v-if="error" class="form-error">{{ error }}</p>

        <button class="primary-button" type="submit" :disabled="submitting">
          <PhUserPlus :size="19" />
          {{ submitting ? '注册中...' : '创建飞手账号' }}
        </button>
      </form>

      <p class="auth-switch">已有账号？<RouterLink to="/login">返回登录</RouterLink></p>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhUserPlus } from '@phosphor-icons/vue'
import { register } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import logoUrl from '../assets/logo.svg'

const router = useRouter()
const authStore = useAuthStore()
const submitting = ref(false)
const error = ref('')

const form = reactive({
  username: '',
  phone: '',
  password: ''
})

async function handleSubmit() {
  if (submitting.value) return

  error.value = ''

  if (!form.username || !form.phone || !form.password) {
    error.value = '请完整填写注册信息'
    return
  }

  submitting.value = true

  try {
    const data = await register(form)
    authStore.setSession(data)
    router.replace('/tasks')
  } catch (err) {
    error.value = err.message || '注册失败'
  } finally {
    submitting.value = false
  }
}
</script>
