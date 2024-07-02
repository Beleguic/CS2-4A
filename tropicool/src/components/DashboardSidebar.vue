<template>
  <aside class="w-full max-w-80 bg-main z-50 p-4 h-full flex-shrink-0 fixed inset-y-0">
    <nav>
      <ul class="mb-8">
        <li>
          <router-link :to="{ name: 'Home' }"
            class="inline-block px-4 py-2 text-white hover:bg-secondary rounded w-full">
            <div class="flex gap-4 items-center">
              <svg width="15" height="16" viewBox="0 0 15 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 16V5.33333L7.11111 0L14.2222 5.33333V16H8.88889V9.77778H5.33333V16H0Z" fill="white" />
              </svg>
              <span>Go to Home</span>
            </div>
          </router-link>
        </li>
      </ul>
      <ul class="flex flex-col gap-4">
        <li v-for="(route, index) in routes" :key="index">
          <router-link :to="{ name: route.path }"
            class="inline-block px-4 py-2 text-white hover:bg-secondary rounded w-full">
            <div class="flex gap-4 items-center">
              <span v-html="route.icon" class="w-full max-w-5"></span>
              <span>{{ route.text }}</span>
            </div>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup lang="ts">
interface Route {
  text: string;
  path: string;
  icon: string;
}

const routes: Route[] = [
    {
      text: "Dashboard",
      path: "DashboardIndex",
      icon: "<svg width='20' height='17' viewBox='0 0 20 17' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M10 6.55808e-06C8.09358 -0.0021776 6.22636 0.541252 4.61885 1.56611C3.01135 2.59098 1.7307 4.05446 0.928169 5.78373C0.125636 7.513 -0.165263 9.43581 0.0898284 11.3251C0.34492 13.2144 1.13535 14.9912 2.36775 16.4457L2.54947 16.6577H17.4505L17.6322 16.4457C18.8647 14.9912 19.6551 13.2144 19.9102 11.3251C20.1653 9.43581 19.8744 7.513 19.0718 5.78373C18.2693 4.05446 16.9887 2.59098 15.3811 1.56611C13.7736 0.541252 11.9064 -0.0021776 10 6.55808e-06ZM15.2093 5.74236L11.6234 9.26168C11.8066 9.64915 11.8471 10.0889 11.7375 10.5033C11.6279 10.9177 11.3753 11.28 11.0244 11.5262C10.6736 11.7724 10.2469 11.8867 9.81998 11.8488C9.39302 11.8109 8.9932 11.6233 8.69118 11.3191C8.38916 11.0149 8.20438 10.6138 8.1695 10.1866C8.13461 9.75938 8.25187 9.33358 8.50054 8.98445C8.74922 8.63532 9.1133 8.38533 9.52846 8.27866C9.94361 8.172 10.3831 8.21552 10.7693 8.40153L14.3492 4.88222L15.2093 5.74236ZM1.27743 9.47974H3.33693V10.6912H1.2532C1.2532 10.455 1.22292 10.2248 1.22292 9.9825C1.22292 9.74021 1.23503 9.64934 1.24715 9.47974H1.27743ZM4.23341 3.4224L5.72352 4.91251L4.83309 5.74842L3.33693 4.26437C3.60605 3.95856 3.89544 3.6712 4.20313 3.40423L4.23341 3.4224ZM10.6057 3.35577H9.39427V1.2357H10C10.2241 1.2357 10.424 1.2357 10.6057 1.26599V3.35577ZM18.7771 9.98856C18.7771 10.2248 18.7771 10.4671 18.7468 10.6973H16.6146V9.4858H18.7529C18.765 9.64934 18.7771 9.81895 18.7771 9.98856Z' fill='white'/></svg>"
    },
    {
      text: "Categories",
      path: "DBCategoryIndex",
      icon: "<svg width='20' height='20' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M3.68421 9L9.47368 0L15.2632 9H3.68421ZM15.2632 20C13.9474 20 12.8291 19.5627 11.9084 18.688C10.9877 17.8133 10.527 16.7507 10.5263 15.5C10.5256 14.2493 10.9863 13.187 11.9084 12.313C12.8305 11.439 13.9488 11.0013 15.2632 11C16.5775 10.9987 17.6961 11.4363 18.6189 12.313C19.5417 13.1897 20.0021 14.252 20 15.5C19.9979 16.748 19.5375 17.8107 18.6189 18.688C17.7003 19.5653 16.5817 20.0027 15.2632 20ZM0 19.5V11.5H8.42105V19.5H0Z' fill='white'/></svg>"
    }
    // Add other routes here
];

</script>

<style scoped>
  .router-link-active,
  .router-link-exact-active {
    background-color: #1D1F96;
  }
</style>
