import { createApp } from 'vue'
import { createPinia } from 'pinia'
import SakanaElement from 'sakana-element'
import 'sakana-element/dist/index.css'
import './style.css'
import router from './router'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(SakanaElement)
app.mount('#app')
