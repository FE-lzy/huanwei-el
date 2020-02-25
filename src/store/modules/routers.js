const state = {
    childRouter: []
}

const mutations = {
    SET_CHILDROUTER: (state, childRouter) => {
        state.childRouter = childRouter
    }
}

const actions = {
    changeChildRouter({ commit }, data) {
        commit('SET_CHILDROUTER', data)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}