import path from 'node:path'

export const ROOT_DIR = path.join(__dirname, '..', '..', '..', '..')
export const PACKAGES_DIR = path.join(ROOT_DIR, 'packages')
export const BACKEND_DIR = path.join(PACKAGES_DIR, 'backend')
