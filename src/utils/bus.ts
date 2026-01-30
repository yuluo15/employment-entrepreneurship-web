import type { RouteLocationNormalizedLoaded } from 'vue-router'

type EventPayloads = {
  ROUTE_CHANGE: RouteLocationNormalizedLoaded
}

type EventName = keyof EventPayloads
type EventListener<K extends EventName> = (payload: EventPayloads[K]) => void

class EventBus {
  private store = new Map<EventName, Set<EventListener<EventName>>>()

  /** 为事件添加监听器 */
  on<K extends EventName>(name: K, listener: EventListener<K>): void {
    if (!this.store.get(name)) {
      this.store.set(name, new Set())
    }
    this.store.get(name)!.add(listener as EventListener<EventName>)
  }

  /** 移除监听器，listener 不传则移除该事件的所有监听器 */
  off<K extends EventName>(name: K, listener?: EventListener<K>): void {
    if (listener) {
      const list = this.store.get(name)
      list?.delete(listener as EventListener<EventName>)
      if (list?.size === 0) {
        this.store.delete(name)
      }
      return
    }
    this.store.delete(name)
  }

  /** 触发事件 */
  emit<K extends EventName>(name: K, payload: EventPayloads[K]): void {
    const list = this.store.get(name)
    if (!list?.size) return
    list.forEach(listener => {
      try {
        ;(listener as EventListener<K>)(payload)
      } catch (error) {
        console.error(`执行【${name}】的监听器时发生错误`, error)
      }
    })
  }
}

export default new EventBus()

