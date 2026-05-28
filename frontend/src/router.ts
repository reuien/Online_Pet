import { createRouter, createWebHistory } from 'vue-router'
import HomeView from './views/HomeView.vue'
import CreatePetView from './views/CreatePetView.vue'
import PetDetailView from './views/PetDetailView.vue'
import LeaderboardView from './views/LeaderboardView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomeView },
    { path: '/create', component: CreatePetView },
    { path: '/pet/:id', component: PetDetailView },
    { path: '/leaderboard', component: LeaderboardView },
  ],
})

export default router
