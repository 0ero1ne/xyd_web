<template>
  <Transition name="toast">
    <div v-if="message" class="toast" :class="type">
      {{ message }}
    </div>
  </Transition>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info'
  }
})
</script>
