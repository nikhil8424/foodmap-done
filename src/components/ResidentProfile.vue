<script setup>
import { ref } from 'vue'

const props = defineProps({
  user: Object,
  currentRole: String
})

const emit = defineEmits(['navigate', 'action', 'role-switch'])

const notificationsEnabled = ref(true)

function navigateTo(route, payload = null) {
  emit('navigate', route, payload)
}

function handleLogout() {
  emit('action', { action: 'toast', payload: { message: 'Logged out successfully' } })
  emit('navigate', 'welcome')
}
</script>

<template>
  <div class="component-root w-full min-h-screen bg-background text-on-surface">
    <!-- Left Navigation Sidebar -->
    <aside class="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col border-r border-outline-variant/30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div class="p-stack-lg flex items-center gap-base">
        <button @click="navigateTo('food_radar')" class="flex items-center gap-base text-left cursor-pointer">
          <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <span class="material-symbols-outlined text-on-primary">map</span>
          </div>
          <span class="font-headline-lg text-title-md tracking-tight text-primary font-bold">FoodMap</span>
        </button>
      </div>

      <nav class="flex-1 px-base space-y-stack-sm mt-2">
        <button
          @click="navigateTo('food_radar')"
          class="w-full flex items-center px-gutter py-stack-md rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer font-medium"
        >
          <span class="material-symbols-outlined mr-gutter">home</span>
          <span class="font-label-md">Home</span>
        </button>
        <button
          @click="navigateTo('food_radar')"
          class="w-full flex items-center px-gutter py-stack-md rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer font-medium"
        >
          <span class="material-symbols-outlined mr-gutter">explore</span>
          <span class="font-label-md">Explore Radar</span>
        </button>
        <button
          @click="navigateTo('order_status')"
          class="w-full flex items-center px-gutter py-stack-md rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer font-medium"
        >
          <span class="material-symbols-outlined mr-gutter">receipt_long</span>
          <span class="font-label-md">Orders</span>
        </button>
        <button
          @click="navigateTo('resident_profile')"
          class="w-full flex items-center px-gutter py-stack-md rounded-lg transition-all bg-primary text-on-primary font-bold shadow-sm cursor-pointer"
        >
          <span class="material-symbols-outlined mr-gutter">person</span>
          <span class="font-label-md">Profile</span>
        </button>
      </nav>

      <div class="px-base py-stack-lg border-t border-outline-variant/20 space-y-stack-sm">
        <button
          @click="handleLogout"
          class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-outline-variant/30 text-on-surface-variant hover:text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-[16px]">logout</span>
          <span>Log Out / Switch Account</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="pl-72">
      <!-- Header -->
      <header class="fixed top-0 left-72 right-0 h-20 bg-surface/90 backdrop-blur-md z-40 flex items-center px-container-margin justify-between border-b border-outline-variant/20">
        <div class="flex items-center gap-4">
          <button
            @click="navigateTo('food_radar')"
            class="flex items-center gap-2 text-on-surface hover:text-primary transition-colors bg-surface-container px-4 py-2 rounded-full font-label-md font-semibold text-xs cursor-pointer shadow-sm"
          >
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Radar</span>
          </button>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">Resident Account</span>
        </div>
      </header>

      <main class="relative pt-20 min-h-screen bg-background">
        <div class="max-w-4xl mx-auto px-container-margin py-stack-lg flex flex-col gap-section-gap">
          
          <!-- Profile Header Section -->
          <section class="flex flex-col md:flex-row items-center md:items-end gap-stack-lg w-full bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20 shadow-sm">
            <div class="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden shadow-md ring-4 ring-surface flex-shrink-0 relative">
              <img
                alt="Nikhil Profile"
                class="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-X2N_MBx3jeZoXjVwqr2YHzWOXb-McFnW5_Tul40mZAa9NuirSD7OKBkkDU56xzennrxI3Xgv-sO-QsSTQzj2Bgea6r41SOJqbrH8gWm8zMup3uMuMaG28Z-fGLLlliOALyrH-YnA9TWnRinucPUDxqCgeWLoi3BEPWE8u7Fh4xXAmbxwgcOfwpER6x1vM3SR1jywAKX3fBJaC48BfJ_cwOyEuMuIbtahE2gMi3BEM_m8HL3TAKHU"
              />
            </div>
            <div class="flex flex-col items-center md:items-start text-center md:text-left flex-grow gap-1">
              <div class="flex items-center gap-2 text-primary font-label-sm text-xs font-bold uppercase tracking-wider">
                <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                FoodMap Verified Resident
              </div>
              <h2 class="font-display-lg text-title-md font-bold text-on-surface">{{ props.user?.name || 'Nikhil' }}</h2>
              <div class="flex items-center gap-3 text-xs text-on-surface-variant mt-1">
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">call</span>
                  +91 98201 45892
                </span>
                <span>•</span>
                <span class="flex items-center gap-1">
                  <span class="material-symbols-outlined text-[16px]">location_on</span>
                  Bhandup West, Mumbai
                </span>
              </div>
            </div>
            <div class="px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200 text-xs font-semibold flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">verified</span>
              <span>Active Resident</span>
            </div>
          </section>

          <!-- Stats Grid -->
          <section class="grid grid-cols-2 md:grid-cols-4 gap-gutter w-full">
            <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
              <span class="text-xs text-on-surface-variant uppercase font-semibold">Active Orders</span>
              <p class="font-headline-lg text-2xl font-bold text-primary mt-2">1</p>
            </div>
            <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
              <span class="text-xs text-on-surface-variant uppercase font-semibold">Completed</span>
              <p class="font-headline-lg text-2xl font-bold text-on-surface mt-2">12</p>
            </div>
            <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
              <span class="text-xs text-on-surface-variant uppercase font-semibold">Kitchens Visited</span>
              <p class="font-headline-lg text-2xl font-bold text-on-surface mt-2">8</p>
            </div>
            <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex flex-col justify-between">
              <span class="text-xs text-on-surface-variant uppercase font-semibold">Vouches Given</span>
              <p class="font-headline-lg text-2xl font-bold text-on-surface mt-2">5</p>
            </div>
          </section>

          <!-- Recent Orders & Preferences -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
            <!-- Left: Orders -->
            <div class="lg:col-span-7 flex flex-col gap-4">
              <h3 class="font-title-md font-bold text-on-surface text-base flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">receipt_long</span>
                <span>Active & Recent Orders</span>
              </h3>

              <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-title-md font-bold text-on-surface text-sm">Authentic Rajma Chawal</h4>
                    <span class="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">Ready</span>
                  </div>
                  <p class="text-xs text-on-surface-variant mt-0.5">Anjali's Kitchen • 2 portions • ₹195</p>
                </div>
                <button
                  @click="navigateTo('order_status')"
                  class="px-3.5 py-1.5 bg-primary text-on-primary font-label-md text-xs font-bold rounded-lg hover:bg-primary/90 transition-all cursor-pointer"
                >
                  Track Order
                </button>
              </div>

              <div class="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/20 flex items-center justify-between opacity-80">
                <div>
                  <div class="flex items-center gap-2">
                    <h4 class="font-title-md font-bold text-on-surface text-sm">Spicy Garlic Noodles</h4>
                    <span class="px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant text-[10px]">Delivered</span>
                  </div>
                  <p class="text-xs text-on-surface-variant mt-0.5">Corner Stall • 1 portion • ₹120</p>
                </div>
                <button
                  @click="navigateTo('food_radar')"
                  class="px-3.5 py-1.5 bg-surface text-on-surface border border-outline-variant font-label-md text-xs font-semibold rounded-lg hover:bg-surface-container transition-all cursor-pointer"
                >
                  Reorder
                </button>
              </div>
            </div>

            <!-- Right: Settings & Vouches -->
            <div class="lg:col-span-5 flex flex-col gap-4">
              <h3 class="font-title-md font-bold text-on-surface text-base flex items-center gap-2">
                <span class="material-symbols-outlined text-primary">star</span>
                <span>Vouched Kitchens</span>
              </h3>

              <div
                @click="navigateTo('vendor_profile')"
                class="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm border border-outline-variant/20 flex items-center justify-between cursor-pointer hover:border-primary/40 transition-colors"
              >
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">AK</div>
                  <div>
                    <h4 class="font-label-md font-bold text-on-surface text-xs">Anjali's Kitchen</h4>
                    <span class="text-[11px] text-on-surface-variant">North Indian Home Cook • 4.9 ★</span>
                  </div>
                </div>
                <span class="material-symbols-outlined text-primary text-[18px]">chevron_right</span>
              </div>

              <!-- Preferences Box -->
              <div class="bg-surface-container-low rounded-xl p-4 border border-outline-variant/20 space-y-3">
                <span class="font-label-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant">Preferences</span>
                
                <div class="flex items-center justify-between text-xs">
                  <span class="text-on-surface font-medium">Radar Distance Limit</span>
                  <span class="font-bold text-primary">500 meters</span>
                </div>
                <div class="flex items-center justify-between text-xs">
                  <span class="text-on-surface font-medium">Order Notifications</span>
                  <input type="checkbox" v-model="notificationsEnabled" class="accent-primary w-4 h-4 cursor-pointer" />
                </div>
              </div>

              <!-- Logout Button -->
              <button
                @click="handleLogout"
                class="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-outline-variant text-red-600 font-label-md text-xs font-bold hover:bg-red-50 transition-colors cursor-pointer"
              >
                <span class="material-symbols-outlined text-[16px]">logout</span>
                <span>Log Out</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  </div>
</template>
