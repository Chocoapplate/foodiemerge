<script setup lang="ts">
import { onMounted, ref } from 'vue'
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
  { cardNum: 2, layerNum: 2, trap: false },   // Level 1: 12 blocks
  { cardNum: 5, layerNum: 3, trap: false },   // Level 2: 45 blocks
  { cardNum: 9, layerNum: 3, trap: false },   // Level 3: 81 blocks
  { cardNum: 10, layerNum: 4, trap: false },  // Level 4: 120 blocks
  { cardNum: 12, layerNum: 5, trap: false },  // Level 5: 180 blocks
  { cardNum: 15, layerNum: 6, trap: true },   // Level 6: 270 blocks (with traps!)
]

const isWin = ref(false)

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
  // fireworks()
  if (curLevel.value < LevelConfig.length) {
    basicCannon()
    showTip.value = true
    setTimeout(() => {
      showTip.value = false
    }, 1500)
    setTimeout(() => {
      initData(LevelConfig[curLevel.value])
      curLevel.value++
    }, 2000)
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
    curLevel.value = 0
    showTip.value = true
    setTimeout(() => {
      showTip.value = false
    }, 1500)
    setTimeout(() => {
      initData(LevelConfig[curLevel.value])
      curLevel.value++
    }, 2000)
}

onMounted(() => {
  initData()
})
</script>

<template>
  <div class="game-container" flex flex-col w-full h-full>
    <!-- Game Title -->
    <div class="game-title" text-center w-full flex items-center justify-center>
      Foodie Merge
    </div>

    <!-- Main Game Area -->
    <div ref="containerRef" class="game-area" flex-1 flex>
      <div w-full relative flex-1>
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
      <transition name="bounce">
        <div v-if="isWin" class="win-message" flex items-center justify-center w-full>
          Congratulations! You're a Foodie Master!
        </div>
      </transition>
      <!-- Level popup will be moved to modal section -->
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
      <button class="game-button" :disabled="removeFlag" @click="handleRemove">
        Remove 3
      </button>
      <button class="game-button" :disabled="backFlag" @click="handleBack">
        Undo
      </button>
    </div>

    <!-- Fail Popup Modal -->
    <transition name="fade">
      <div v-if="showFailPopup" class="popup-overlay" @click="handleRetry">
        <div class="fail-popup" @click.stop>
          <div class="popup-content">
            <div class="fail-icon">×</div>
            <h2 class="fail-title">Oops! Slots Full!</h2>
            <p class="fail-message">Don't give up! Try again and become a Foodie Master!</p>
            <button class="retry-button" @click="handleRetry">
              Try Again
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Level Popup Modal -->
    <transition name="fade">
      <div v-if="showTip" class="popup-overlay">
        <div class="level-popup" @click.stop>
          <div class="popup-content">
            <div class="level-icon">★</div>
            <h2 class="level-title">Level {{ curLevel + 1 }}</h2>
            <p class="level-message">Get ready for the next challenge!</p>
          </div>
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
      src="./audio/win.mp3"
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
  background: linear-gradient(135deg, #FFE4A3 0%, #FFCC70 50%, #FFB347 100%);
  min-height: 100vh;
  font-family: 'Comic Sans MS', cursive, sans-serif;
  margin: 0;
  padding: 0;
}

.game-container {
  padding: 20px;
  max-width: 100vw;
  min-height: 100vh;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

/* Responsive spacing for mobile devices */
@media (max-width: 480px) {
  .game-container {
    padding: 15px;
  }
  
  .game-title {
    font-size: 36px;
    margin-bottom: 15px;
  }
  
  .dock-area {
    padding: 0 5px;
  }
  
  .remove-area {
    padding: 0 5px;
  }
}

.game-title {
  font-size: 48px;
  font-weight: 900;
  color: #FF6B35;
  text-shadow: 3px 3px 0px #FFF, 6px 6px 10px rgba(0,0,0,0.3);
  letter-spacing: 2px;
  background: linear-gradient(45deg, #FF6B35, #F7931E, #FFD23F);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titlePulse 2s ease-in-out infinite alternate;
  height: 80px;
  margin-bottom: 20px;
}

.game-area {
  margin-bottom: 20px;
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
}

@keyframes titlePulse {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}

.game-button {
  background: linear-gradient(45deg, #FF6B94, #FF8E94);
  border: 3px solid #FFF;
  border-radius: 25px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  box-shadow: 0 6px 15px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

.game-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
}

.game-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 4px 10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3);
}

.game-button:disabled {
  background: linear-gradient(45deg, #CCC, #AAA);
  cursor: not-allowed;
  opacity: 0.6;
}

.win-message {
  font-size: 32px;
  font-weight: bold;
  color: #FF6B35;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
  background: rgba(255,255,255,0.9);
  border-radius: 20px;
  padding: 25px 30px;
  margin: 30px 20px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  border: 3px solid #FFD23F;
  max-width: 90%;
}

/* Level display styles moved to level-popup modal */

.card-dock {
  background: rgba(255,255,255,0.8);
  border: 4px solid #FF6B94;
  border-radius: 20px;
  box-shadow: inset 0 4px 8px rgba(0,0,0,0.1), 0 4px 15px rgba(0,0,0,0.2);
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
  background: linear-gradient(135deg, #FF6B94, #FF8E94, #FFA5A5);
  border-radius: 30px;
  padding: 0;
  max-width: 90%;
  width: 400px;
  box-shadow: 
    0 20px 60px rgba(0,0,0,0.3),
    0 8px 30px rgba(0,0,0,0.2),
    inset 0 1px 0 rgba(255,255,255,0.3);
  border: 4px solid #FFF;
  animation: popupBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.popup-content {
  background: rgba(255,255,255,0.95);
  border-radius: 25px;
  padding: 30px;
  text-align: center;
  margin: 4px;
}

.fail-icon {
  font-size: 64px;
  margin-bottom: 15px;
  animation: wiggle 0.5s ease-in-out infinite alternate;
  color: #FF6B35;
  font-weight: bold;
}

.level-popup {
  background: linear-gradient(135deg, #4ECDC4, #44A08D, #26D0CE);
  border-radius: 30px;
  padding: 0;
  max-width: 90%;
  width: 400px;
  box-shadow: 
    0 20px 60px rgba(0,0,0,0.3),
    0 8px 30px rgba(0,0,0,0.2),
    inset 0 1px 0 rgba(255,255,255,0.3);
  border: 4px solid #FFF;
  animation: popupBounce 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.level-icon {
  font-size: 64px;
  margin-bottom: 15px;
  animation: sparkle 1s ease-in-out infinite alternate;
  color: #FFD700;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.level-title {
  font-size: 28px;
  font-weight: bold;
  color: #4ECDC4;
  margin: 0 0 15px 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

.level-message {
  font-size: 18px;
  color: #666;
  margin: 0 0 25px 0;
  line-height: 1.4;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

.fail-title {
  font-size: 28px;
  font-weight: bold;
  color: #FF6B35;
  margin: 0 0 15px 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

.fail-message {
  font-size: 18px;
  color: #666;
  margin: 0 0 25px 0;
  line-height: 1.4;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

.retry-button {
  background: linear-gradient(45deg, #4ECDC4, #44A08D);
  border: 3px solid #FFF;
  border-radius: 25px;
  padding: 15px 30px;
  font-size: 18px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
  box-shadow: 0 6px 20px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3);
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Comic Sans MS', cursive, sans-serif;
}

.retry-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
}

.retry-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(0,0,0,0.25), inset 0 2px 4px rgba(0,0,0,0.1);
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
