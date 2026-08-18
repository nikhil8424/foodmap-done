<script setup>
import { ref, computed } from 'vue'

// Import all FoodMap cards/screens
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
  otp_verification: OTPVerification
}

// Global App State
const currentScreenId = ref('welcome')
const navigationHistory = ref(['welcome'])
const currentRole = ref('resident') // 'resident' | 'vendor'
const currentUser = ref({
  name: 'Nikhil',
  phone: '+91 98765 43210',
  location: 'Bhandup West, Mumbai',
  role: 'resident'
})

const selectedFood = ref({
  id: 'rajma-chawal',
  name: 'Authentic Rajma Chawal',
  vendorName: "Anjali's Kitchen",
  price: 80,
  portions: 6,
  time: 'Ready Now',
  distance: '420m away',
  rating: 4.8,
  image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcCn3i8k4gYk-jLV5MXuqSONW-8QpGOpQ4yYcs-5HUarOFUR1kCq3boeWmwl-f7Seo8MV5gGPaYolyo8w_lFVLtdBGN11e9huwwnLqF4wUGtqAbHcuebFi79m5evx_bXkagJMfR6xqZSl0A3UhdKsMtGL_SyAxPz6EhwbTtY7oWANHjY08Msx9WdC5GF0cpXi4h-eS9GA4sfMmh7CCZv7Lu_elTf3lY2oNae4dUF5Fxdr0ktu3Ed5C'
})

const currentOrder = ref({
  id: '#FM1024',
  item: 'Rajma Chawal',
  vendor: "Anjali's Kitchen",
  qty: 2,
  pricePerPortion: 80,
  deliveryFee: 30,
  platformFee: 5,
  total: 195,
  status: 'Preparing',
  pickupLocation: 'Building B, Apt 402, Bhandup West',
  time: '12:45 PM'
})

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
  
  // Normalise target name
  let targetId = target
  if (target === 'home' || target === 'explore') {
    targetId = currentRole.value === 'vendor' ? 'vendor_dashboard' : 'food_radar'
  } else if (target === 'orders' || target === 'my_orders') {
    targetId = currentRole.value === 'vendor' ? 'vendor_order_confirmed' : 'order_status'
  } else if (target === 'profile') {
    targetId = currentRole.value === 'vendor' ? 'vendor_profile' : 'resident_profile'
  } else if (target === 'dashboard' || target === 'vendor_home') {
    targetId = 'vendor_dashboard'
  } else if (target === 'listings') {
    targetId = 'vendor_dashboard'
  } else if (target === 'vendor-orders' || target === 'vendor_orders') {
    targetId = 'vendor_order_confirmed'
  } else if (target === 'back') {
    goBack()
    return
  }

  if (payload) {
    if (payload.food) selectedFood.value = { ...selectedFood.value, ...payload.food }
    if (payload.order) currentOrder.value = { ...currentOrder.value, ...payload.order }
    if (payload.role) {
      currentRole.value = payload.role
      currentUser.value.role = payload.role
    }
  }

  if (screenComponents[targetId]) {
    navigationHistory.value.push(targetId)
    currentScreenId.value = targetId
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

function goBack() {
  if (navigationHistory.value.length > 1) {
    navigationHistory.value.pop()
    currentScreenId.value = navigationHistory.value[navigationHistory.value.length - 1]
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    // Default fallback
    currentScreenId.value = currentRole.value === 'vendor' ? 'vendor_dashboard' : 'food_radar'
  }
}

function handleAuthSuccess(authData) {
  if (authData?.role) {
    currentRole.value = authData.role
    currentUser.value.role = authData.role
  }
  if (authData?.phone) {
    currentUser.value.phone = authData.phone
  }
  
  if (currentRole.value === 'vendor') {
    navigateTo('vendor_dashboard')
  } else {
    navigateTo('food_radar')
  }
  showToast(`Welcome ${currentUser.value.name}! Connected in ${currentRole.value} mode.`)
}

function handleRoleSwitch(newRole) {
  currentRole.value = newRole
  currentUser.value.role = newRole
  if (newRole === 'vendor') {
    navigateTo('vendor_dashboard')
    showToast('Switched to Vendor Mode (Cook & Sell)')
  } else {
    navigateTo('food_radar')
    showToast('Switched to Resident Mode (Explore & Eat)')
  }
}

function handleAction(event) {
  const action = event?.action || event
  const payload = event?.payload || null

  if (action === 'toast') {
    showToast(payload?.message || 'Action completed')
  } else if (action === 'switch-role') {
    handleRoleSwitch(payload?.role || (currentRole.value === 'resident' ? 'vendor' : 'resident'))
  } else if (action === 'call-vendor' || action === 'call') {
    showToast('Connecting call to Anjali (+91 98201 12345)...')
  } else if (action === 'share') {
    showToast('Listing link copied to clipboard!')
  } else if (action === 'save' || action === 'favorite') {
    showToast('Added to your favorite neighborhood kitchens!')
  }
}

const activeComponent = computed(() => {
  return screenComponents[currentScreenId.value] || Welcome_to_FoodMap
})
</script>

<template>
  <div class="app-root relative min-h-screen bg-background text-on-surface">
    <!-- Toast Notification Banner -->
    <Transition name="toast">
      <div
        v-if="isToastVisible"
        class="fixed top-6 left-1/2 -translate-x-1/2 z-[100] bg-inverse-surface text-inverse-on-surface px-5 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-outline-variant/20 font-label-md text-sm backdrop-blur-md"
      >
        <span class="material-symbols-outlined text-primary text-[20px]">info</span>
        <span>{{ toastMessage }}</span>
      </div>
    </Transition>

    <!-- Main View Component Render -->
    <main class="w-full">
      <component
        :is="activeComponent"
        :food="selectedFood"
        :order="currentOrder"
        :user="currentUser"
        :currentRole="currentRole"
        @navigate="navigateTo"
        @action="handleAction"
        @auth-success="handleAuthSuccess"
        @explore-guest="handleAuthSuccess({ role: 'resident' })"
        @role-switch="handleRoleSwitch"
      />
    </main>
  </div>
</template>

<style>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
