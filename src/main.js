import { createApp } from 'vue'
import App from './App.vue'
import {createRouter, createWebHistory} from "vue-router"
import './assets/main.css'
import Home from './views/Home.vue'
import Result from './views/Result.vue'


const router = createRouter({
    history: createWebHistory(),
    routes: [
        {path:'/', name: 'Home', component: Home},
        {path:'/results', name: 'Result', component: Result}
    ]
})

createApp(App).use(router).mount('#app')