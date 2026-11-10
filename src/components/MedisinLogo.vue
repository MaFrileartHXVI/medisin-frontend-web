<template>
  <div class="medisin-logo-wrapper select-none">
    <img
      src="/logo.png"
      alt="Medisin Logo"
      :style="{
        width: typeof width === 'number' ? `${width}px` : width,
        height: height === 'auto' ? 'auto' : (typeof height === 'number' ? `${height}px` : height),
        objectFit: 'contain',
        display: 'block'
      }"
    />
  </div>
</template>

<script setup>
defineProps({
  width: {
    type: [Number, String],
    default: 180,
  },
  height: {
    type: [Number, String],
    default: 'auto',
  },
});
</script>

<style scoped>
.medisin-logo-wrapper {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
