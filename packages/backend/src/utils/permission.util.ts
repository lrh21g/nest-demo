import { MenuEntity } from '~/modules/menu/menu.entity'
import { isExternal } from './is.util'
import { uniqueSlash } from './tool.util'

export interface RouteRecordRaw {
  id: Uuid
  path: string
  name: string
  component?: string
  redirect?: string
  meta: {
    title: string
    icon: string
    isExt: boolean
    extOpenMode: number
    type: number
    orderNo: number
    show: number
    activeMenu: string
    status: number
    keepAlive: number
  }
  children?: RouteRecordRaw[]
}

function createRoute(menu: MenuEntity, _isRoot): RouteRecordRaw {
  const commonMeta: RouteRecordRaw['meta'] = {
    title: menu.name,
    icon: menu.icon,
    isExt: menu.isExt,
    extOpenMode: menu.extOpenMode,
    type: menu.type,
    orderNo: menu.orderNo,
    show: menu.show,
    activeMenu: menu.activeMenu,
    status: menu.status,
    keepAlive: menu.keepAlive,
  }

  // 判断是否为外链
  if (isExternal(menu.path)) {
    return {
      id: menu.id,
      path: menu.path,
      // component: 'IFrame',
      name: menu.name,
      meta: { ...commonMeta },
    }
  }

  // 目录
  if (menu.type === 0) {
    return {
      id: menu.id,
      path: menu.path,
      component: menu.component,
      name: menu.name,
      meta: { ...commonMeta },
    }
  }

  return {
    id: menu.id,
    path: menu.path,
    name: menu.name,
    component: menu.component,
    meta: {
      ...commonMeta,
    },
  }
}

// 获取路由
function filterAsyncRoutes(menus: MenuEntity[], parentRoute: MenuEntity): RouteRecordRaw[] {
  const res: RouteRecordRaw[] = []

  menus.forEach((menu) => {
    if (menu.type === 2 || !menu.status) {
      // 如果是权限或被禁用，则直接跳过
      return
    }

    // 根级别菜单渲染
    let realRoute: RouteRecordRaw

    // 生成完整路径
    const genFullPath = (path: string, parentPath) => {
      // uniqueSlash 用于处理 URL 或路径字符串中的重复斜杠问题。
      return uniqueSlash(path.startsWith('/') ? path : `/${parentPath}/${path}`)
    }

    if (!parentRoute && !menu.parentId && menu.type === 0) {
      // 根目录
      const childRoutes = filterAsyncRoutes(menus, menu)

      realRoute = createRoute(menu, true)
      if (childRoutes && childRoutes.length > 0) {
        realRoute.redirect = genFullPath(childRoutes[0].path, realRoute.path)
        realRoute.children = childRoutes
      }
    }
    else if (!parentRoute && !menu.parentId && menu.type === 1) {
      // 根菜单
      realRoute = createRoute(menu, true)
    }
    else if (parentRoute && parentRoute.id === menu.parentId && menu.type === 0) {
      // 子目录，继续递归
      const childRoutes = filterAsyncRoutes(menus, menu)

      realRoute = createRoute(menu, false)
      if (childRoutes && childRoutes.length > 0) {
        realRoute.redirect = genFullPath(childRoutes[0].path, realRoute.path)
        realRoute.children = childRoutes
      }
    }
    else if (parentRoute && parentRoute.id === menu.parentId && menu.type === 1) {
      // 子菜单
      realRoute = createRoute(menu, false)
    }

    if (realRoute)
      res.push(realRoute)
  })
  return res
}

export function generatorRouters(menus: MenuEntity[]) {
  return filterAsyncRoutes(menus, null)
}

// 获取所有菜单以及权限
function filterMenuToTable(menus: MenuEntity[], parentMenu) {
  const res = []
  menus.forEach((menu) => {
    // 根级别菜单渲染
    let realMenu
    if (!parentMenu && !menu.parentId && menu.type === 0) {
      // menu.type 为  0 表示目录
      // 根目录：如果没有父菜单，且当前菜单 parentId 不存在，则递归获取子菜单
      const childMenu = filterMenuToTable(menus, menu)
      realMenu = { ...menu }
      realMenu.children = childMenu
    }
    else if (!parentMenu && !menu.parentId && menu.type === 1) {
      // menu.type 为  1 表示菜单
      // 根菜单：如果没有父菜单，且当前菜单 parentId 不存在，则递归获取子菜单
      const childMenu = filterMenuToTable(menus, menu)
      realMenu = { ...menu }
      realMenu.children = childMenu
    }
    else if (parentMenu && parentMenu.id === menu.parentId && menu.type === 0) {
      // 子目录，继续递归查找
      const childMenu = filterMenuToTable(menus, menu)
      realMenu = { ...menu }
      realMenu.children = childMenu
    }
    else if (parentMenu && parentMenu.id === menu.parentId && menu.type === 1) {
      // 子菜单，继续递归查找
      const childMenu = filterMenuToTable(menus, menu)
      realMenu = { ...menu }
      realMenu.children = childMenu
    }
    else if (parentMenu && parentMenu.id === menu.parentId && menu.type === 2) {
      // 权限
      realMenu = { ...menu }
    }
    if (realMenu) {
      realMenu.pid = menu.id
      res.push(realMenu)
    }
  })
  return res
}

export function generatorMenu(menu: MenuEntity[]) {
  return filterMenuToTable(menu, null)
}
