<template>
    <li>
        <div class="block w-full bg-slate-50 hover:bg-slate-100 p-4">
            <div class="grid grid-cols-1 gap-4">
                <img
                    class="w-full h-full aspect-square" 
                    :src="imgUrl" 
                    :alt="`Produits dans la catégorie ${name} tropicool`"
                >
                <div>
                    <router-link 
                        :to="url"
                        class="text-white inline-block bg-main hover:bg-secondary px-4 py-2 rounded-sm"
                        >
                        {{ name }}
                    </router-link>
                </div>
            </div>
        </div>
    </li>
</template>

<script setup lang="ts">
    import { defineProps } from 'vue';

    defineProps({
        name: {
            type : String,
            required : true
        },
        url: {
            type : String,
            required : true
        },
        imgUrl: {
            type : String,
            required : true
        },
    });
</script>

<style>
</style>