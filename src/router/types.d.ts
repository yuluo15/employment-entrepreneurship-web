import type { Component } from 'vue'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    hidden?: boolean
    affix?: boolean
    icon?: Component
    role?: import('./menu').UserRole
  }
}


