<template>
  <div class="device">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "taskroad",
  data() {
    return {
      com: "build"
    };
  },
}
</script>