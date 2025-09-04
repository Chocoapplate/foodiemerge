<script setup lang="ts">
import { onMounted, onUnmounted, nextTick, ref } from 'vue'
import Card from './components/card.vue'
import { useGame } from './core/useGame'
import { basicCannon, schoolPride } from './core/utils'

const containerRef = ref<HTMLElement | undefined>()
const clickAudioRef = ref<HTMLAudioElement | undefined>()
const dropAudioRef = ref<HTMLAudioElement | undefined>()
const winAudioRef = ref<HTMLAudioElement | undefined>()
const loseAudioRef = ref<HTMLAudioElement | undefined>()
const welAudioRef = ref<HTMLAudioElement | undefined>()
const curLevel = ref(1)
const showTip = ref(false)
const showFailPopup = ref(false)
const LevelConfig = [
  { cardNum: 3, layerNum: 2, trap: false },   // Level 1: 3 different cards
  { cardNum: 7, layerNum: 3, trap: false },   // Level 2: 7 different cards
  { cardNum: 10, layerNum: 3, trap: false },  // Level 3: 10 different cards
  { cardNum: 15, layerNum: 4, trap: false },  // Level 4: 15 different cards
  { cardNum: 18, layerNum: 5, trap: false },  // Level 5: 18 different cards
]

const isWin = ref(false)
const showDebugMenu = ref(import.meta.env.DEV) // Only show in development
const resizeTimeout = ref<NodeJS.Timeout | null>(null)

const {
  nodes,
  selectedNodes,
  handleSelect,
  handleBack,
  backFlag,
  handleRemove,
  removeFlag,
  removeList,
  handleSelectRemove,
  initData,
} = useGame({
  container: containerRef,
  cardNum: 2,
  layerNum: 2,
  trap: false,
  events: {
    clickCallback: handleClickCard,
    dropCallback: handleDropCard,
    winCallback: handleWin,
    loseCallback: handleLose,
  },
})

function handleClickCard() {
  if (clickAudioRef.value?.paused) {
    clickAudioRef.value.play()
  }
  else if (clickAudioRef.value) {
    clickAudioRef.value.load()
    clickAudioRef.value.play()
  }
}

function handleDropCard() {
  dropAudioRef.value?.play()
}

function handleWin() {
  winAudioRef.value?.play()
  if (curLevel.value < LevelConfig.length) {
    basicCannon()
    showTip.value = true
    setTimeout(() => {
      showTip.value = false
    }, 3000)
    setTimeout(() => {
      initData(LevelConfig[curLevel.value])
      curLevel.value++
    }, 3500)
  }
  else {
    isWin.value = true
    schoolPride()
  }
}

function handleLose() {
  loseAudioRef.value?.play()
  setTimeout(() => {
    showFailPopup.value = true
  }, 500)
}

function handleRetry() {
  showFailPopup.value = false
  nodes.value = []
  removeList.value = []
  selectedNodes.value = []
  welAudioRef.value?.play()
  curLevel.value = 1
  initData(LevelConfig[0]) // Start directly at level 1
}

// Debug functions
function debugTriggerFinalCompletion() {
  isWin.value = true
  schoolPride()
}

function debugWinCurrentLevel() {
  handleWin()
}

// Handle window resize for responsive card positioning
function handleResize() {
  // Debounce resize events to avoid excessive recalculations
  if (resizeTimeout.value) {
    clearTimeout(resizeTimeout.value)
  }
  resizeTimeout.value = setTimeout(() => {
    // Always recalculate positions on resize, regardless of game state
    // This ensures cards reposition even during gameplay
    const currentConfig = LevelConfig[curLevel.value - 1]
    initData(currentConfig)
  }, 100) // Reduced debounce time for more responsive updates
}

