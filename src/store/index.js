import { createStore } from 'vuex';
import { control } from "./control/control.js"
import { hologram } from "./hologram/hologram.js"
import { user } from "./user/user.js"

export default createStore({
  modules: {
    control,
    hologram,
    user
  }
})
