<template>
  <form @submit.prevent="handleSubmit">
    <div v-for="(groups, divGroups) in fields" :key="divGroups" class="flex flex-col">
      <h2 v-if="groups.header != ''" class="text-2xl font-bold mb-1 text-center text-white">{{ groups.header }}</h2>
      <div v-for="(div, field2) in groups.field" :key="field2" class="flex flex-row -mx-4">
        <div v-for="(field, index) in div" :key="index" class="m-4 w-full">
          <div v-if="field.type == 'select'">
            <label :for="field.name" class="block mb-1" :style="{color: field.color}">{{ field.label }}</label>
            <select
              :name="field.name"
              v-model="localFormData[field.name]"
              :required="field.required"
              :disabled="showEditButton && !editableFields.includes(field.name)"
              class="w-full px-3 py-2 border border-gray-300 rounded"
            >
              <option
                v-for="(option, indexOption) in field.options"
                :key="indexOption"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <span v-if="errors[field.name]" class="text-red-500">{{ errors[field.name] }}</span>
          </div>
          <div v-else-if="field.type == 'multiSelect'">
            <label :for="field.name" class="block mb-1" :style="{color: field.color}">{{ field.label }}</label>
            <select
              :name="field.name"
              v-model="localFormData[field.name]"
              :required="field.required"
              :disabled="showEditButton && !editableFields.includes(field.name)"
              class="w-full px-3 py-2 border border-gray-300 rounded"
              multiple="f"
            >
              <option
                v-for="(option, indexOption) in field.options"
                :key="indexOption"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <span v-if="errors[field.name]" class="text-red-500">{{ errors[field.name] }}</span>
          </div>
          <div v-else-if="field.type == 'textarea'">
            <label :for="field.name" class="block mb-1" :style="{color: field.color}">{{ field.label }}</label>
            <textarea
              :name="field.name"
              v-model="localFormData[field.name]"
              :required="field.required"
              :disabled="showEditButton && !editableFields.includes(field.name)"
              :placeholder="field.placeholder || field.label"
              :style="{resize: field.resize || 'none'}"
              class="w-full px-3 py-2 border border-gray-300 rounded"
            ></textarea>
            <span v-if="errors[field.name]" class="text-red-500">{{ errors[field.name] }}</span>
          </div>
          <div v-else-if="field.type == 'checkbox'" class="flex justify-start items-center">
            <input
              :type="field.type"
              :name="field.name"
              :checked="field.checked !== undefined ? field.checked : false"
              v-model="localFormData[field.name]"
              :required="field.required"
              :disabled="showEditButton && !editableFields.includes(field.name)"
              :placeholder="field.placeholder || field.label"
              :id="field.name"
              class="w-6 h-6 px-3 py-2 border border-gray-300 cursor-pointer"
            />
            <label :for="field.name" class="block mb-1 ml-2 cursor-pointer" :style="{color: field.color}">
              <router-link :to="field.link" class="underline text-blue-500">{{ field.label }}</router-link>
            </label>
            <span v-if="errors[field.name]" class="text-red-500">{{ errors[field.name] }}</span>
          </div>
          <div v-else>
            <label :for="field.name" class="block mb-1" :style="{color: field.color}">{{ field.label }}</label>
            <input
              :type="field.type"
              :name="field.name"
              v-model="localFormData[field.name]"
              :required="field.required"
              :placeholder="field.placeholder || field.label"
              class="w-full px-3 py-2 border border-gray-300 rounded"
            />
            <span v-if="errors[field.name]" class="text-red-500">{{ errors[field.name] }}</span>
          </div>
        </div>
      </div>
    </div>
    <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
      {{ submitButtonText }}
    </button>
  </form>
</template>

<script setup>
import { defineProps, defineEmits, reactive, watch } from 'vue';
import { useFormValidation } from '../composables/useFormValidation';

const props = defineProps({
  fields: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: Object,
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
  showEditButton: {
    type: Boolean,
    default: false,
  },
  editableFields: {
    type: Array,
    default: () => [],
  },
});

console.log('Props received in FormComponent:', props);

const emit = defineEmits(['submit', 'update:modelValue']);

const { formData: localFormData, errors, validateForm, resetErrors } = useFormValidation(props.fields);

watch(
  () => props.modelValue,
  (newVal) => {
    Object.assign(localFormData, newVal);
  },
  { deep: true, immediate: true }
);

watch(
  localFormData,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

const handleSubmit = () => {
  resetErrors();
  const validationErrors = validateForm(localFormData.value);
  if (Object.keys(validationErrors).length === 0) {
    emit('update:modelValue', localFormData);
    if (props.onSubmit && typeof props.onSubmit === 'function') {
      props.onSubmit(localFormData);
    } else {
      emit('submit', localFormData);
    }
  } else {
    // Assign validation errors to errors object
    for (const key in validationErrors) {
      errors[key] = validationErrors[key];
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
