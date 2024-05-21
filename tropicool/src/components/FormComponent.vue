<template>
  <form @submit.prevent="handleSubmit">
    <div v-for="(field, index) in fields" :key="index">
      <label :for="field.name">{{ field.label }}</label>
      <input
        :type="field.type"
        :name="field.name"
        v-model="formData[field.name]"
        :required="field.required"
      />
      <span v-if="errors[field.name]">{{ errors[field.name] }}</span>
    </div>
    <button type="submit">{{ submitButtonText }}</button>
  </form>
</template>

<script setup>
import { reactive, defineProps, defineEmits } from 'vue';

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

const formData = reactive({});
const errors = reactive({});

props.fields.forEach((field) => {
  formData[field.name] = '';
});

const handleSubmit = () => {
  const validationErrors = validateForm();
  if (Object.keys(validationErrors).length === 0) {
    if (props.onSubmit && typeof props.onSubmit === 'function') {
      props.onSubmit(formData);
    } else {
      emit('submit', formData);
    }
  } else {
    Object.assign(errors, validationErrors);
  }
};

const validateForm = () => {
  const validationErrors = {};
  props.fields.forEach((field) => {
    if (field.required && !formData[field.name]) {
      validationErrors[field.name] = `${field.label} is required`;
    }
  });
  return validationErrors;
};
</script>
