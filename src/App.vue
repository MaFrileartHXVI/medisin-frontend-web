<template>
  <router-view />
</template>

<script setup>
// Main App Component
</script>

<style>
/* Global App Styles */
* {
  box-sizing: border-box;
}

.text-gradient {
  background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.bg-gradient-primary {
  background: linear-gradient(135deg, #0284c7 0%, #0d9488 100%);
}

.shadow-soft {
  box-shadow: 0 4px 20px -2px rgba(15, 23, 42, 0.08);
}

.border-subtle {
  border: 1px solid #e2e8f0;
}

.rounded-xl {
  border-radius: 14px;
}
</style>

