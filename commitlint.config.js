// @ts-check

/** @type {import("@commitlint/types").UserConfig} */
export default {
  ignores: [commit => commit.includes('init')],
  // 继承的规则
  extends: ['@commitlint/config-conventional'],
  // 定义规则类型
  rules: {
    // body 开头空行
    'body-leading-blank': [2, 'always'],
    // footer 开头空行
    'footer-leading-blank': [1, 'always'],
    // header 最大内容长度
    'header-max-length': [2, 'always', 108],
    // subject 是否允许为空
    'subject-empty': [2, 'never'],
    // type 是否允许空
    'type-empty': [2, 'never'],
    // type 类型定义，表示 git 提交的 type 必须在以下类型范围内
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新增功能
        'fix', // 修复 bug
        'docs', // 文档变更
        'style', // 代码格式（不影响功能，例如空格、分号等格式修正）
        'refactor', // 代码重构（不包括 bug 修复、功能新增）
        'perf', // 性能优化
        'test', // 添加、修改测试用例
        'build', // 构建流程、外部依赖变更（如升级 npm 包、修改 webpack 配置等
        'ci', // 修改 CI 配置、脚本
        'chore', // 对构建过程或辅助工具和库的更改（不影响源文件、测试用例
        'revert', // 回滚 commit
      ],
    ],
  },
}
