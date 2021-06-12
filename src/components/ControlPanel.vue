<template>
  <div
    class="w-full h-full"
  >
    <div
      v-if="dataIsReady"
      class="flex flex-col w-full h-full"
    >
      <div 
        class="w-full font-sans text-sm font-medium text-sd-base2-white"
      >
        {{ currentTabTitle }}
      </div>
      <div
        class="w-full mt-1 font-sans text-xs font-normal break-all text-sd-base1-brcyan"
      >
        {{ truncateCurrentTabUrl }}
      </div>
      <div
        class="flex flex-grow w-full"
      >
        <div
          v-if="duplicatedNode"
          class="w-full mt-2 font-sans text-sm font-medium text-left text-sd-yellow"
        >
          This website is duplicated in this hologram.
        </div>
      
      </div>
      <div
        class="flex flex-row mt-10"
      >
        <div
          class="px-3 py-6 mr-4 font-sans text-sm font-medium border rounded-sm border-sd-base00-bryellow text-sd-base1-brcyan bg-sd-base02-black"
        >
          Hologram
        </div>
        <button
          to="/hologram_list"
          class="flex flex-row flex-grow px-4 border border-sd-base00-bryellow focus:outline-none"
          @click="openHologramList"
        >
          <div
            class="flex flex-col my-auto"
          >
            <div
              class="my-auto font-sans text-sm font-light text-left text-sd-base1-brcyan"
            >
              {{ selectedHologramOwner }}
            </div>
            <div
              class="flex my-auto mt-1 font-sans text-base font-semibold text-left truncate text-sd-base2-white"
            >
              <span class="truncate w-36">{{ selectedHologramTitle }}</span>
            </div>
          </div>
          <div
            class="flex flex-row my-auto ml-auto"
          >
            <div
              v-if="!selectedHologramID"
              class="flex my-auto text-sd-base0-brblue"
            >
              Enter
            </div>
            <div
              class="flex w-8 h-8 m-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg"  class="w-4 h-4 m-auto fill-current text-sd-base0-brblue" viewBox="0 0 16 16">
                <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z"/>
              </svg>
            </div>
          </div>
          
          
        </button>
      </div>
      <div
        class="flex flex-row mt-5"
      >
        <button
          class="flex items-center flex-grow px-3 py-1 text-sm font-normal focus:ring-1 focus:ring-sd-base2-white focus:outline-none"
          :disabled="duplicatedNode || !selectedHologramID"
          v-bind:class="getUploadButtonStyle()"
          @click="upload"
        >
          <span class="m-auto">Upload to hologram</span> 
        </button>
        <div
          v-if="selectedHologramID"
          class="flex pl-3 m-auto text-sd-base0-brblue"
        >
          Enter
        </div>
      </div>
    </div>
  </div>
</template>
<script>
var browser = require("webextension-polyfill");
import { ref, onMounted, computed, watch } from "vue"
import { useStore } from "vuex";
export default {
  name: "ControlPanel",
  setup() {
    const store = useStore();
    
    const dataIsReady = ref(false);
    const selectedHologramTitle = ref("");
    const selectedHologramOwner = ref("")
    const hologramListOpen = computed(() => store.getters["control/hologramListOpen"]);
    const currentTabTitle = ref("")
    const currentTabUrl = ref("")
    const truncateCurrentTabUrl = ref(null)
    const holograms = computed(() => store.getters["hologram/holograms"]);
    const hologramNodes = computed(() => store.getters["hologram/hologramNodes"]);
    const selectedHologramID = computed(() => store.getters["hologram/selectedHologramID"]);
    const duplicatedNode = ref(false);

    const prepare = async () => {
      document.addEventListener("keydown", controlPanelKeyupEnterHandler)
      try {
        chrome.tabs.query({active:true, currentWindow:true}, (tab) => {
          store.dispatch("control/updateCurrentTabTitle", tab[0].title); 
          store.dispatch("control/updateCurrentTabUrl", tab[0].url); 
          currentTabTitle.value = tab[0].title
          currentTabUrl.value = tab[0].url
          truncateCurrentTabUrl.value = truncateString(currentTabUrl.value, 100)
          dataIsReady.value = true;
        })
      } catch(err){
        console.error(err);
      }
    };

    const controlPanelKeyupEnterHandler = (e) => {
      if ( e.key === "Enter" && !hologramListOpen.value ){
        upload();
      }
    }

    const getUploadButtonStyle = () => {

      if ( !selectedHologramID.value ){
        return "cursor-not-allowed bg-sd-base02-black text-sd-base00-bryellow"
      }

      if ( !duplicatedNode.value ){
        return "bg-sd-base00-bryellow text-sd-base2-white"
      } else {
        return "cursor-not-allowed bg-sd-base02-black text-sd-base00-bryellow"
      }
    }

    const openHologramList = () => {
      if (!hologramListOpen.value){
        store.dispatch("control/updateHologramListOpen", {data:true})
        document.removeEventListener("keydown", controlPanelKeyupEnterHandler)
      }
    }

    const upload = () => {
      if ( !selectedHologramID.value ){
        console.log("open!!!!", hologramListOpen.value)
        openHologramList();
        return;
      }
      
      if ( duplicatedNode.value === true ){
        return;
      }
      
      const data = {
        title: currentTabTitle.value,
        url: currentTabUrl.value,
        hologramID: selectedHologramID.value
      }
      browser.runtime.sendMessage({ "action":"upload", "data":data })
    }

    onMounted(prepare);

    watch( selectedHologramID, (newValue) => {
      const hologramIndex = holograms.value.findIndex( e => e.id === newValue )
      if ( hologramIndex !== -1 ){
        selectedHologramTitle.value = holograms.value[`${hologramIndex}`].title;
        selectedHologramOwner.value = holograms.value[`${hologramIndex}`].createdBy.username;
      }
      const hologramNodeIndex = hologramNodes.value.findIndex( e => e.hologramID === selectedHologramID.value && e.node.url === currentTabUrl.value );
      console.log(hologramNodes.value, selectedHologramID.value)
      if ( hologramNodeIndex !== -1 ){
        duplicatedNode.value = true;
      } else {
        duplicatedNode.value = false;
      }
    })

    watch( hologramListOpen, (newValue) => {
      if ( !newValue ){
        document.addEventListener("keydown", controlPanelKeyupEnterHandler)
      }
    })

    return {
      currentTabTitle,
      currentTabUrl,
      truncateCurrentTabUrl,
      dataIsReady,
      hologramListOpen,
      duplicatedNode,
      selectedHologramID,
      prepare,
      truncateString,
      openHologramList,
      getUploadButtonStyle,
      selectedHologramTitle,
      selectedHologramOwner,
      upload,
    }
  }
}

const truncateString = (string, length) => {
  if (string.length <= length) {
    return string
  }
  return string.slice(0, length) + '...'
}

</script>
<style>
    
</style>