// 作用于保存时进行eslint检查
module.exports = {
  parser:  '@typescript-eslint/parser', // 定义ESLint的解析器
  extends: [
    'plugin:react/recommended', 
    'plugin:@typescript-eslint/recommended', 
    'prettier/@typescript-eslint', 
    'plugin:prettier/recommended'
  ],
  env:{                          // 指定代码的运行环境
    browser: true,
    node: true,
  },
  settings: {             // 自动发现React的版本，从而进行规范react代码
    "react": {
      "pragma": "React",
      "version": "detect"
    }
  },
  parserOptions: {        //指定ESLint可以解析JSX语法
    ecmaVersion: 2020,    // 允许解析较新的ES特性
    sourceType: 'module',
    ecmaFeatures:{
      jsx:true
    }
  },
  plugins: ['@typescript-eslint'], //定义了该eslint文件所依赖的插件
  rules: {
    'react/prop-types': [0],
    'prettier/prettier': [
      'error',
      {
        printWidth: 100,
        trailingComma: 'none',
        tabWidth: 2,
        semi: false,
        singleQuote: true
      }
    ]
  }
}
  