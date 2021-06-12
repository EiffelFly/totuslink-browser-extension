<template>
  <div
    class="w-full h-full"
  >
    <div
      class="flex flex-col w-full p-6 bg-sd-base03-brblack"
    >
      <div
        class="flex flex-row w-full"
      >
        <div
          class="my-auto font-sans text-lg font-semibold text-sd-base2-white"
        >
          Choose hologram
        </div>
        <button
          class="flex w-8 h-8 ml-auto rounded-md hover:bg-sd-base02-black focus:outline-none"
          @click="closeHologramList"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 m-auto fill-current text-sd-base2-white" viewBox="0 0 16 16">
            <path d="M5.921 11.9 1.353 8.62a.719.719 0 0 1 0-1.238L5.921 4.1A.716.716 0 0 1 7 4.719V6c1.5 0 6 0 7 8-2.5-4.5-7-4-7-4v1.281c0 .56-.606.898-1.079.62z"/>
          </svg>
        </button>
      </div>
      <div
        class="flex w-full mt-4"
      >
        <input 
          class="flex-1 bg-sd-base02-black font-sans rounded-md border border-sd-base01-brgreen font-normal text-sm text-sd-base0-brblue py-1.5 px-3 focus:outline-none" 
          placeholder="Search for hologram..."
          type="text"
          v-model="searchTerm"
          id="searchTerm"
          @keyup.enter="selectHologramHandler"
        />
      </div>
    </div>
    <div
      class="flex flex-col w-full h-56 overflow-y-auto"
    >
      <button
        v-for="hologram in filteredHolograms"
        v-bind:key="hologram.id"
        class="flex w-full px-6 py-2 font-sans text-sm font-light text-left text-sd-base1-brcyan focus:outline-none"
        @click="clickHologramHandler(hologram.id)"
        @mouseenter="hoverHologram(hologram.id)"
        v-bind:class="getHoverStyle(hologram.id)"
        :id="hologram.id"
      >
        <span class="my-auto truncate">{{ hologram.title }}</span>
      </button>
    </div>
  </div>
</template>
<script>
import { computed, ref, nextTick, watch } from "vue"
import { useStore } from "vuex";
export default {
  name: "HologramList",
  setup() {
    const store = useStore();
    const searchTerm = ref("");
    const hologramListOpen = computed(() => store.getters["control/hologramListOpen"]);
    const hoveredHologramID = ref("");
    const holograms = computed(() => store.getters["hologram/holograms"]);
    const preventMouseEnter = ref(false);
    const filteredHolograms = computed(() => {
      const filteredItems = holograms.value.filter( element => {
        if (element){
          const target = element.title.toLowerCase().includes(searchTerm.value.toLowerCase());
          if (target){
            return true;
          } else {
            return false;
          }
        }
      })
      return filteredItems
    })
    
    const clickHologramHandler = (hologramID) => {
      store.dispatch("hologram/updateSelectedHologramID", {data:hologramID})
      closeHologramList();
    }

    const hoverHologram = (hologramID) => {
      if ( preventMouseEnter.value ){
        preventMouseEnter.value = false
        return;
      }
      hoveredHologramID.value = hologramID
    }

    const closeHologramList = () => {
      if (hologramListOpen.value){
        store.dispatch("control/updateHologramListOpen", {data:false})
      }
    }

    const getHoverStyle = (hologramID) => {
      if ( hoveredHologramID.value === hologramID ){
        return "bg-sd-base02-black"
      }
    }

    const hoverPreviousHologram = () => {
      const index = filteredHolograms.value.findIndex( e => e.id === hoveredHologramID.value )
      if ( index - 1 < 0 ) return;
      hoveredHologramID.value = filteredHolograms.value[`${index - 1}`].id;
    }

    const hoverNextHologram = () => {
      const index = filteredHolograms.value.findIndex( e => e.id === hoveredHologramID.value )
      if ( index + 2 > holograms.value.length ) return;
      hoveredHologramID.value = filteredHolograms.value[`${index + 1}`].id;
    }

    const selectHoveredHologram = () => {
      if ( !hoveredHologramID.value ) return;

      store.dispatch("hologram/updateSelectedHologramID", {data:hoveredHologramID.value});
      closeHologramList();
    }

    const hologramListKeyupEventHandler = (e) => {
      
      if ( e.key === "ArrowUp" ){
        e.preventDefault()
        hoverPreviousHologram();
        return;
      }
      if ( e.key === "ArrowDown" ){
        e.preventDefault()
        hoverNextHologram();
        return;
      }
      if ( e.key === "Enter" && hologramListOpen.value ){
        selectHoveredHologram();
        return;
      }
    }

    watch( hologramListOpen, (newValue) => {
      if ( !newValue ) {
        document.removeEventListener("keydown", hologramListKeyupEventHandler)
        return;
      } 
      
      document.addEventListener("keydown", hologramListKeyupEventHandler)
      nextTick(() => {
        const target = document.getElementById("searchTerm")
        console.log(target)
        target.focus();
      })
    })

    watch( hoveredHologramID, (newValue) => {
      const targetElement = document.getElementById(newValue);
      const visible = checkVisible(targetElement);

      const scrollIntoViewOptions = { // eslint-disable-line no-unused-vars
        behavior: "smooth",
        block: "nearest"
      }

      console.log(!visible, targetElement)
      
      
        targetElement.scrollIntoView(scrollIntoViewOptions);
        preventMouseEnter.value = true;
      
    })

    return {
      hologramListOpen,
      searchTerm,
      holograms,
      hoveredHologramID,
      closeHologramList,
      filteredHolograms,
      getHoverStyle,
      clickHologramHandler,
      hoverHologram,
    }
  }
};

const checkVisible = (element) => {
  // 130 - hologram list component fixed top element's height
  var rect = element.getBoundingClientRect();
  var viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
  return !(rect.bottom <= 130  || rect.top - viewHeight >= 0);
}

</script>
<style>
</style>