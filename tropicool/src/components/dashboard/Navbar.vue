<template>
    <header class="top-0 left-0 sticky w-full flex justify-between py-4 px-6 border-b border-b-gray-200 items-center bg-white">
        <div class="max-w-3xl w-full">
            <form action="" method="get" class="flex">
                <input 
                    type="search"
                    name="search"
                    required
                    placeholder="Search ..."
                    class="bg-white text-black w-full border border-gray-200 border-r-0 px-4 py-2">
                <button 
                    type="submit"
                    class="w-1/12 flex items-center justify-center rounded-tr-full rounded-br-full py-2 pr-2 border border-gray-200 bg-gray-100 hover:bg-gray-200">
                    <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5.94286 0.5C7.519 0.5 9.03059 1.12612 10.1451 2.24062C11.2596 3.35512 11.8857 4.86671 11.8857 6.44286C11.8857 7.91486 11.3463 9.268 10.4594 10.3103L10.7063 10.5571H11.4286L16 15.1286L14.6286 16.5L10.0571 11.9286V11.2063L9.81029 10.9594C8.73176 11.8796 7.36059 12.3853 5.94286 12.3857C4.36671 12.3857 2.85512 11.7596 1.74062 10.6451C0.62612 9.53059 0 8.019 0 6.44286C0 4.86671 0.62612 3.35512 1.74062 2.24062C2.85512 1.12612 4.36671 0.5 5.94286 0.5ZM5.94286 2.32857C3.65714 2.32857 1.82857 4.15714 1.82857 6.44286C1.82857 8.72857 3.65714 10.5571 5.94286 10.5571C8.22857 10.5571 10.0571 8.72857 10.0571 6.44286C10.0571 4.15714 8.22857 2.32857 5.94286 2.32857Z" fill="black"/>
                    </svg>
                </button>
            </form>
        </div>
        <div class="relative">
            <button 
                @click="toggleMenu"
                class="group  rounded-md flex items-center gap-4 px-4 py-2"
                :class="[isMenuVisible ? 'bg-secondary hover:bg-main' : 'bg-main hover:bg-secondary']"
                >
                <div>
                    <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8.66992 0.5C9.73079 0.5 10.7482 0.921427 11.4983 1.67157C12.2485 2.42172 12.6699 3.43913 12.6699 4.5C12.6699 5.56087 12.2485 6.57828 11.4983 7.32843C10.7482 8.07857 9.73079 8.5 8.66992 8.5C7.60906 8.5 6.59164 8.07857 5.84149 7.32843C5.09135 6.57828 4.66992 5.56087 4.66992 4.5C4.66992 3.43913 5.09135 2.42172 5.84149 1.67157C6.59164 0.921427 7.60906 0.5 8.66992 0.5ZM8.66992 10.5C13.0899 10.5 16.6699 12.29 16.6699 14.5V16.5H0.669922V14.5C0.669922 12.29 4.24992 10.5 8.66992 10.5Z" fill="white"/>
                    </svg>
                </div>
                <span>Account</span>
                <div 
                    class="transition-all"
                    :class="[isMenuVisible ? 'rotate-180 group-hover:rotate-0' : 'group-hover:rotate-180']"
                    >
                    <svg width="11" height="7" viewBox="0 0 11 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0.669922 0.9175L5.83492 6.0825L10.9999 0.9175H0.669922Z" fill="white"/>
                    </svg>
                </div>
            </button>
            <ul v-if="isMenuVisible" class="mt-2 py-2 flex flex-col gap-2 border border-gray-200 z-50 absolute bg-white w-full rounded-md">
                <li v-for="(route, index) in routes" :key="index">
                    <router-link 
                        :to="route.path" 
                        class="inline-block px-4 py-2 text-black hover:bg-main hover:text-white w-full"
                        >
                        <div class="flex gap-4 items-center">
                            <span v-html="route.icon" class="w-full max-w-5"></span>
                            <span>{{ route.text }}</span>
                        </div>
                    </router-link>
                </li>
            </ul>
        </div>
    </header>
</template>

<script setup>
    import { ref } from 'vue';
    
    const routes = [
        { path: "/profile/", text: "Profile",  icon: "<svg width='17' height='17' viewBox='0 0 17 17' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M8.66992 0.5C9.73079 0.5 10.7482 0.921427 11.4983 1.67157C12.2485 2.42172 12.6699 3.43913 12.6699 4.5C12.6699 5.56087 12.2485 6.57828 11.4983 7.32843C10.7482 8.07857 9.73079 8.5 8.66992 8.5C7.60906 8.5 6.59164 8.07857 5.84149 7.32843C5.09135 6.57828 4.66992 5.56087 4.66992 4.5C4.66992 3.43913 5.09135 2.42172 5.84149 1.67157C6.59164 0.921427 7.60906 0.5 8.66992 0.5ZM8.66992 10.5C13.0899 10.5 16.6699 12.29 16.6699 14.5V16.5H0.669922V14.5C0.669922 12.29 4.24992 10.5 8.66992 10.5Z' fill='currentColor'/></svg>"},
        { path: "/logout", text: "Logout",  icon: "<svg width='20' height='19' viewBox='0 0 20 19' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M15 4.5L13.59 5.91L16.17 8.5H6V10.5H16.17L13.59 13.08L15 14.5L20 9.5M2 2.5H10V0.5H2C0.9 0.5 0 1.4 0 2.5V16.5C0 17.6 0.9 18.5 2 18.5H10V16.5H2V2.5Z' fill='currentColor'/></svg>"},
    ];

    const isMenuVisible = ref(false);

    const toggleMenu = () => {
        isMenuVisible.value = !isMenuVisible.value;
    };
</script>

<style>
</style>