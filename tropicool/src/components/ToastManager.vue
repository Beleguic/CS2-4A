<template>
  <div>
    <Toast
      v-for="toast in toasts"
      :key="toast.id"
      :message="toast.message"
      :type="toast.type"
      @close="removeToast(toast.id)"
    />
  </div>
</template>

<script>
import Toast from './Toast.vue';

export default {
  components: {
    Toast
  },
  data() {
    return {
      toasts: []
    };
  },
  methods: {
    addToast(message, type) {
      this.toasts.push({ message, type, id: Date.now() });
    },
    removeToast(id) {
      this.toasts = this.toasts.filter(toast => toast.id !== id);
    }
  }
};
</script>

<style scoped>
</style>
