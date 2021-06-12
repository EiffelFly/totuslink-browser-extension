<template>
  <div
    class="w-full h-full bg-sd-base03-brblack"
  >
    <div
      v-show="!hologramListOpen && userAuthenticated && !loadingData"
      class="flex flex-col w-full h-full"
    >
      <div
        class="flex flex-grow w-full px-6 pt-6 pb-2"
      >
        <ControlPanel />
      </div>
      <div
        class="flex flex-row flex-shrink-0 px-6 py-3 mt-2"
      >
        <div
          class="flex flex-row mr-4"
        >
          <div
            class="p-1 mr-2 font-sans border rounded-lg shadow-2xl border-sd-base01-brgreen text-sd-base0-brblue"
          >
            esc
          </div>
          <div
            class="my-auto font-sans text-xs text-sd-base0-brblue"
          >
            to close
          </div>
        </div>
        <div
          class="flex flex-row"
        >
          <div
            class="py-1 px-1.5 mr-2 font-sans border rounded-lg shadow-2xl border-sd-base01-brgreen text-sd-base0-brblue"
          >
            alt
          </div>
          <div
            class="py-1 px-2.5 mr-2 font-sans border rounded-lg shadow-2xl border-sd-base01-brgreen text-sd-base0-brblue"
          >
            shift
          </div>
          <div
            class="py-1 px-2.5 mr-2 font-sans border rounded-lg shadow-2xl border-sd-base01-brgreen text-sd-base0-brblue"
          >
            e
          </div>
          <div
            class="my-auto font-sans text-xs text-sd-base0-brblue"
          >
            to open
          </div>
        </div>
      </div>
    </div>
    <div
      v-show="hologramListOpen && userAuthenticated && !loadingData"
      class="w-full h-full"
    >
      <HologramList />
    </div>
    <div
      v-show="!userAuthenticated && !loadingData"
      class="w-full h-full p-6"
    >
      <RequestAuth />
    </div>
    <div
      v-show="loadingData"
      class="flex flex-col w-full h-full"
    >
      <svg class="w-5 h-5 m-auto animate-spin text-sd-base0-brblue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  </div>
</template>

<script>
var browser = require("webextension-polyfill");
import { ref } from "vue"
import { computed, onMounted } from "vue"
import { useStore } from "vuex";
import ControlPanel from "../components/ControlPanel.vue"
import HologramList from "../components/HologramList.vue"
import RequestAuth from "../components/RequestAuth.vue"
export default {
  name: 'Popup',
  components:{
    ControlPanel,
    HologramList,
    RequestAuth
  },
  setup() {
    
    const store = useStore();
    const hologramListOpen = computed(() => store.getters["control/hologramListOpen"]);
    const userAuthenticated = ref(false);
    const loadingData = ref(true);

    

    const prepare = async () => {
      try {
        const userIdToken = await getCurrentUser();
        console.log(userIdToken)
        if (userIdToken){
          browser.runtime.sendMessage({"action":"constructAuth"})
        } 
      } catch(err){
        loadingData.value = false;
        console.error("Something went wrong when fetching cookie", err)
        return;
      }
      browser.runtime.onMessage.addListener((message) => {
        if ( message.action === "constructAuth" && message.status === "Success" ){
          browser.runtime.sendMessage({"action":"constructClient"});
        }
      })
      browser.runtime.onMessage.addListener((message) => {
        if ( message.action === "constructAuth" && message.status === "Failed" ){
          console.log("Construct auth failed")
          loadingData.value = false;
        }
      })
      browser.runtime.onMessage.addListener((message) => {
        if ( message.action === "constructClient" && message.status === "Success" ){
          browser.runtime.sendMessage({"action":"getUserData"});
        }
      })
      browser.runtime.onMessage.addListener((message) => {
        if ( message.action === "getUserData" && message.status === "Failed" ){
          console.log("failedddd")
          loadingData.value = false;
          browser.runtime.sendMessage({"action":"resetUserToken"})
        }
      })
      browser.runtime.onMessage.addListener((message) => {
        if ( message.action === "getUserData" && message.status === "Success" ){
          userAuthenticated.value = true;
          store.dispatch("user/updateUserData", { data:message.data })
          store.dispatch("hologram/updateHolograms", { data:message.data.hologram.items })
          browser.runtime.sendMessage({"action":"getHologramNodes"});
        }
      })
      browser.runtime.onMessage.addListener((message) => {
        if ( message.action === "getHologramNodes" && message.status === "Success" ){
          store.dispatch("hologram/updateHologramNodes", { data:message.data })
          loadingData.value = false;
          console.log(message)
        }
      })
      browser.runtime.onMessage.addListener((message) => {
        if ( message.action === "upload" && message.status === "Success" ){
          window.close();
        }
      })
    };
    
    onMounted(prepare)


    return {
      hologramListOpen,
      userAuthenticated,
      loadingData
    }

  }
  
}
const getCurrentUser = async () => {
  try {
    const currentUserIdToken = await browser.cookies.get({"url":"https://www.totuslink.com", "name":"idToken"})
    return Promise.resolve(currentUserIdToken.value);
  } catch(err){
    return Promise.reject(err)
  }
}


</script>

<style>
html {
  width: 400px;
  height: 360px;
}

#app{
  width: 100%;
  height: 100%;
}

body {
  width: 100%;
  height: 100%;
}
</style>
