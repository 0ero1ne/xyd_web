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
        <p class="eyebrow">PILOT DISPATCH</p>
        <h1>连接附近植保任务，管理你的飞手作业。</h1>
        <p>云航植保 Web 工作台支持任务查看、接单、订单管理与作业收入统计。</p>
      </div>

      <div class="auth-proof">
        <span>农业无人机</span>
        <span>任务调度</span>
        <span>收入统计</span>
      </div>

      <div class="auth-metrics" aria-label="平台能力">
        <div>
          <span>附近任务</span>
          <strong>实时推荐</strong>
        </div>
        <div>
          <span>快速接单</span>
          <strong>一键确认</strong>
        </div>
        <div>
          <span>作业收入</span>
          <strong>清晰统计</strong>
        </div>
      </div>
    </section>

    <section class="auth-card">
      <div class="form-heading auth-form-heading">
        <div>
          <span>欢迎回来</span>
          <p>登录云航植保飞手工作台</p>
        </div>
        <RouterLink to="/register">创建账号</RouterLink>
      </div>

      <form @submit.prevent="handleSubmit">
        <label>
          用户名或手机号
          <input v-model.trim="form.account" autocomplete="username" placeholder="张三或13800000000" />
        </label>

        <label>
          密码
          <input v-model="form.password" autocomplete="current-password" type="password" placeholder="请输入密码" />
        </label>

        <p v-if="error" class="form-error">{{ error }}</p>

        <button class="primary-button" type="submit" :disabled="submitting">
          <PhSignIn :size="19" />
          {{ submitting ? '登录中...' : '登录' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhSignIn } from '@phosphor-icons/vue'
import { login } from '../api/auth'
import { useAuthStore } from '../stores/auth'
import logoUrl from '../assets/logo.svg'

const router = useRouter()
const authStore = useAuthStore()
const submitting = ref(false)
const error = ref('')

const form = reactive({
  account: '',
  password: ''
})

async function handleSubmit() {
  if (submitting.value) return

  error.value = ''

  if (!form.account || !form.password) {
    error.value = '请填写账号和密码'
    return
  }

  submitting.value = true

  try {
    const data = await login(form)
    authStore.setSession(data)
    router.replace('/tasks')
  } catch (err) {
    error.value = err.message || '登录失败'
  } finally {
    submitting.value = false
  }
}
</script>
