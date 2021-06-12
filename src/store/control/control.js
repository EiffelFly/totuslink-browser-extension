export const control = {
  namespaced: true,
  state: {
    hologramListOpen: false,
    currentTabUrl: null,
    currentTabTitle: null
  },
  mutations: {
    mutateHologramListOpen: (state, payload) => {
      state.hologramListOpen = payload;
    },
    mutateCurrentTabUrl: (state, payload) => {
      state.currentTabUrl = payload;
    },
    mutateCurrentTabTitle: (state, payload) => {
      state.currentTabTitle = payload;
    }
  },
  actions: {
    updateHologramListOpen: (context, {data}) => {
      context.commit("mutateHologramListOpen", data);
    },
    updateCurrentTabUrl: (context, {data}) => {
      context.commit("mutateCurrentTabUrl", data);
    },
    updateCurrentTabTitle: (context, {data}) => {
      context.commit("mutateCurrentTabTitle", data);
    }
  },
  getters: {
    hologramListOpen: (state) => state.hologramListOpen,
    currentTabUrl: (state) => state.currentTabUrl,
    currentTabTitle: (state) => state.currentTabTitle
  }
}