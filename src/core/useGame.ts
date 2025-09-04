import { ref } from 'vue'
import { ceil, floor, random, shuffle } from 'lodash-es'
const defaultGameConfig: GameConfig = {
  cardNum: 4,
  layerNum: 2,
  trap: true,
  delNode: false,
}

export function useGame(config: GameConfig): Game {
  const { container, delNode, events = {}, ...initConfig } = { ...defaultGameConfig, ...config }
  const histroyList = ref<CardNode[]>([])
  const backFlag = ref(false)
  const removeFlag = ref(false)
  const removeList = ref<CardNode[]>([])
  const preNode = ref<CardNode | null>(null)
  const nodes = ref<CardNode[]>([])
  const indexSet = new Set()
  let perFloorNodes: CardNode[] = []
  const selectedNodes = ref<CardNode[]>([])
  const size = 40
  let floorList: number[][] = []

  function updateState() {
    nodes.value.forEach((o) => {
      o.state = o.parents.every(p => p.state > 0) ? 1 : 0
    })
  }

  function handleSelect(node: CardNode) {
    if (selectedNodes.value.length === 7)
      return
    node.state = 2
    histroyList.value.push(node)
    preNode.value = node
    const index = nodes.value.findIndex(o => o.id === node.id)
    if (index > -1)
      delNode && nodes.value.splice(index, 1)

    // Check if there are nodes that can be eliminated
    const selectedSomeNode = selectedNodes.value.filter(s => s.type === node.type)
    if (selectedSomeNode.length === 2) {
      // Second node index
      const secondIndex = selectedNodes.value.findIndex(o => o.id === selectedSomeNode[1].id)
      selectedNodes.value.splice(secondIndex + 1, 0, node)
      // Add delay for animation effect
      setTimeout(() => {
        for (let i = 0; i < 3; i++) {
          selectedNodes.value.splice(secondIndex - 1, 1)
        }
        preNode.value = null
        // Check if all nodes are cleared (victory condition)
        if (delNode ? nodes.value.length === 0 : nodes.value.every(o => o.state > 0) && removeList.value.length === 0 && selectedNodes.value.length === 0) {
          removeFlag.value = true
          backFlag.value = true
          events.winCallback && events.winCallback()
        }
        else {
          events.dropCallback && events.dropCallback()
        }
      }, 100)
    }
    else {
      events.clickCallback && events.clickCallback()
      const index = selectedNodes.value.findIndex(o => o.type === node.type)
      if (index > -1)
        selectedNodes.value.splice(index + 1, 0, node)
      else
        selectedNodes.value.push(node)
      // Check if card slots are full (failure condition)
      if (selectedNodes.value.length === 7) {
        removeFlag.value = true
        backFlag.value = true
        events.loseCallback && events.loseCallback()
      }
    }
  }

  function handleSelectRemove(node: CardNode) {
    const index = removeList.value.findIndex(o => o.id === node.id)
    if (index > -1)
      removeList.value.splice(index, 1)
    handleSelect(node)
  }

  function handleBack() {
    const node = preNode.value
    if (!node)
      return
    preNode.value = null
    backFlag.value = true
    node.state = 0
    delNode && nodes.value.push(node)
    const index = selectedNodes.value.findIndex(o => o.id === node.id)
    selectedNodes.value.splice(index, 1)
  }

  function handleRemove() {
    // Take 3 nodes from selectedNodes and move to removeList
    if (selectedNodes.value.length < 3)
      return
    removeFlag.value = true
    preNode.value = null
    for (let i = 0; i < 3; i++) {
      const node = selectedNodes.value.shift()
      if (!node)
        return
      removeList.value.push(node)
    }
  }

  function initData(config?: GameConfig | null) {
    const { cardNum, layerNum, trap } = { ...initConfig, ...config }
    histroyList.value = []
    backFlag.value = false
    removeFlag.value = false
    removeList.value = []
    preNode.value = null
    nodes.value = []
    indexSet.clear()
    perFloorNodes = []
    selectedNodes.value = []
    floorList = []
    const isTrap = trap && floor(random(0, 100)) !== 50

    // Generate card pool
    const itemTypes = (new Array(cardNum).fill(0)).map((_, index) => index + 1)
    let itemList: number[] = []
    // Formula: Total Cards = 3 × cardNum × (layerNum - 1)
    for (let i = 0; i < 3 * (layerNum - 1); i++)
      itemList = [...itemList, ...itemTypes]

    if (isTrap) {
      const len = itemList.length
      itemList.splice(len - cardNum, len)
    }
    // Shuffle cards
    itemList = shuffle(shuffle(itemList))

    // Initialize nodes for each layer
    let len = 0
    let floorIndex = 1
    const itemLength = itemList.length
    while (len <= itemLength) {
      const maxFloorNum = floorIndex * floorIndex
      const floorNum = ceil(random(maxFloorNum / 2, maxFloorNum))
      floorList.push(itemList.splice(0, floorNum))
      len += floorNum
      floorIndex++
    }
    const containerWidth = container.value!.clientWidth
    const containerHeight = container.value!.clientHeight
    
    // First, calculate all card positions with origin at (0,0)
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    
    // Temporary array to store all card positions
    const tempNodes: Array<{row: number, column: number, floorIndex: number}> = []
    
    floorList.forEach((o, floorIndex) => {
      const floorSize = floorIndex + 1
      const indexSet = new Set()
      
      o.forEach(() => {
        let i = floor(random(0, floorSize ** 2))
        while (indexSet.has(i))
          i = floor(random(0, floorSize ** 2))
        
        const row = floor(i / floorSize)
        const column = i % floorSize
        
        // Calculate position relative to origin
        const x = size * column - (size / 2) * floorIndex
        const y = size * row - (size / 2) * floorIndex
        
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x + size)
        minY = Math.min(minY, y)
        maxY = Math.max(maxY, y + size)
        
        tempNodes.push({ row, column, floorIndex })
        indexSet.add(i)
      })
    })
    
    // Calculate the total bounds of all cards
    const totalWidth = maxX - minX
    const totalHeight = maxY - minY
    
    // Center the entire card layout in the container
    const offsetX = (containerWidth - totalWidth) / 2 - minX
    const offsetY = (containerHeight - totalHeight) / 2 - minY

    // Now create the actual card nodes using the pre-calculated positions and centering offset
    let tempNodeIndex = 0
    floorList.forEach((o, floorIndex) => {
      const floorNodes: CardNode[] = []
      
      o.forEach((k) => {
        const tempNode = tempNodes[tempNodeIndex++]
        const { row, column } = tempNode
        
        // Apply the centering offset to the original position calculation
        const originalX = size * column - (size / 2) * floorIndex
        const originalY = size * row - (size / 2) * floorIndex
        
        const node: CardNode = {
          id: `${floorIndex}-${row}-${column}`,
          type: k,
          zIndex: floorIndex,
          index: row * (floorIndex + 1) + column,
          row,
          column,
          top: originalY + offsetY,
          left: originalX + offsetX,
          parents: [],
          state: 0,
        }
        
        // Check for parent relationships
        const xy = [node.top, node.left]
        perFloorNodes.forEach((e) => {
          if (Math.abs(e.top - xy[0]) <= size && Math.abs(e.left - xy[1]) <= size)
            e.parents.push(node)
        })
        
        floorNodes.push(node)
      })
      
      nodes.value = nodes.value.concat(floorNodes)
      perFloorNodes = floorNodes
    })

    updateState()
  }

  return {
    nodes,
    selectedNodes,
    removeFlag,
    removeList,
    backFlag,
    handleSelect,
    handleBack,
    handleRemove,
    handleSelectRemove,
    initData,
  }
}
