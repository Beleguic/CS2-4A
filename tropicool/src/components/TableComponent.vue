<template>
  <div :style="{ maxWidth: dynamicMaxWidth, maxHeight: dynamicMaxHeight }" class="overflow-auto">
    <table class="w-full text-left table-auto relative">
      <thead class="w-full sticky left-0 top-0">
        <tr>
          <DashboardTableHead v-for="(column, index) in columns" :key="index" :column="column" />
        </tr>
      </thead>
      <tbody ref="tbodyRef">
        <tr v-for="(data, rowIndex) in datas" :key="data.id" :ref="el => trRefs[rowIndex] = el"
          :class="{
            'hover:bg-slate-200 even:bg-slate-100 odd:bg-white relative': true,
            'hovered-row': hoveredRow === rowIndex
          }"
          @mouseover="hoveredRow = rowIndex" @mouseleave="hoveredRow = null">
          <td v-for="(column, index) in columns" :key="index"
            :class="{
              'py-2 px-4 text-base text-black whitespace-nowrap': true,
              'sticky right-0 z-10 custom-bg bg-opacity-80' : column.key === 'actions'
            }" :style="column.key === 'actions' ? { '--custom-bg': getBackgroundColor(rowIndex) } : {}">
            <template v-if="column.key !== 'actions'">
              <template v-if="isBoolean(data[column.key]) && (column.label === 'status' || column.label === 'Status') && column.key === 'is_active'">
                {{ data[column.key] ? 'Activé' : 'Désactivé' }}
              </template>
              <template v-else-if="isBoolean(data[column.key])">
                {{ data[column.key] ? 'Vrai' : 'Faux' }}
              </template>
              <template v-else-if="column.key === 'id'">
                <div class="flex gap-4 group items-center">
                  <span :title="data[column.key]">{{ isString(data[column.key]) ? data[column.key].substring(0, 10) : data[column.key] }}</span>
                  <button v-if="copiedId !== data[column.key]" class="opacity-0 group-hover:opacity-100 flex gap-2 text-black items-center" @click="copyToClipboard(data[column.key])">
                    <component :is="iconCopy" />
                    <span>Copier</span>
                  </button>
                  <span v-else class="flex gap-2 text-black items-center">
                    <component :is="iconCheck" />
                    <span>Copié</span>
                  </span>
                </div>
              </template>
              <template v-else-if="column.label === 'Image'">
                <a :href="data[column.key]" target="_blank" class="flex items-center justify-center p-2 rounded-full hover:bg-main hover:text-white">
                  <component :is="iconEye" class="w-full max-w-6" />
                </a>
              </template>
              <template v-else>
                {{ data[column.key] }}
              </template>
            </template>
            <template v-else>
              <div class="flex items-center gap-4">
              <router-link v-if="newLink" :to="{ name: newLink, params: { id: data.id } }" class="p-4 bg-green-500 hover:bg-green-800 rounded-md flex flex-col justify-center items-center text-white w-16 h-16">
                  <component :is="iconAdd" />
              </router-link>
              <router-link v-if="viewLink" :to="{ name: viewLink, params: { id: data.id } }" class="p-4 bg-yellow-500 hover:bg-yellow-800 rounded-md flex flex-col justify-center items-center text-white w-16 h-16">
                  <component :is="iconEye" />
              </router-link>
                <router-link v-if="editLink" :to="{ name: editLink, params: { id: data.id } }" class="p-4 bg-blue-500 hover:bg-blue-800 rounded-md flex flex-col justify-center items-center text-white w-16 h-16">
                  <component :is="iconPen" />
                </router-link>
                <router-link v-if="deleteLink" :to="{ name: deleteLink, params: { id: data.id } }" class="p-4 bg-red-500 hover:bg-red-800 rounded-md flex flex-col justify-center items-center text-white w-16 h-16">
                  <component :is="iconTrash" />
                </router-link>
                <router-link v-if="graphLink" :to="{ name: graphLink, params: { id: data.id } }" class="p-4 bg-purple-500 hover:bg-purple-800 rounded-md flex flex-col justify-center items-center text-white w-16 h-16">
                  <component :is="iconGraph" />
                </router-link>
              </div>
            </template>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
  import { defineProps, ref, onMounted, onBeforeUnmount, watch } from 'vue';
  import DashboardTableHead from '../components/DashboardTableHead.vue';
  import iconEye from '../assets/icons/eye.svg';
  import iconPen from '../assets/icons/pen.svg';
  import iconTrash from '../assets/icons/trash.svg';
  import iconCopy from '../assets/icons/copy.svg';
  import iconCheck from '../assets/icons/check.svg';
  import iconAdd from '../assets/icons/add.svg';
  import iconGraph from '../assets/icons/analytic.svg';

  interface Column {
    key: string;
    label: string;
  }

  interface TableProps {
    datas: Array<Record<string, any>>;
    columns: Array<Column>;
    editLink: string|null;
    deleteLink: string|null;
    newLink: string|null;
    viewLink: string|null;
    graphLink: string|null;
  }

  const props = defineProps<TableProps>();
  const { datas, columns, editLink, deleteLink, newLink, viewLink } = props;

  const dynamicMaxWidth = ref('calc(100vw - 50px)');
  const dynamicMaxHeight = ref('calc(100vh - 215px)');
  const trRefs = ref<(HTMLElement | any)[]>([]);
  const rowBackgroundColors = ref<string[]>([]);
  const hoveredRow = ref<number | null>(null);
  const copiedId = ref<string | null>(null);

  const updateDimensions = () => {
    const leftPartWidth = 20 * 16;
    dynamicMaxWidth.value = `calc(100vw - ${leftPartWidth}px - 50px)`;
    dynamicMaxHeight.value = `calc(100vh - 215px)`;
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      copiedId.value = text;
      setTimeout(() => {
        copiedId.value = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const getBackgroundColors = () => {
    rowBackgroundColors.value = trRefs.value.map(tr => {
      if (tr) {
        const computedStyle = getComputedStyle(tr);
        const bgColor = computedStyle.backgroundColor;
        const rgba = bgColor.match(/\d+/g);
        return rgba ? `${rgba[0]}, ${rgba[1]}, ${rgba[2]}` : '255, 255, 255';
      }
      return '255, 255, 255';
    });
  };

  const getBackgroundColor = (rowIndex: number) => {
    if (hoveredRow.value === rowIndex) {
      return '200, 200, 200';
    }
    return rowBackgroundColors.value[rowIndex] || '255, 255, 255';
  };

  watch(() => datas, getBackgroundColors, { immediate: true });

  const isBoolean = (value: any): boolean => {
    return typeof value === 'boolean';
  };

  const isString = (value: any): boolean => {
    return typeof value === 'string';
  };

  onMounted(() => {
    window.addEventListener('resize', updateDimensions);
    updateDimensions();
    getBackgroundColors();
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', updateDimensions);
  });
</script>

<style scoped>
  .custom-bg {
    background-color: rgba(var(--custom-bg), var(--tw-bg-opacity));
  }

  .hovered-row {
    background-color: rgba(200, 200, 200, var(--tw-bg-opacity)) !important;
  }
</style>