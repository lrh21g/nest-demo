import bcrypt from 'bcrypt'

// 生成密码或字符串哈希值（hash）
export function generateHash(password: string): string {
  // 同步方式对密码进行哈希，10 是 salt rounds，表示加密时生成盐值的强度（越高安全性越高，但速度越慢）。
  return bcrypt.hashSync(password, 10)
}

// 验证密码是否与存储的哈希值（hash）匹配
export function validateHash(
  password: string | undefined,
  hash: string | undefined | null,
): Promise<boolean> {
  // 如果 password 或 hash 无效（undefined 或 null），直接返回一个失败的 Promise，即 false。
  if (!password || !hash) {
    return Promise.resolve(false)
  }

  // 使用 bcrypt.compare(password, hash) 来比较明文密码和哈希值。
  // compare 是异步的，它返回一个 Promise，结果为 true 或 false。
  return bcrypt.compare(password, hash)
}