onMounted(async () => {
  initData()
  
  // Add window resize listener
  window.addEventListener('resize', handleResize)
  
  // Wait for DOM to be ready before setting up ResizeObserver
  await nextTick()
  
  // Also use ResizeObserver for more accurate container size detection
  if (containerRef.value && 'ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(() => {
      handleResize()
    })
    resizeObserver.observe(containerRef.value)
    
    // Store observer for cleanup
    ;(containerRef.value as any)._resizeObserver = resizeObserver
  }
})

onUnmounted(() => {
  // Clean up resize listener and timeout
  window.removeEventListener('resize', handleResize)
  if (resizeTimeout.value) {
    clearTimeout(resizeTimeout.value)
    resizeTimeout.value = null
  }
  
  // Clean up ResizeObserver
  if (containerRef.value && (containerRef.value as any)._resizeObserver) {
    ;(containerRef.value as any)._resizeObserver.disconnect()
  }
})
</script>

<template>
  <div class="game-container" flex flex-col w-full h-full>
    <!-- Game Title -->
    <div class="game-title" text-center w-full flex items-center justify-center>
      <img src="/src/assets/logo.png" alt="Foodie Merge" class="logo-image" />
    </div>

    <!-- Main Game Area -->
    <div ref="containerRef" class="game-area" flex-1 flex>
      <div class="game-boundary">
        <div class="cards-container" w-full relative flex-1>
          <template v-for="item in nodes" :key="item.id">
            <transition name="slide-fade">
              <Card
                v-if="[0, 1].includes(item.state)"
                :node="item"
                @click-card="handleSelect"
              />
            </transition>
          </template>
        </div>
      </div>
    </div>

    <!-- Final Completion Message Overlay -->
    <transition name="bounce">
      <div v-if="isWin" class="win-message-overlay">
        <div class="win-message" flex items-center justify-center w-full>
          Congratulations! You're a Foodie Master!
        </div>
      </div>
    </transition>

    <!-- Level Indicator -->
    <div class="level-indicator">
      Level {{ curLevel }}
    </div>

    <!-- Remove List Area -->
    <div class="remove-area" text-center flex items-center justify-center>
      <Card
        v-for="item in removeList" :key="item.id" :node="item"
        is-dock
        @click-card="handleSelectRemove"
      />
    </div>

    <!-- Main Card Dock -->
    <div class="dock-area" w-full flex items-center justify-center>
      <div class="card-dock" w-295px h-44px flex>
        <template v-for="item in selectedNodes" :key="item.id">
          <transition name="bounce">
            <Card
              v-if="item.state === 2"
              :node="item"
              is-dock
            />
          </transition>
        </template>
      </div>
    </div>

    <!-- Control Buttons -->
    <div class="controls-area" flex items-center w-full justify-center>
      <button class="game-button remove-button" :disabled="removeFlag" @click="handleRemove">
        Remove 3
      </button>
      <button class="game-button undo-button" :disabled="backFlag" @click="handleBack">
        Undo
      </button>
    </div>

    <!-- Debug Menu (Development Only) -->
    <div v-if="showDebugMenu" class="debug-menu">
      <h3 class="debug-title">Debug Menu</h3>
      <button class="debug-button" @click="debugTriggerFinalCompletion">
        Trigger Final Completion
      </button>
      <button class="debug-button" @click="debugWinCurrentLevel">
        Win Current Level
      </button>
    </div>

    <!-- Fail Popup Modal -->
    <transition name="fade">
      <div v-if="showFailPopup" class="popup-overlay" @click="handleRetry">
        <div class="fail-popup" @click.stop>
          <img src="/src/assets/fail.png" alt="Failure! Oops, Slots full!" class="fail-image" />
          <button class="retry-button image-button" @click="handleRetry"></button>
        </div>
      </div>
    </transition>

    <!-- Level Popup Modal -->
    <transition name="fade">
      <div v-if="showTip" class="popup-overlay">
        <div class="level-popup" @click.stop>
          <img src="/src/assets/success.png" alt="Level Complete! Get ready for the next challenge!" class="level-success-image" />
        </div>
    </div>
    </transition>

    <!-- Audio Elements -->
    <audio
      ref="clickAudioRef"
      style="display: none;"
      controls
      src="./audio/click.mp3"
    />
    <audio
      ref="dropAudioRef"
      style="display: none;"
      controls
      src="./audio/drop.mp3"
    />
    <audio
      ref="winAudioRef"
      style="display: none;"
      controls
      src="./audio/win2.mp3"
    />
    <audio
      ref="loseAudioRef"
      style="display: none;"
      controls
      src="./audio/lose.mp3"
    />
    <audio
      ref="welAudioRef"
      style="display: none;"
      controls
      src="./audio/welcome.mp3"
    />
  </div>
