interface Game {
  nodes: Ref<CardNode[]>;
  selectedNodes: Ref<CardNode[]>;
  removeList: Ref<CardNode[]>;
  removeFlag: Ref<boolean>;
  backFlag: Ref<boolean>;
  handleSelect: (node: CardNode) => void;
  handleSelectRemove: (node: CardNode) => void;
  handleBack: () => void;
  handleRemove: () => void;
  initData: (config?: GameConfig) => void;
}
interface GameConfig {
  container?: Ref<HTMLElement | undefined>,   // Card node container
  cardNum: number,                            // Number of card types
  layerNum: number                            // Number of card layers
  trap?:boolean,                              // Whether to enable traps
  delNode?: boolean,                          // Whether to remove selected nodes from nodes array
  events?: GameEvents                         // Game events
}

interface GameEvents {
  clickCallback?: () => void, 
  dropCallback?: () => void, 
  winCallback?: () => void, 
  loseCallback?: () => void
}

// Card node type
type CardNode = {
  id: string           // Node ID (zIndex-index)
  type: number         // Card type
  zIndex: number       // Layer index
  index: number        // Index within the layer
  parents: CardNode[]  // Parent nodes
  row: number          // Row position
  column: number       // Column position
  top: number
  left: number
  state: number        // Clickable state: 0=no state, 1=clickable, 2=selected, 3=eliminated
}