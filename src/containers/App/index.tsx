import React from 'react'
import Chat from '../Chat'
import style from './index.module.less'

function App() {
  return (
    <div className={style.app}>
      <header className={style.appHeader}>
        <div>Typescript + Vite2</div>
        <Chat />
      </header>
    </div>
  )
}

export default App
