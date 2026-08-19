<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from './stores/authStore.js'
import { useFoodStore } from './stores/foodStore.js'
import { useOrderStore } from './stores/orderStore.js'
import { useVendorStore } from './stores/vendorStore.js'
import { getSocket } from './services/socket.js'

// Import all FoodMap screen components
import Welcome_to_FoodMap from './components/Welcome_to_FoodMap.vue'
import FoodRadar from './components/FoodRadar.vue'
import FoodDetails from './components/FoodDetails.vue'
import Checkout from './components/Checkout.vue'
import OrderConfirmation from './components/OrderConfirmation.vue'
import OrderStatus from './components/OrderStatus.vue'
import OrderPickup from './components/OrderPickup.vue'
import OrderCompleted from './components/OrderCompleted.vue'
import ResidentProfile from './components/ResidentProfile.vue'
import VendorDashboard from './components/VendorDashboard.vue'
import PostNewFood from './components/PostNewFood.vue'
import YouAreLive from './components/YouAreLive.vue'
import NewOrder from './components/NewOrder.vue'
import VendorOrderConfirmed from './components/VendorOrderConfirmed.vue'
import VendorProfile from './components/VendorProfile.vue'
import EditVendorProfile from './components/EditVendorProfile.vue'
import RoleSelection from './components/RoleSelection.vue'
import OTPVerification from './components/OTPVerification.vue'

const authStore = useAuthStore()
const foodStore = useFoodStore()
const orderStore = useOrderStore()
const vendorStore = useVendorStore()

// Screens registry
const screenComponents = {
  welcome: Welcome_to_FoodMap,
  food_radar: FoodRadar,
  food_details: FoodDetails,
  checkout: Checkout,
  order_confirmation: OrderConfirmation,
  order_status: OrderStatus,
  order_pickup: OrderPickup,
  order_completed: OrderCompleted,
  resident_profile: ResidentProfile,
  vendor_dashboard: VendorDashboard,
  post_new_food: PostNewFood,
  you_are_live: YouAreLive,
  new_order: NewOrder,
  vendor_order_confirmed: VendorOrderConfirmed,
  vendor_profile: VendorProfile,
  edit_vendor_profile: EditVendorProfile,
  role_selection: RoleSelection,
  otp_verification: OTPVerification,
}

// Navigation state
const currentScreenId = ref('welcome')
const navigationHistory = ref(['welcome'])

const currentScreen = computed(() => {
  return screenComponents[currentScreenId.value] || Welcome_to_FoodMap
})

const currentUser = computed(() => authStore.user)
const currentRole = computed(() => authStore.currentRole)
const selectedFood = computed(() => foodStore.selectedFood || foodStore.foods[0])
const currentOrder = computed(() => orderStore.currentOrder)

const toastMessage = ref('')
const isToastVisible = ref(false)
let toastTimer = null

function showToast(msg) {
  toastMessage.value = msg
  isToastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    isToastVisible.value = false
  }, 2800)
}

function navigateTo(target, payload = null) {
  if (!target) return
  let targetId = target

  if (targetId.startsWith('applet:')) {
    targetId = targetId.replace('applet:', '')
  }

  // Handle aliases
  if (targetId === 'food_radar' || targetId === 'explore') targetId = 'food_radar'
  if (targetId === 'dashboard') targetId = 'vendor_dashboard'
  if (targetId === 'post_food') targetId = 'post_new_food'
  if (targetId === 'profile') targetId = currentRole.value === 'vendor' ? 'vendor_profile' : 'resident_profile'

  if (payload) {
    if (targetId === 'food_details' || payload.price !== undefined) {
      foodStore.selectFood(payload)
    }
    if (payload.orderNumber || payload.totalAmount || payload.item) {
      orderStore.currentOrder = { ...orderStore.currentOrder, ...payload }
    }
    if (payload.role) {
      authStore.setRole(payload.role)
    }
  }

  if (screenComponents[targetId]) {
    currentScreenId.value = targetId
    navigationHistory.value.push(targetId)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function handleAction(event) {
  if (!event) return
  const { action, payload } = event

  if (action === 'toast') {
    showToast(payload?.message || 'Updated successfully')
  } else if (action === 'set-role') {
    authStore.setRole(payload?.role || 'resident')
    showToast(`Switched to ${authStore.currentRole} mode`)
  } else if (action === 'create-order') {
    orderStore.placeOrder(payload)
    showToast('Order placed! Notifying kitchen...')
  } else if (action === 'update-order-status') {
    orderStore.updateStatus(payload?.id || orderStore.currentOrder?._id, payload?.status)
    showToast(`Order status updated to ${payload?.status}`)
  } else if (action === 'post-food') {
    foodStore.addFood(payload)
    showToast('Food is now LIVE on FoodMap radar!')
  }
}

function handleRoleSwitch(role) {
  authStore.setRole(role)
  showToast(`Active mode: ${role === 'vendor' ? 'Kitchen Vendor' : 'Local Resident'}`)
  if (role === 'vendor') {
    navigateTo('vendor_dashboard')
  } else {
    navigateTo('food_radar')
  }
}

onMounted(async () => {
  // Initialize Socket.IO connection & Pinia store sync
  getSocket()
  foodStore.fetchFoods()
  orderStore.fetchOrders()
  vendorStore.fetchVendors()
})
</script>

<template>
  <div id="foodmap-app" class="relative min-h-screen bg-background font-body antialiased selection:bg-primary/20 selection:text-primary">
    <!-- Main Dynamic Screen -->
    <component
      :is="currentScreen"
      :user="currentUser"
      :current-role="currentRole"
      :food="selectedFood"
      :order="currentOrder"
      @navigate="navigateTo"
      @action="handleAction"
      @role-switch="handleRoleSwitch"
    />

    <!-- Real-time Toast Notifications -->
    <transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-4 opacity-0 scale-95"
      enter-to-class="translate-y-0 opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="isToastVisible"
        id="toast-notification"
        class="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 bg-on-surface text-surface rounded-2xl shadow-xl border border-white/10 text-xs font-semibold max-w-sm w-full mx-4"
      >
        <span class="material-symbols-outlined text-[20px] text-primary">info</span>
        <span class="flex-1">{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>
