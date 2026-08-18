<script setup>
import { ref } from 'vue'
import { foodApi } from '../services/api.js'

const props = defineProps({
  user: Object,
  currentRole: String
})

const emit = defineEmits(['navigate', 'action', 'role-switch'])

// Reactive Form State
const itemName = ref('Authentic Punjabi Rajma Chawal')
const itemPrice = ref(120)
const itemQty = ref(8)
const readyTime = ref('Now')
const itemCategory = ref('Main Course')
const itemDesc = ref('Homestyle slow-cooked organic kidney beans with aromatic jeera rice and authentic spices.')
const itemImage = ref('https://lh3.googleusercontent.com/aida-public/AB6AXuCF6NYjSXc9OspeP1pnTa_kDRcVFJ-6X_jzTTn2Nci-S0z_hZVs5kCYDgif_ukgkwzadu-7R6AutYiubrr4IPxt0FhAXzBXRCwb1euPR188gbVknZXweaixA_2UX5B_uYvk0CxgqJZlSpUtFG5WP5VvBj7uIfUZjPZYmV8o-BXbdqZYya_1ssmnACluTiKD01J13jhxmYCqaM_n8cOKDiC9ga1u0nFKyZjvf7bta75t0orS-GYTzk7U')
const isPosting = ref(false)

const readyTimeOptions = ['Now', '15 min', '30 min', '45 min']

function navigateTo(route, payload = null) {
  emit('navigate', route, payload)
}

async function handlePost() {
  if (!itemName.value || !itemPrice.value || !itemQty.value) {
    emit('action', { action: 'toast', payload: { message: 'Please fill in all required fields' } })
    return
  }

  isPosting.value = true
  try {
    const payload = {
      name: itemName.value,
      description: itemDesc.value,
      price: itemPrice.value,
      quantity: itemQty.value,
      initialQuantity: itemQty.value,
      cookingStatus: readyTime.value === 'Now' ? 'Ready now' : `Ready in ${readyTime.value}`,
      category: itemCategory.value,
      image: itemImage.value,
      vendorName: props.user?.name || "Anjali's Kitchen",
      vendorLocation: {
        type: 'Point',
        coordinates: [72.9348, 19.1462] // Bhandup West coordinates
      }
    }

    const res = await foodApi.createFood(payload)
    isPosting.value = false

    if (res?.food) {
      emit('action', {
        action: 'toast',
        payload: { message: `🎉 ${res.food.name} is now live on the neighborhood radar!` }
      })
      emit('navigate', 'you_are_live', { food: res.food })
    }
  } catch (err) {
    isPosting.value = false
    console.error('Error posting new food:', err)
    emit('action', {
      action: 'toast',
      payload: { message: err.response?.data?.error || 'Failed to publish food to radar' }
    })
  }
}
</script>

