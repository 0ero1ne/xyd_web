<template>
  <main class="auth-page">
    <section class="auth-copy">
      <p class="eyebrow">PILOT ACCESS</p>
      <h1>注册飞手账号，进入任务大厅。</h1>
      <p>账号创建成功后会保存登录态，并直接进入 Web 端任务工作台。</p>
    </section>

    <section class="auth-card">
      <div class="form-heading">
        <span>注册</span>
        <RouterLink to="/login">已有账号</RouterLink>
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
          {{ submitting ? '注册中...' : '注册并进入' }}
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PhUserPlus } from '@phosphor-icons/vue'
import { register } from '../api/auth'
import { useAuthStore } from '../stores/auth'

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
