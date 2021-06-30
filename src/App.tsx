import React from 'react'
import { DatePicker, Space } from 'antd';
import style from "./App.module.less";
import "antd/lib/style/index.css";

function App() {
  function onChange(date:any, dateString:String) {
    console.log(date, dateString);
  }

  return (
    <div className={style.App}>
      <header className={style.AppHeader}>
        <div>Typescript + Vite2</div>
        <Space direction="vertical">
        <DatePicker onChange={onChange} />
        <DatePicker onChange={onChange} picker="week" />
        <DatePicker onChange={onChange} picker="month" />
        <DatePicker onChange={onChange} picker="quarter" />
        {/* <DatePicker onChange={onChange} picker="year" /> */}
  </Space>
      </header>
    </div>
  )
}

export default App
