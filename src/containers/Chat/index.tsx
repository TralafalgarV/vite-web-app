import React, { useEffect, useRef, useState } from 'react'
import { Input } from 'antd'
import { IM, ChatMessage, ChatUserInfo } from '../../components/IM'
import { Strophe } from 'strophe'
import 'antd/dist/antd.less'

const { TextArea } = Input

interface ChatRef {
  im: IM | null
  currentTopic: string | null
  userInfo: ChatUserInfo
  totalSize: number
}

const Chat: React.FC = () => {
  const [content, setContent] = useState('')
  const [chatArr, setChatArr] = useState<ChatMessage[]>([])
  const curRef = useRef<ChatRef>({
    im: null,
    currentTopic: null, // 当前聊天
    userInfo: { purchaserID: 0, purchaserUserID: 0 },
    totalSize: 0
  })

  useEffect(() => {
    curRef.current.im = new IM({ purchaserID: 1491, purchaserUserID: 190819 }, onMessage, onStatus)
    curRef.current.im.onIntoRoom({
      topic: '2_4220_1491'
    })
  }, [])

  function onMessage(currentContent: ChatMessage) {
    setChatArr((pre) => {
      pre.push(currentContent)
      return pre
    })
  }

  function onStatus(status: Strophe.Status) {}

  /**
   * 发送消息
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
      {chatArr.map((value, index) => {
        return <div key={index}>{value.content}</div>
      })}
      <TextArea
        allowClear
        value={content}
        onChange={(e) => {
          setContent(e.target.value)
        }}
        onPressEnter={(e) => onSend('text', content, e)}
      />
    </div>
  )
}

export default Chat
