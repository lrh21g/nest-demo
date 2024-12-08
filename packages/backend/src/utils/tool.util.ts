import { nanoid } from 'nanoid'

export function generateUUID(size: number = 21): string {
  return nanoid(size)
}

export function generateShortUUID(): string {
  return nanoid(10)
}

export function getVariableName<TResult>(
  getVar: () => TResult,
): string | undefined {
  const m = /\(\)=>(.*)/.exec(
    getVar.toString().replaceAll(/(\r\n|\s)/g, ''),
  )

  if (!m) {
    throw new Error(
      'The function does not contain a statement matching \'return variableName;\'',
    )
  }

  const fullMemberName = m[1]!

  const memberParts = fullMemberName.split('.')

  return memberParts.at(-1)
}

// 用于处理 URL 或路径字符串中的重复斜杠问题。
export const uniqueSlash = (path: string) => path.replace(/(https?:\/)|(\/)+/g, '$1$2')
