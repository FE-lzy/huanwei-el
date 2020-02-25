import { getInfo } from '@/api/user'
import _func from '@/func/main'
import { resetRouter } from '@/router'

const state = {
  name: '',
  avatar: '',
}

const mutations = {
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // user login
  login({ commit }, postdata) {
    return new Promise((resolve, reject) => {
      postdata.customerId = 'wz';
      _func.post('/user/login', postdata, false).then(res => {
        console.log(res.data.token);
        _func.SetToken('token', res.data.token);
        // commit('SET_TOKEN', res.data.token)
        resolve({ status: 'success' });
      }, res => {
        reject(res);
      });
    });
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      // commit('SET_TOKEN', '')
      _func.RemoveToken('token')
      resetRouter()
      resolve()
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      // commit('SET_TOKEN', '')
      _func.RemoveToken('token')
      resolve()
    })
  }
}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

