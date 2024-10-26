const { cpus } = require('node:os')
// const process = require('node:process')

// 获取当前系统 CPU 的核心数量，通常用于决定要启动的应用实例数量。
const cpuLen = cpus().length

module.exports = {
  apps: [
    {
      // 应用程序名称（默认为不带扩展名的脚本文件名）
      name: 'nest-demo-backend',
      // 相对于 pm2 启动的脚本路径
      script: './dist/main.js',
      // 是否自动重启
      autorestart: true,
      // 启动应用程序的模式，可以是 'cluster'（默认） 或 'fork'
      // cluster 模式 : 多实例多进程，但是只支持 node，端口可以复用，不需要额外的端口配置。零代码实现负载均衡，PM2 会将请求分发到各个实例，平衡负载。更加稳定，若某个实例崩溃，其他实例仍然可以继续处理请求
      // fork 模式 : 单实例多进程，常用于多语言混编，比如 php、python等，不支持端口复用，需要自己做应用的端口分配和负载均衡的子进程业务代码
      exec_mode: 'cluster',
      // 是否启用监视和重启功能，如果文件夹或子文件夹中的文件发生更改，您的应用程序将重新加载
      watch: false,
      // 要启动的应用实例数量
      // 自动根据 CPU 核心数启动相应数量的实例，以充分利用系统资源
      instances: cpuLen,
      // 如果超过指定的内存量，应用程序将重新启动。可以是“10M”、“100K”、“2G”等等……
      // 此处表示当应用程序使用超过 1GB 的内存时将自动重启
      max_memory_restart: '1G',
      // 传递给脚本的所有参数的字符串
      args: '',
      // 将出现在应用程序中的 env 变量
      env: {
        // NODE_ENV: 'production',
        // PORT: process.env.APP_BACKEND_PORT,
      },
    },
  ],
}
