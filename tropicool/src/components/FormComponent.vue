<template>
  <form @submit.prevent="handleSubmit">
    <div v-for="(field, index) in fields" :key="index" class="mb-4">
      <label :for="field.name" class="block text-white mb-1">{{ field.label }}</label>
      <input
        :type="field.type"
        :name="field.name"
        v-model="formData[field.name]"
        :required="field.required"
        class="w-full px-3 py-2 border border-gray-300 rounded"
      />
      <span v-if="errors[field.name]" class="text-red-500">{{ errors[field.name] }}</span>
    </div>
    <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
      {{ submitButtonText }}
    </button>
  </form>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import { useFormValidation } from '../composables/useFormValidation';

const props = defineProps({
  fields: {
    type: Array,
    required: true,
  },
  submitButtonText: {
    type: String,
    default: 'Submit',
  },
  onSubmit: {
    type: Function,
    required: false,
  },
});

const emit = defineEmits(['submit']);
const { formData, errors, validateForm, resetErrors } = useFormValidation(props.fields);

const handleSubmit = () => {
  resetErrors();
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length === 0) {
    if (props.onSubmit && typeof props.onSubmit === 'function') {
      props.onSubmit(formData);
    } else {
      emit('submit', formData);
    }
  }
};
</script>

<style scoped>
input {
  transition: border-color 0.2s;
}

input:focus {
  border-color: #007bff;
  outline: none;
}

button {
  transition: background-color 0.2s;
}

button:hover {
  background-color: #0056b3;
}
</style>