<template>
  <div class="component-root w-full min-h-screen bg-background text-on-surface">
    <!-- Left Navigation Sidebar -->
    <aside class="fixed left-0 top-0 h-full w-72 bg-surface-container-low z-50 flex flex-col border-r border-outline-variant/30 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div class="p-stack-lg flex items-center gap-base">
        <button @click="navigateTo('vendor_dashboard')" class="flex items-center gap-base text-left cursor-pointer">
          <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <span class="material-symbols-outlined text-on-primary">soup_kitchen</span>
          </div>
          <div class="flex flex-col">
            <span class="font-headline-lg text-title-md tracking-tight text-primary font-bold">FoodMap</span>
            <span class="text-[10px] text-on-surface-variant uppercase tracking-wider font-semibold">Vendor Portal</span>
          </div>
        </button>
      </div>

      <nav class="flex-1 px-base space-y-stack-sm mt-2">
        <button
          @click="navigateTo('vendor_dashboard')"
          class="w-full flex items-center px-gutter py-stack-md rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer font-medium"
        >
          <span class="material-symbols-outlined mr-gutter">dashboard</span>
          <span class="font-label-md">Kitchen Hub</span>
        </button>
        <button
          @click="navigateTo('post_new_food')"
          class="w-full flex items-center px-gutter py-stack-md rounded-lg transition-all bg-primary text-on-primary font-bold shadow-sm cursor-pointer"
        >
          <span class="material-symbols-outlined mr-gutter">add_circle</span>
          <span class="font-label-md">Post New Food</span>
        </button>
        <button
          @click="navigateTo('new_order')"
          class="w-full flex items-center px-gutter py-stack-md rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer font-medium"
        >
          <span class="material-symbols-outlined mr-gutter">notifications_active</span>
          <span class="font-label-md">Live Orders</span>
        </button>
        <button
          @click="navigateTo('vendor_profile')"
          class="w-full flex items-center px-gutter py-stack-md rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all cursor-pointer font-medium"
        >
          <span class="material-symbols-outlined mr-gutter">storefront</span>
          <span class="font-label-md">Kitchen Profile</span>
        </button>
      </nav>

      <div class="px-base py-stack-lg border-t border-outline-variant/20 space-y-stack-sm">
        <button
          @click="navigateTo('vendor_profile')"
          class="w-full flex items-center gap-gutter px-gutter py-stack-md rounded-xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary/40 transition-colors text-left cursor-pointer"
        >
          <div class="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            A
          </div>
          <div class="flex flex-col">
            <span class="font-label-md text-on-surface leading-none text-xs font-bold">Anjali's Kitchen</span>
            <span class="text-[10px] text-on-surface-variant uppercase tracking-wider mt-0.5">Home Chef</span>
          </div>
        </button>

        <button
          @click="navigateTo('welcome')"
          class="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-on-surface-variant hover:text-on-surface hover:bg-surface-container text-xs font-medium transition-colors cursor-pointer"
        >
          <span class="material-symbols-outlined text-[16px]">logout</span>
          <span>Switch Account</span>
        </button>
      </div>
    </aside>

    <!-- Content Area -->
    <div class="pl-72">
      <!-- Header -->
      <header class="fixed top-0 left-72 right-0 h-20 bg-surface/90 backdrop-blur-md z-40 flex items-center px-container-margin justify-between border-b border-outline-variant/20">
        <div class="flex items-center gap-4">
          <button
            @click="navigateTo('vendor_dashboard')"
            class="flex items-center gap-2 text-on-surface hover:text-primary transition-colors bg-surface-container px-4 py-2 rounded-full font-label-md font-semibold text-xs cursor-pointer shadow-sm"
          >
            <span class="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Kitchen Hub</span>
          </button>
        </div>
        <div class="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
          <span class="material-symbols-outlined text-[16px]">broadcast_on_home</span>
          <span>Live Radar Broadcasting</span>
        </div>
      </header>

      <main class="relative pt-20 min-h-screen bg-background">
        <div class="flex flex-col w-full h-full max-w-2xl mx-auto px-container-margin py-6 pb-section-gap">
          
          <!-- Dish Photo Upload / Preview -->
          <div
            @click="emit('action', { action: 'toast', payload: { message: 'Image loaded from kitchen library' } })"
            class="relative w-full aspect-video md:aspect-[21/9] bg-surface-container rounded-2xl overflow-hidden mb-6 cursor-pointer group shadow-sm border border-outline-variant/20 hover:border-primary/40 transition-all"
          >
            <div
              class="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-95 transition-opacity"
              :style="{ backgroundImage: `url('${itemImage}')` }"
            ></div>
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4">
              <span class="text-white font-bold text-sm">Dish Preview Image</span>
              <span class="text-white/80 text-xs">High-resolution photo captured fresh from stove</span>
            </div>
          </div>

          <!-- Listing Form -->
          <form @submit.prevent="handlePost" class="space-y-5 flex-1 flex flex-col">
            <div class="space-y-4">
              <div class="flex flex-col">
                <label class="text-xs font-bold text-on-surface mb-1 uppercase tracking-wider" for="item-name">
                  What are you cooking? *
                </label>
                <input
                  v-model="itemName"
                  required
                  class="w-full bg-surface text-on-surface text-base focus:outline-none focus:ring-2 focus:ring-primary rounded-xl p-3.5 shadow-sm border border-outline-variant/30 font-bold"
                  id="item-name"
                  placeholder="e.g., Authentic Punjabi Rajma Chawal"
                  type="text"
                />
              </div>

              <div class="flex flex-col">
                <label class="text-xs font-bold text-on-surface mb-1 uppercase tracking-wider" for="item-desc">
                  Short Description
                </label>
                <textarea
                  v-model="itemDesc"
                  rows="2"
                  class="w-full bg-surface text-on-surface text-xs focus:outline-none focus:ring-2 focus:ring-primary rounded-xl p-3 shadow-sm border border-outline-variant/30 font-medium resize-none"
                  id="item-desc"
                  placeholder="Homestyle spices, fresh ingredients..."
                ></textarea>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="flex flex-col">
                  <label class="text-xs font-bold text-on-surface mb-1 uppercase tracking-wider" for="item-price">
                    Price Per Portion (₹) *
                  </label>
                  <div class="relative">
                    <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-on-surface-variant font-bold">₹</span>
                    <input
                      v-model.number="itemPrice"
                      required
                      min="10"
                      class="w-full bg-surface text-on-surface text-sm pl-8 pr-3 py-3 focus:outline-none focus:ring-2 focus:ring-primary rounded-xl shadow-sm border border-outline-variant/30 font-black"
                      id="item-price"
                      type="number"
                    />
                  </div>
                </div>

                <div class="flex flex-col">
                  <label class="text-xs font-bold text-on-surface mb-1 uppercase tracking-wider" for="item-qty">
                    Batch Portions *
                  </label>
                  <div class="relative">
                    <input
                      v-model.number="itemQty"
                      required
                      min="1"
                      class="w-full bg-surface text-on-surface text-sm px-3.5 py-3 focus:outline-none focus:ring-2 focus:ring-primary rounded-xl shadow-sm border border-outline-variant/30 font-black"
                      id="item-qty"
                      type="number"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Ready Time Selector -->
            <div class="space-y-1.5">
              <label class="text-xs font-bold text-on-surface uppercase tracking-wider block">Estimated Readiness</label>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="opt in readyTimeOptions"
                  :key="opt"
                  type="button"
                  @click="readyTime = opt"
                  :class="readyTime === opt ? 'bg-primary text-on-primary font-bold shadow-md' : 'bg-surface text-on-surface border border-outline-variant hover:bg-surface-container'"
                  class="py-2.5 rounded-xl text-xs transition-all cursor-pointer"
                >
                  {{ opt }}
                </button>
              </div>
            </div>

            <!-- Location -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold text-on-surface uppercase tracking-wider">Broadcast Radius & Location</label>
                <span class="text-[11px] text-green-700 font-semibold">500m Live Radius</span>
              </div>
              <div class="flex items-center bg-surface p-3.5 rounded-xl shadow-sm gap-3 border border-outline-variant/20">
                <div class="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[20px]">location_on</span>
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <span class="text-xs font-bold text-on-surface">Bhandup West, Mumbai</span>
                  <span class="text-[10px] text-on-surface-variant">Coordinates: [72.9348, 19.1462] • Atlas Geospatial 2dsphere</span>
                </div>
              </div>
            </div>

            <!-- Submit CTA -->
            <div class="mt-auto pt-4">
              <button
                :disabled="isPosting"
                class="w-full bg-primary hover:bg-primary/90 text-on-primary text-sm py-3.5 rounded-xl shadow-lg transition-transform active:scale-[0.98] flex items-center justify-center gap-2 font-bold cursor-pointer disabled:opacity-50"
                type="submit"
              >
                <span v-if="!isPosting" class="flex items-center gap-2">
                  <span>Publish to Neighborhood Radar</span>
                  <span class="material-symbols-outlined text-[18px]">sensors</span>
                </span>
                <span v-else class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                  <span>Publishing & Notifying Neighbors...</span>
                </span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  </div>
</template>
