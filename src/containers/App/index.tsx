import React from 'react'
import Chat from '../Chat'
import style from './index.module.less'
import 'antd/dist/antd.less'

function App() {
  return (
    <div className={style.App}>
      <header className={style.AppHeader}>
        <div>Typescript + Vite2</div>
        <Chat />
      </header>
    </div>
  )
}

export default App