</template>

<style>
body {
  background: url('/src/assets/backgrounds/background1-restaurant.png') center center / cover no-repeat,
              linear-gradient(135deg, #FFE4A3 0%, #FFCC70 50%, #FFB347 100%);
  min-height: 100vh;
  font-family: 'Nunito', 'Quicksand', 'Comfortaa', 'Fredoka One', system-ui, -apple-system, sans-serif;
  margin: 0;
  padding: 0;
}

/* Remove focus outlines from all buttons */
button:focus {
  outline: none !important;
  box-shadow: none !important;
}

.game-container {
  padding: 20px;
  max-width: 100vw;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(2px);
  position: relative;
}

/* Responsive spacing for mobile devices */
@media (max-width: 480px) {
  .game-container {
    padding: 10px;
  }
  
  .game-title {
    height: 150px;
    margin-bottom: 5px;
  }
  
  .logo-image {
    max-height: 130px;
    width: 250px;
  }
  
  .dock-area {
    padding: 0 5px;
    margin-bottom: 15px;
  }
  
  .remove-area {
    padding: 0 5px;
    margin-bottom: 10px;
  }
  
  .controls-area {
    margin-bottom: 10px;
    gap: 12px;
  }
}

.game-title {
  height: 150px;
  margin-bottom: 5px;
  position: relative;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  max-height: 130px;
  width: 250px;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
}

.game-area {
  margin-bottom: 20px;
  padding: 10px;
  min-height: 360px;
  max-height: 72vh;
  overflow: hidden;
}

.game-boundary {
  width: 100%;
  height: 100%;
  border: 2px dashed rgba(210, 180, 140, 0.3);
  border-radius: 8px;
  padding: 10px;
  position: relative;
  background: rgba(255, 248, 220, 0.1);
  backdrop-filter: blur(1px);
}

.cards-container {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

/* Mobile adjustments for game area */
@media (max-width: 480px) {
  .game-area {
    max-height: 60vh;
    min-height: 300px;
    padding: 5px;
  }
  
  .game-boundary {
    padding: 5px;
  }
}

.remove-area {
  min-height: 60px;
  margin-bottom: 15px;
  padding: 0 10px;
}

.dock-area {
  margin-bottom: 25px;
  padding: 0 10px;
}

.controls-area {
  height: 70px;
  gap: 16px;
  margin-bottom: 20px;
  background: transparent;
}

@keyframes titlePulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}

.game-button {
  border: none;
  border-radius: 0;
  padding: 0;
  font-size: 0;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Nunito', 'Quicksand', 'Comfortaa', 'Fredoka One', system-ui, -apple-system, sans-serif;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: transparent;
  outline: none;
}

.game-button:focus {
  outline: none;
  box-shadow: none;
}

.remove-button {
  background-image: url('/src/assets/UI/ui1-remove3.png');
  width: 140px;
  height: 57px;
}

.undo-button {
  background-image: url('/src/assets/UI/ui2-undo.png');
  width: 120px;
  height: 60px;
}

.game-button:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  filter: brightness(1.1) drop-shadow(0 6px 16px rgba(0,0,0,0.3));
}

