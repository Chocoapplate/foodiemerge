<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<Props>()
const emit = defineEmits(['clickCard'])

// 加载图片资源
const modules = import.meta.glob('../assets/Icons/*.png', {
  as: 'url',
  import: 'default',
  eager: true,
})

// 创建从卡片类型数字到图标名称的映射
const ICON_MAPPING: Record<number, string> = {
  1: 'icons8-kawaii-bread-50',
  2: 'icons8-kawaii-cupcake-50',
  3: 'icons8-kawaii-pizza-50',
  4: 'icons8-kawaii-ice-cream-50',
  5: 'icons8-kawaii-coffee-50',
  6: 'icons8-kawaii-sushi-50',
  7: 'icons8-kawaii-taco-50',
  8: 'icons8-kawaii-french-fries-50',
  9: 'icons8-kawaii-egg-50',
  10: 'icons8-kawaii-soda-50',
  11: 'icons8-kawaii-steak-50',
  12: 'icons8-apple-pie-50',
  13: 'icons8-merry-pie-50',
  14: 'icons8-pretzel-50',
  15: 'icons8-baguette-50'
}

const IMG_MAP = Object.keys(modules).reduce((acc, cur) => {
  const key = cur.replace('../assets/Icons/', '').replace('.png', '')
  acc[key] = modules[cur]
  return acc
}, {} as Record<string, string>)

interface Props {
  node: CardNode
  isDock?: boolean
}
const isFreeze = computed(() => {
  return props.node.parents.length > 0 ? props.node.parents.some(o => o.state < 2) : false
},
)

function handleClick() {
  if (!isFreeze.value)
    emit('clickCard', props.node)
}
</script>

<template>
  <div
    class="card"
    :style="isDock ? {} : { position: 'absolute', zIndex: node.zIndex, top: `${node.top}px`, left: `${node.left}px` }"
    @click="handleClick"
  >
    <!-- {{ node.zIndex }}-{{ node.type }} -->
    <!-- {{ node.id }} -->
    <img :src="IMG_MAP[ICON_MAPPING[node.type]]" width="40" height="40" :alt="`${ICON_MAPPING[node.type]}`">
    <div v-if="isFreeze" class="mask" />
  </div>
</template>

<style scoped>
.card {
  width: 40px;
  height: 40px;
  background: linear-gradient(145deg, #FFFFFF, #F0F8FF);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-radius: 12px;
  border: 2px solid #FFB6C1;
  box-shadow: 
    0 4px 8px rgba(0,0,0,0.15),
    0 2px 4px rgba(0,0,0,0.1),
    inset 0 1px 0 rgba(255,255,255,0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.card:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 6px 16px rgba(0,0,0,0.2),
    0 3px 6px rgba(0,0,0,0.15),
    inset 0 1px 0 rgba(255,255,255,0.9);
  border-color: #FF69B4;
}

.card:active {
  transform: translateY(0) scale(1.02);
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.2),
    inset 0 2px 4px rgba(0,0,0,0.1);
}

img {
  border-radius: 8px;
  width: 36px;
  height: 36px;
  object-fit: contain;
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
}

.mask {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.4), 
    rgba(100, 100, 100, 0.5));
  width: 40px;
  height: 40px;
  pointer-events: none;
  border-radius: 12px;
  backdrop-filter: blur(2px);
}
</style>
