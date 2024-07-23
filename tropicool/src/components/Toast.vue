<template>
  <div v-if="visible" :class="toastClasses" class="fixed bottom-5 left-5 p-4 rounded shadow-lg transition-transform transform z-50">
    {{ message }}
    <button @click="hideToast" class="ml-4 text-black font-bold">X</button>
  </div>
</template>

<script>
export default {
  props: {
    message: String,
    type: {
      type: String,
      default: 'info'
    }
  },
  data() {
    return {
      visible: true
    };
  },
  computed: {
    toastClasses() {
      return {
        'bg-green-500 text-white': this.type === 'success',
        'bg-red-500 text-white': this.type === 'error',
        'bg-blue-500 text-white': this.type === 'info'
      };
    }
  },
  methods: {
    hideToast() {
      this.visible = false;
    }
  },
  mounted() {
    setTimeout(this.hideToast, 5000); // Cache le toast après 5 secondes
  }
};
</script>

<style scoped>
</style>
