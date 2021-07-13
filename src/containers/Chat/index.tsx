import React, { useEffect, useRef, useState } from 'react'
import { TextareaItem } from 'antd-mobile'
import { IM, ChatMessage, ChatUserInfo } from '../../components/IM'
import style from './index.module.less'

interface ChatRef {
  im: IM | null
  currentTopic: string | null
  userInfo: ChatUserInfo
  totalSize: number
  preCode: string
}

const Chat: React.FC = () => {
  const [content, setContent] = useState('')
  const [chatArr, setChatArr] = useState<ChatMessage[]>([])
  const curRef = useRef<ChatRef>({
    im: null,
    currentTopic: null, // 当前聊天
    userInfo: { purchaserID: 0, purchaserUserID: 0 },
    totalSize: 0,
    preCode: ''
  })

  useEffect(() => {
    curRef.current.im = new IM({ purchaserID: 1491, purchaserUserID: 190819 }, onMessage, onStatus)
    curRef.current.im.onIntoRoom({
      topic: '2_4220_1491'
    })
  }, [])

  /**
   * 聊天消息处理函数
   * @param {ChatMessage} currentContent
   */
  function onMessage(currentContent: ChatMessage) {
    console.log('message => ', currentContent)
    setChatArr((pre) => [...pre, currentContent])
  }

  /**
   * 状态变更处理函数
   * @param {Strophe.Status} status
   */
  function onStatus(status: Strophe.Status) {}

  /**
   * 发送消息
   *
   * @param {string} dataType
   * @param {string} content
   * @param {*} e
   */
  function onSend(dataType: string, content: string, e: any) {
    e && e.preventDefault() && e.stopPropagation()
    const data = {
      content,
      dataType,
      serviceType: 0,
      from: 4,
      groupID: 1491
    }
    // 发送内容
    curRef.current.im &&
      curRef.current.im.onSend(data, {
        topic: '2_4220_1491'
      })
    // 清除输入框
    setContent('')
  }

  return (
    <div>
      {chatArr.map((value) => {
        return <div key={value.time}>{value.content}</div>
      })}
      <textarea
        className={style.textArea}
        placeholder="您想咨询什么"
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
        }}
        onKeyDown={(e) => {
          console.log('code ', e.code)
          e.code === 'Enter' && onSend('text', content, e)
          curRef.current.preCode = e.code // 记录前一个输入类型
        }}
      />
    </div>
  )
}

export default Chat
