export const hologram = {
  namespaced: true,
  state: {
    holograms: [],
    hologramNodes: [],
    selectedHologramID: null
  },
  mutations: {
    mutateHolograms: (state, payload) => {
      state.holograms = payload;
    },
    mutateHologramNodes: (state, payload) => {
      state.hologramNodes = payload;
    },
    mutateSelectedHologramID: (state, payload) => {
      state.selectedHologramID = payload;
    }
  },
  actions: {
    updateHolograms: (context, {data}) => {
      context.commit("mutateHolograms", data);
    },
    updateHologramNodes: (context, {data}) => {
      context.commit("mutateHologramNodes", data)
    },
    updateSelectedHologramID: (context, {data}) => {
      context.commit("mutateSelectedHologramID", data);
    }
  },
  getters: {
    holograms: (state) => state.holograms,
    hologramNodes: (state) => state.hologramNodes,
    selectedHologramID: (state) => state.selectedHologramID,
  }
}