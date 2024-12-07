<template>
  <div>
    <svg-icon icon-class="github" @click="goto" />
  </div>
</template>

<script setup>
const url = ref('https://gitee.com/starqidian/itbeien-springcloudalibaba-master');

function goto() {
  window.open(url.value)
}
</script>
