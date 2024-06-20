<template>
    <div class="max-h-[500px]">
        <table class="w-full text-left overflow-auto">
            <thead>
                <tr>
                    <DashboardTableHead 
                        v-for="(column, index) in columns"
                        :key="index"
                        :column="column"
                    />
                </tr>
            </thead>
            <tbody>
                <tr v-for="data in datas" :key="data.id"
                    class="hover:bg-slate-200 even:bg-slate-100"
                >                
                    <td
                        v-for="(column, index) in columns"
                        :key="index"
                        class="py-2 px-4 text-base text-black"
                    >
                        <template v-if="column.key !== 'actions'">
                            <template v-if="isBoolean(data[column.key])">
                                {{ data[column.key] ? 'Vrai' : 'Faux' }}
                            </template>
                            <template v-else-if="column.key === 'id'">
                                <span :title="data[column.key]">{{ data[column.key].substring(0, 8) }}</span>
                            </template>
                            <template v-else-if="column.key === 'createdAt' || column.key === 'updatedAt'">
                                {{ formatDateTime(data[column.key]) }}
                            </template>
                            <template v-else>
                                {{ data[column.key] }}
                            </template>
                        </template>
                        <template v-else>
                            <div class="grid grid-cols-2 gap-4">
                                <router-link
                                    :to="{ name: EditLink, params: { id: data.id } }" 
                                    class="p-4 bg-blue-500 hover:bg-blue-800 rounded-md flex flex-col justify-center items-center"
                                >
                                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M0.895998 6.68001L3.15749 9.058L0 10L0.895998 6.68001ZM6.10249 1.20602L8.36349 3.58351L3.38299 8.82L1.1215 6.44301L6.10249 1.20602ZM7.82099 0.174018L9.30898 1.73852C9.71248 2.16251 9.35198 2.54501 9.35198 2.54501L8.59149 3.34501L6.32949 0.966517L7.08999 0.167018L7.09999 0.157518C7.15949 0.101518 7.48749 -0.176481 7.82099 0.174018Z" fill="white"/>
                                    </svg>
                                </router-link>
                                <router-link 
                                    :to="{ name: DeleteLink, params: { id: data.id } }" 
                                    class="p-4 bg-red-500 hover:bg-red-800 rounded-md flex flex-col justify-center items-center">
                                    <svg width="8" height="10" viewBox="0 0 8 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M7.77778 0.555556H5.83333L5.27778 0H2.5L1.94444 0.555556H0V1.66667H7.77778M0.555556 8.88889C0.555556 9.18357 0.672619 9.46619 0.880992 9.67456C1.08937 9.88294 1.37198 10 1.66667 10H6.11111C6.4058 10 6.68841 9.88294 6.89678 9.67456C7.10516 9.46619 7.22222 9.18357 7.22222 8.88889V2.22222H0.555556V8.88889Z" fill="white"/>
                                    </svg>
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
    import { defineProps } from 'vue';
    import DashboardTableHead from '../components/DashboardTableHead.vue';

    interface TableProps {
        datas: Array<Record<string, any>>;
        columns: Array<{ key: string; label: string }>;
        EditLink: string;
        DeleteLink: string;
    }

    const props = defineProps<TableProps>();

    const isBoolean = (value: any): boolean => {
        return Object.prototype.toString.call(value) === '[object Boolean]';
    };

    const formatDateTime = (dateTimeString: string): string => {
        const date = new Date(dateTimeString);
        const formattedDate = date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric'});
        const formattedTime = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return `${formattedDate} à ${formattedTime}`;
    };
</script>

<style scoped>
/* Add any required styles here */
</style>