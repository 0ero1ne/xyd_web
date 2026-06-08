<template>
  <div class="app-shell">
    <aside class="sidebar">
      <RouterLink class="brand" to="/tasks">
        <span class="brand-mark">
          <img :src="logoUrl" alt="云航植保" />
        </span>
        <span>
          <strong>云航植保</strong>
          <small>飞手作业工作台</small>
        </span>
      </RouterLink>

      <div class="sidebar-section">
        <span>调度中心</span>
        <nav class="nav-list" aria-label="主导航">
          <RouterLink to="/tasks">
            <PhMapTrifold :size="20" />
            <span>任务大厅</span>
          </RouterLink>
          <RouterLink to="/orders">
            <PhClipboardText :size="20" />
            <span>我的订单</span>
          </RouterLink>
          <RouterLink to="/profile">
            <PhUserCircle :size="20" />
            <span>我的页面</span>
          </RouterLink>
        </nav>
      </div>

      <div class="sidebar-card">
        <span>平台状态</span>
        <strong>在线接单中</strong>
        <p>系统将优先展示距离近、收益明确、资料完整的植保任务。</p>
      </div>
    </aside>

    <main class="main-panel">
      <slot />
    </main>
  </div>
</template>

<script setup>
import { PhClipboardText, PhMapTrifold, PhUserCircle } from '@phosphor-icons/vue'
import logoUrl from '../assets/logo.svg'
</script>
