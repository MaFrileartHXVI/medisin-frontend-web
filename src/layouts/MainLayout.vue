<template>
  <q-layout view="hHh lpR fFf" class="figma-screen-layout">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
// Clean minimal layout matching exact Figma artboards
</script>

<style scoped>
.figma-screen-layout {
  background-color: #0066d6; /* Exact royal blue matching Figma */
  min-height: 100vh;
  width: 100%;
}
</style>
