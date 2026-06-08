<template>
  <main class="auth-page">
    <section class="auth-copy">
      <p class="eyebrow">PLANE WEB</p>
      <h1>把附近的植保任务接到手边。</h1>
      <p>Web 版飞手工作台用于查看推荐任务、接单、管理订单和核对收入。</p>
    </section>

    <section class="auth-card">
      <div class="form-heading">
        <span>登录</span>
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
