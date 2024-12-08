export type TreeNode<T = any> = T & {
  id: Uuid
  parentId: number
  children?: TreeNode<T>[]
}

export type ListNode<T extends object = any> = T & {
  id: Uuid
  parentId: number
}

/**
 * 将一个扁平化的列表转换成树形结构
 * @param items 扁平化列表数据
 * @param parentId 当前节点的 parentId，默认为 null
 */
export function list2Tree<T extends ListNode[]>(
  items: T,
  parentId: number | null = null,
): TreeNode<T[number]>[] {
  return items
    .filter(item => item.parentId === parentId) // 筛选出当前 parentId 对应的所有子节点
    .map((item) => {
      // 递归获取子节点
      const children = list2Tree(items, item.id)
      return {
        ...item, // 保留当前节点的其他属性
        ...(children.length ? { children } : null), // 如果有子节点，则将其包含在节点中
      }
    })
}

/**
 * 将树形结构转换为列表形式，并根据指定的条件过滤树中的节点。
 * @param treeData 树形结构数据
 * @param key 用于过滤的字段
 * @param value 用于过滤的值
 */
export function filterTree2List(treeData, key, value) {
  const filterChildrenTree = (resTree, treeItem) => {
    // 如果当前节点的指定 key 值包含指定的 value，保留当前节点
    if (treeItem[key].includes(value)) {
      resTree.push(treeItem)
      return resTree
    }

    if (Array.isArray(treeItem.children)) {
      // 递归地遍历子节点，得到符合条件的子节点数组
      const children = treeItem.children.reduce(filterChildrenTree, [])

      // 将子节点（符合条件的）合并到当前节点中
      const data = { ...treeItem, children }

      if (children.length)
        resTree.push({ ...data })
    }
    return resTree
  }

  return treeData.reduce(filterChildrenTree, [])
}

/**
 * 过滤树，并保留原有的结构
 * @param treeData 树形结构数据
 * @param predicate 筛选条件函数，返回值为 true 时保留节点
 */
export function filterTree<T extends TreeNode>(
  treeData: TreeNode<T>[],
  predicate: (data: T) => boolean,
): TreeNode<T>[] {
  function filter(treeData: TreeNode<T>[]): TreeNode<T>[] {
    if (!treeData?.length)
      return treeData

    return treeData.filter((data) => {
      if (!predicate(data))
        return false

      data.children = filter(data.children)
      return true
    })
  }

  return filter(treeData) || []
}

// 删除没有子节点的菜单项（即 children 数组为空的菜单项）
export function deleteEmptyChildren(arr: any) {
  arr?.forEach((node) => {
    if (node.children?.length === 0)
      delete node.children
    else
      deleteEmptyChildren(node.children)
  })
}
