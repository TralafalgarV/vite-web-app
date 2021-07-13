// 此配置作用于 lint-staged 命令的 prettierrc
module.exports = {
  printWidth: 100, // 一行的字符数，如果超过会进行换行，默认为80，官方建议设100-120其中一个数
  trailingComma: 'none', // 是否使用尾逗号，有三个可选值"<none|es5|all>"
  tabWidth: 2, // 一个tab代表几个空格数，默认就是2
  semi: false,
  singleQuote: true
}
