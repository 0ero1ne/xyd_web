<template>
  <div class="app-shell">
    <aside class="sidebar">
      <RouterLink class="brand" to="/tasks">
        <span class="brand-mark">YH</span>
        <span>
          <strong>云航植保</strong>
          <small>飞手工作台</small>
        </span>
      </RouterLink>

      <nav class="nav-list" aria-label="主导航">
        <RouterLink to="/tasks">
          <PhMapTrifold :size="20" />
          任务大厅
        </RouterLink>
        <RouterLink to="/orders">
          <PhClipboardText :size="20" />
          我的订单
        </RouterLink>
        <RouterLink to="/profile">
          <PhUserCircle :size="20" />
          我的页面
        </RouterLink>
      </nav>
    </aside>

    <main class="main-panel">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { PhClipboardText, PhMapTrifold, PhUserCircle } from '@phosphor-icons/vue'
</script>