.game-button:active:not(:disabled) {
  transform: translateY(0) scale(1.02);
  filter: brightness(0.9);
}

.game-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
  filter: grayscale(100%) brightness(0.8);
}

.win-message-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(2px);
}

.win-message {
  font-size: clamp(18px, 4vw, 32px);
  font-weight: bold;
  color: #8B4513;
  text-shadow: 2px 2px 4px rgba(255,255,255,0.8);
  background: linear-gradient(145deg, #FFF8DC, #F5F5DC);
  border-radius: 12px;
  padding: clamp(15px, 3vw, 25px) clamp(20px, 4vw, 30px);
  margin: clamp(15px, 3vw, 30px) clamp(10px, 2vw, 20px);
  box-shadow: 
    0 4px 8px rgba(0,0,0,0.15),
    0 2px 4px rgba(0,0,0,0.1),
    inset 0 1px 0 rgba(255,255,255,0.8);
  border: 2px solid #D2B48C;
  max-width: 95%;
  width: fit-content;
  text-align: center;
  line-height: 1.2;
  font-family: 'Nunito', 'Quicksand', 'Comfortaa', 'Fredoka One', system-ui, -apple-system, sans-serif;
}


.card-dock {
  background: linear-gradient(145deg, #FFF8DC, #F5F5DC);
  border: 2px solid #D2B48C;
  border-radius: 12px;
  box-shadow: 
    0 4px 8px rgba(0,0,0,0.15),
    0 2px 4px rgba(0,0,0,0.1),
    inset 0 1px 0 rgba(255,255,255,0.8);
  backdrop-filter: blur(10px);
  padding: 8px;
  gap: 4px;
}

/* Fail Popup Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.fail-popup {
  background: transparent;
  border-radius: 0;
  padding: 20px;
  max-width: 90%;
  width: auto;
  box-shadow: none;
  border: none;
  animation: popupBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.fail-image {
  max-width: 400px;
  max-height: 300px;
  width: auto;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
}


.level-popup {
  background: transparent;
  border-radius: 0;
  padding: 20px;
  max-width: 90%;
  width: auto;
  box-shadow: none;
  border: none;
  animation: popupBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  display: flex;
  align-items: center;
  justify-content: center;
}

.level-success-image {
  max-width: 400px;
  max-height: 300px;
  width: auto;
  height: auto;
  object-fit: contain;
  filter: drop-shadow(0 8px 16px rgba(0,0,0,0.3));
}

.level-icon {
  font-size: 64px;
  margin-bottom: 15px;
  animation: sparkle 1s ease-in-out infinite alternate;
  color: #D2B48C;
  text-shadow: 2px 2px 4px rgba(255,255,255,0.8);
}

.level-title {
  font-size: 28px;
  font-weight: bold;
  color: #8B4513;
  margin: 0 0 15px 0;
  text-shadow: 2px 2px 4px rgba(255,255,255,0.8);
  font-family: 'Nunito', 'Quicksand', 'Comfortaa', 'Fredoka One', system-ui, -apple-system, sans-serif;
}

.level-message {
  font-size: 18px;
  color: #8B4513;
  margin: 0 0 25px 0;
  line-height: 1.4;
  font-family: 'Nunito', 'Quicksand', 'Comfortaa', 'Fredoka One', system-ui, -apple-system, sans-serif;
}



.retry-button {
  background: linear-gradient(145deg, #FFF8DC, #F5F5DC);
  border: 2px solid #D2B48C;
  border-radius: 12px;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  color: #FF6B35;
  text-shadow: 1px 1px 2px rgba(255,255,255,0.8);
  box-shadow: 
    0 4px 8px rgba(0,0,0,0.15),
    0 2px 4px rgba(0,0,0,0.1),
    inset 0 1px 0 rgba(255,255,255,0.8);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Nunito', 'Quicksand', 'Comfortaa', 'Fredoka One', system-ui, -apple-system, sans-serif;
}

.retry-button.image-button {
  background-image: url('/src/assets/UI/ui3-tryagain.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  background-color: transparent;
  border: none;
  border-radius: 0;
  padding: 0;
  font-size: 0;
  width: 180px;
  height: 70px;
  box-shadow: none;
}

.retry-button.image-button:hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
}

.retry-button.image-button:active {
  filter: brightness(0.9);
  transform: translateY(0);
}

.retry-button.image-button:focus {
  outline: none;
  box-shadow: none;
}

.retry-button:hover {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 
    0 6px 16px rgba(0,0,0,0.2),
    0 3px 6px rgba(0,0,0,0.15),
    inset 0 1px 0 rgba(255,255,255,0.9);
  border-color: #CD853F;
}

.retry-button:active {
  transform: translateY(0) scale(1.02);
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.2),
    inset 0 2px 4px rgba(0,0,0,0.1);
}

/* Level Indicator Styles */
.level-indicator {
  text-align: center;
  font-size: 24px;
  font-weight: 900;
  color: #8B4513;
  margin: 15px 0;
  padding: 0;
  background: none;
  border: none;
  box-shadow: none;
  display: inline-block;
  font-family: 'Fredoka One', 'Comfortaa', 'Nunito', system-ui, -apple-system, sans-serif;
  text-shadow: 
    3px 3px 0px #FFE4E1,
    -1px -1px 0px #FFE4E1,
    1px -1px 0px #FFE4E1,
    -1px 1px 0px #FFE4E1,
    1px 1px 0px #FFE4E1,
    4px 4px 8px rgba(0,0,0,0.3);
  letter-spacing: 1px;
  transform: rotate(-2deg);
  animation: levelFloat 3s ease-in-out infinite;
}

@keyframes levelFloat {
  0%, 100% {
    transform: rotate(-2deg) translateY(0px);
  }
  50% {
    transform: rotate(2deg) translateY(-8px);
  }
}

@media (max-width: 480px) {
  .level-indicator {
    font-size: 20px;
    margin: 12px 0;
    text-shadow: 
      2px 2px 0px #FFE4E1,
      -1px -1px 0px #FFE4E1,
      1px -1px 0px #FFE4E1,
      -1px 1px 0px #FFE4E1,
      1px 1px 0px #FFE4E1,
      3px 3px 6px rgba(0,0,0,0.3);
  }
}

/* Debug Menu Styles */
.debug-menu {
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid #ff0000;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 200px;
}

.debug-title {
  margin: 0 0 10px 0;
  font-size: 16px;
  font-weight: bold;
  color: #ff0000;
  text-align: center;
}

.debug-button {
  background: #ff0000;
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background 0.2s ease;
}

.debug-button:hover {
  background: #cc0000;
}

.debug-button:active {
  background: #990000;
}

/* Popup Animations */
@keyframes popupBounce {
  0% {
    opacity: 0;
    transform: scale(0.3) translateY(-50px);
  }
  50% {
    opacity: 1;
    transform: scale(1.05) translateY(0);
  }
  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes wiggle {
  0% { transform: rotate(-3deg); }
  100% { transform: rotate(3deg); }
}

@keyframes sparkle {
  0% { 
    transform: scale(1) rotate(0deg);
    text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  }
  100% { 
    transform: scale(1.1) rotate(5deg);
    text-shadow: 2px 2px 8px rgba(255, 215, 0, 0.6);
  }
}

/* Fade Transition */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.bounce-enter-active {
  animation: bounce-in 0.5s;
}
.bounce-leave-active {
  animation: bounce-in 0.5s reverse;
}
@keyframes bounce-in {
  0% {
    transform: scale(0);
  }
  50% {
    transform: scale(1.25);
  }
  100% {
    transform: scale(1);
  }
}

.slide-fade-enter-active {
  transition: all 0.2s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(25vh);
  opacity: 0;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>
