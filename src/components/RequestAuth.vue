<template>
  <div
    class="flex w-full h-full"
  >
    <div
      class="flex flex-col w-10/12 m-auto"
    >
      <div
        class="font-sans text-base font-normal text-center text-sd-base2-white"
      >
        To use Totuslink browser extension, Please login in or create a new account.
      </div>
      <button
        class="flex w-24 px-3 py-1 mx-auto mt-4 border rounded-sm border-sd-base01-brgreen"
        @click="openTotuslinkLoginPage"
      >
        <div
          class="mx-auto font-sans text-base text-sd-base0-brblue"
        >
          Login
        </div>
      </button>
    </div>
  </div>
</template>
<script>
var browser = require("webextension-polyfill");
export default {
  name: "HologramList",
  setup() {
    const openTotuslinkLoginPage = () => {
      browser.tabs.create({'url':'https://www.totuslink.com/login'})
    }

    return {
      openTotuslinkLoginPage
    }
  }
};
</script>
<style>
</style>
