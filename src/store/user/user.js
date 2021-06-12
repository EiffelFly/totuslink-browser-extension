export const user = {
  namespaced: true,
  state: {
    userData: null
  },
  mutations: {
    mutateUserData: (state, payload) => {
      state.userData = payload;
    }
  },
  actions: {
    updateUserData: (context, {data}) => {
      context.commit("mutateUserData", data);
    }
  },
  getters: {
    userData: (state) => state.userData
  }
}