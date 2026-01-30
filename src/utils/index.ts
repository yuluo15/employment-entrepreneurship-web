type DateInput = Date | string | number

/** 格式化日期 */
export const formatDate = (date: DateInput = new Date(), format = 'yyyy-MM-dd HH:mm:ss'): string | number => {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) {
    throw new TypeError('`date` 应是一个有效日期')
  }
  if (['t', 'timestamp'].includes(format.toLowerCase())) return d.getTime()
  const tactics: Record<string, number> = {
    yyyy: d.getFullYear(),
    MM: d.getMonth() + 1,
    dd: d.getDate(),
    HH: d.getHours(),
    mm: d.getMinutes(),
    ss: d.getSeconds(),
  }
  switch (format) {
    case 'date':
      format = 'yyyy-MM-dd'
      break
    case 'time':
      format = 'HH:mm:ss'
      break
    case 'datetime':
      format = 'yyyy-MM-dd HH:mm:ss'
      break
    case 'cdate':
      format = 'yyyy年MM月dd日'
      break
    case 'ctime':
      format = 'HH时mm分ss秒'
      break
    case 'cdatetime':
      format = 'yyyy年MM月dd日 HH时mm分ss秒'
      break
  }
  return format.replace(/(yyyy|MM|dd|HH|mm|ss)/g, token => `${tactics[token]}`.padStart(2, '0'))
}

/** 异步等待指定毫秒数 */
export const delay = (ms = 0): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

/** 设置元素 css 变量 */
export const setCssVar = (el: HTMLElement, key: string, value: string): void => {
  el.style.setProperty(key, value)
}

/** 按比率混合两种颜色，类似 sass 的 mix 函数 */
export const blendColors = (color1: string, color2: string, ratio: number): string => {
  const normalizedRatio = Math.max(0, Math.min(1, ratio))
  const toHex = (value: number) => {
    const hex = value.toString(16)
    return hex.length === 1 ? `0${hex}` : hex
  }
  const calc = (left: number, right: number) =>
    Math.ceil(
      parseInt(color1.substring(left, right), 16) * normalizedRatio +
        parseInt(color2.substring(left, right), 16) * (1 - normalizedRatio),
    )
  const r = calc(1, 3)
  const g = calc(3, 5)
  const b = calc(5, 7)
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}


