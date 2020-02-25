import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    redirect: '/monitor/location',
    name: '首页',
    hidden: true
  },
  {
    path: '/monitor',
    component: Layout,
    redirect: '/monitor/location',
    name: '综合监控',
    meta: { title: '综合监控', icon: 'example' },
    children: [
      {
        path: 'location',
        name: '定位监控',
        component: () => import('@/views/monitor/location/index.vue'),
        meta: { title: '定位监控', icon: 'location' }
      },
      {
        path: 'travel',
        name: '轨迹回放',
        component: () => import('@/views/monitor/travel/index.vue'),
        meta: { title: '轨迹回放', icon: 'travel' }
      }
    ]
  },
  {
    path: '/task',
    component: Layout,
    name: '作业管理',
    redirect: '/task/road',
    meta: { title: '作业管理', icon: 'travel' },
    children: [
      {
        path: 'road',
        name: '作业道路设置',
        component: () => import('@/views/task/road/index.vue'),
        redirect: '/task/road/list',
        meta: { title: '作业道路设置', icon: 'road' },
        children: [
          {
            path: 'list',
            name: '作业道路设置',
            component: () => import('@/views/task/road/list.vue'),
            meta: { title: '作业道路设置', icon: 'road', breadlevel: [1, 1, 0] }
          },
          {
            path: 'edit',
            name: '编辑道路',
            hidden: true,
            component: () => import('@/views/task/road/edit.vue'),
            meta: { title: '编辑道路', icon: 'road', backmenu: '/task/road/list', breadlevel: [0, 0, 1] }
          },
          {
            path: 'build',
            name: '新增道路',
            hidden: true,
            component: () => import('@/views/task/road/build.vue'),
            meta: { title: '新增道路', icon: 'road', backmenu: '/task/road/list', breadlevel: [0, 0, 1] }
          }
        ]
      },
      {
        path: 'cleanroute',
        name: '转运路线设置',
        redirect: '/task/cleanroute/list',
        component: () => import('@/views/task/cleanroute/index.vue'),
        meta: { title: '转运路线设置', icon: 'cleanroute' },
        children: [
          {
            path: 'list',
            name: '转运路线设置',
            component: () => import('@/views/task/cleanroute/list.vue'),
            meta: { title: '转运路线设置', icon: 'cleanroute', breadlevel: [1, 1, 0] }
          },
          {
            path: 'edit',
            name: '编辑转运路线',
            hidden: true,
            component: () => import('@/views/task/cleanroute/edit.vue'),
            meta: { title: '编辑转运路线', icon: 'cleanroute', backmenu: '/task/cleanroute/list', breadlevel: [0, 0, 1] }
          },
          {
            path: 'build',
            name: '新增转运路线',
            hidden: true,
            component: () => import('@/views/task/cleanroute/build.vue'),
            meta: { title: '新增转运路线', icon: 'cleanroute', backmenu: '/task/cleanroute/list', breadlevel: [0, 0, 1] }
          }
        ]
      },
      {
        path: 'category',
        name: '作业班次设置',
        redirect: '/task/category/list',
        component: () => import('@/views/task/category/index-1.vue'),
        children: [
          {
            path: 'list',
            name: '作业班次设置',
            component: () => import('@/views/task/category/index.vue'),
            meta: { title: '作业班次设置', icon: 'category' }
          },
          {
            path: 'categoryadd',
            name: '新增作业班次',
            hidden: true,
            component: () => import('@/views/task/category/model/addOredit.vue'),
            meta: { title: '新增作业班次', icon: 'vehicle', backmenu: '/task/category/list', breadlevel: [0, 1] }
          }
        ]
      },

      {
        path: 'plan',
        name: '作业道路计划',
        component: () => import('@/views/task/plan/index-1.vue'),
        redirect: '/task/plan/list',
        children: [
          {
            path: 'list',
            name: '作业道路计划',
            component: () => import('@/views/task/plan/index.vue'),
            meta: { title: '作业道路计划', icon: 'plan' }
          },
          {
            path: 'planadd',
            name: '新增作业计划',
            hidden: true,
            component: () => import('@/views/task/plan/model/addOredit.vue'),
            meta: { title: '新增作业计划', icon: 'vehicle', backmenu: '/task/plan/list', breadlevel: [0, 1] }
          }
        ]
      }
    ]
  },
  {
    path: '/info',
    component: Layout,
    name: '信息管理',
    redirect: '/info/vehicle',
    meta: { title: '信息管理', icon: 'vehicle' },
    children: [
      {
        path: 'vehicle',
        name: '车辆管理',
        component: () => import('@/views/info/vehicle/index.vue'),
        meta: { title: '车辆管理', icon: 'vehicle' }
      },
      {
        path: 'device',
        name: '设施管理',
        component: () => import('@/views/info/device/index.vue'),
        redirect: '/info/device/list',
        meta: { title: '设施管理', icon: 'vehicle' },
        children: [
          {
            path: 'list',
            name: '设施管理',
            component: () => import('@/views/info/device/list.vue'),
            meta: { title: '设施管理', icon: 'vehicle', breadlevel: [1, 1, 0] }
          },
          {
            path: 'edit',
            name: '编辑设施',
            hidden: true,
            component: () => import('@/views/info/device/edit.vue'),
            meta: { title: '编辑设施', icon: 'vehicle',backmenu: '/info/device/list', breadlevel: [0, 0, 1] }
          },
          {
            path: 'build',
            name: '新增设施',
            hidden: true,
            component: () => import('@/views/info/device/build.vue'),
            meta: { title: '新增设施', icon: 'vehicle',backmenu: '/info/device/list', breadlevel: [0, 0, 1] }
          }
        ]
      },
      {
        path: 'carInfo',
        name: '车辆详情',
        hidden: true,
        component: () => import('@/views/info/carInfo/index.vue'),
        meta: { title: '车辆详情', icon: 'vehicle', backmenu: '/monitor/location', breadlevel: [0, 1] }
      },
      {
        path: 'example',
        name: 'Form',
        hidden: true,
        component: () => import('@/views/info/example.vue'),
        meta: { title: '组件', icon: 'vehicle' }
      }
    ]
  },
  // {
  //   path: '/nested',
  //   component: Layout,
  //   redirect: '/nested/menu1',
  //   name: 'Nested',
  //   meta: {
  //     title: 'Nested',
  //     icon: 'nested'
  //   },
  //   children: [
  //     {
  //       path: 'menu1',
  //       component: () => import('@/views/nested/menu1/index'), // Parent router-view
  //       name: 'Menu1',
  //       meta: { title: 'Menu1' },
  //       children: [
  //         {
  //           path: 'menu1-1',
  //           component: () => import('@/views/nested/menu1/menu1-1'),
  //           name: 'Menu1-1',
  //           meta: { title: 'Menu1-1' }
  //         },
  //         {
  //           path: 'menu1-2',
  //           component: () => import('@/views/nested/menu1/menu1-2'),
  //           name: 'Menu1-2',
  //           meta: { title: 'Menu1-2' },
  //           children: [
  //             {
  //               path: 'menu1-2-1',
  //               component: () => import('@/views/nested/menu1/menu1-2/menu1-2-1'),
  //               name: 'Menu1-2-1',
  //               meta: { title: 'Menu1-2-1' }
  //             },
  //             {
  //               path: 'menu1-2-2',
  //               component: () => import('@/views/nested/menu1/menu1-2/menu1-2-2'),
  //               name: 'Menu1-2-2',
  //               meta: { title: 'Menu1-2-2' }
  //             }
  //           ]
  //         },
  //         {
  //           path: 'menu1-3',
  //           component: () => import('@/views/nested/menu1/menu1-3'),
  //           name: 'Menu1-3',
  //           meta: { title: 'Menu1-3' }
  //         }
  //       ]
  //     },
  //     {
  //       path: 'menu2',
  //       component: () => import('@/views/nested/menu2/index'),
  //       meta: { title: 'menu2' }
  //     }
  //   ]
  // },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
