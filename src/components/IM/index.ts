import moment from 'dayjs'
import { Strophe } from '../Strophe/strophe.esm'

const im_bosh_service_dev = 'http://172.20.5.169:7070/http-bind/'
const im_bosh_service_pro = 'http://im.22city.cn:7070/http-bind/'
const BOSH_SERVICE = true ? im_bosh_service_dev : im_bosh_service_pro

export interface ChatUserInfo {
  purchaserID: number
  purchaserUserID: number
}

export interface ChatOrigin {
  topic: string
  receiverLogo?: string
  reveiverName?: string
  unreadCount?: number
}

export interface ChatMessage {
  time: string | null
  other: boolean
  isNewMsg: boolean
  topic: string
  content: string
  type: string
}

export class IM {
  /*属性声明*/
  private status = Strophe.Status.ERROR
  private joined = new Map() // 已加入房间的主题
  private unsentQueue = new Map() // 未发送消息队列
  private connection = new Strophe.Connection(BOSH_SERVICE)
  private reconnectStatus = [
    Strophe.Status.CONNFAIL,
    Strophe.Status.AUTHFAIL,
    Strophe.Status.DISCONNECTED, // 连接已关闭
    Strophe.Status.ERROR
  ]

  constructor(
    public userInfo: ChatUserInfo,
    public onPageMessage = (msg: ChatMessage) => {},
    public onPageStatus = (status: Strophe.Status) => {}
  ) {
    this.connectHome()
  }

  connectHome() {
    if (Strophe.Status.CONNECTING == this.status) {
      // 如果正在连接，退出函数
      return
    }
    const { purchaserUserID, purchaserID } = this.userInfo
    this.connection.connect(
      `5_${purchaserID}@im.22city.cn/5_1_${purchaserUserID}`,
      `5_${purchaserID}`,
      this.onConnect.bind(this)
    )
  }

  onMessage(msg: Element) {
    const { purchaserID } = this.userInfo
    const from = msg.getAttribute('from') as string
    const type = msg.getAttribute('type')
    // const dataType =  msg.getAttribute('dataType');
    const elems = msg.getElementsByTagName('body')
    const delay = msg.getElementsByTagName('delay')
    const isNewMsg = !Boolean(delay && delay[0])
    const time = delay && delay[0] ? delay[0].getAttribute('stamp') : moment().format()
    const content = elems.length > 0 ? `${elems[0].innerHTML}` : ''
    if (type == 'error') {
      return false
    }
    if (type == 'groupchat' && content) {
      console.log('object', JSON.parse(content))
      try {
        const JsonContent = JSON.parse(content)
        const other =
          `${JsonContent.groupID}` != `${purchaserID}` && JsonContent.dataType !== 'system'
        let temp = {
          time,
          other,
          isNewMsg,
          topic: from.split('@')[0],
          content: JsonContent.content,
          type: JsonContent.dataType || 'text'
          // logo: other ? receiverLogo : senderLogo,
        }
        this.onPageMessage(temp)
      } catch (e) {
        console.warn(e)
      }
    }
    return true
  }

  async onConnect(status: Strophe.Status) {
    const {
      CONNFAIL,
      AUTHFAIL,
      DISCONNECTED,
      CONNECTED, // 5 连接成功
      CONNECTING // 1 正在链接
    } = Strophe.Status
    this.onPageStatus(status) // 通知页面状态
    this.status = status
    switch (status) {
      case CONNECTING:
        console.log('正在链接')
        break
      case CONNFAIL: // 链接失败
        console.log('链接失败')
        this.connectHome()
        break
      case AUTHFAIL: // 登录失败
        console.log('登录失败')
        break
      case DISCONNECTED: // 链接已经断开
        console.log('链接已经断开')
        // 重新链接
        // this.connectHome();
        break
      case CONNECTED: // 链接成功
        console.log('链接成功')
        this.connection.addHandler(this.onMessage.bind(this), '', 'message')
        this.connection.send($pres().tree())
        // 连接成功判断->房间列表 重新加入，未发送消息队列 依次发送
        await this.onReconnectIntoRoom()
          .then(() => {
            this.onReconnectSend()
          })
          .catch((err) => err)
        break
      default:
    }
  }

  // 发送未发出消息队列
  onReconnectSend() {
    for (let [chatOrigin, data] of this.unsentQueue) {
      if (this.onSend(data, chatOrigin, true)) {
        // 如果加入失败，退出加入其他，重新连接
        this.unsentQueue.delete(chatOrigin) // 如果发送成功，弹出消息；
      } else {
        break
      }
    }
  }

  onSend(data: any, chatOrigin: ChatOrigin, isOnQueue = false) {
    if (!data.content || data.content.trim().length === 0 || !chatOrigin) {
      return true
    }
    if (Strophe.Status.CONNECTING == this.status) {
      // 如果正在连接，退出函数
      return false
    } else if (this.reconnectStatus.includes(this.status)) {
      // 如果需要重新连接
      if (!isOnQueue) {
        // 若不在未发消息队列中，加入队列
        this.unsentQueue.set(chatOrigin, data)
      }
      this.connectHome() // 账号重连
      return false // 消息发送失败
    } else {
      // 发送消息
      const { purchaserUserID } = this.userInfo
      const msg = $msg({
        from: `${purchaserUserID}@im.22city.cn/${purchaserUserID}pc`,
        to: `${chatOrigin.topic}@conference.im.22city.cn`,
        type: 'groupchat'
      }).c('body', null, JSON.stringify(data))
      this.connection.send(msg.tree())
      return true // 消息发送成功
    }
  }

  onReconnectIntoRoom = () => {
    return new Promise((resolve, reject) => {
      for (let { 1: chatOrigin } of this.joined) {
        if (!this.onIntoRoom(chatOrigin, true)) {
          // 如果加入失败，退出加入其他，重新连接
          reject('连接断开~')
        }
      }
      resolve('')
    })
  }

  // 加入房间
  onIntoRoom(chatOrigin: ChatOrigin, isOnQueue = false) {
    if (Strophe.Status.CONNECTING == this.status) {
      // 如果正在连接，退出函数
      this.joined.set(chatOrigin.topic, chatOrigin)
      return false
    } else if (this.reconnectStatus.includes(this.status)) {
      // 如果需要重新连接
      this.joined.set(chatOrigin.topic, chatOrigin)
      this.connectHome() // 账号重连
      return false // 加入房间失败
    } else if (isOnQueue || !this.joined.get(chatOrigin.topic)) {
      // 没有加入过房间
      const { purchaserUserID } = this.userInfo
      this.connection.send(
        $pres({
          from: `${purchaserUserID}@im.22city.cn`,
          to: `${chatOrigin.topic}@conference.im.22city.cn/${purchaserUserID}`
        })
          .c('x', { xmlns: 'http://jabber.org/protocol/muc' })
          .tree()
      )
      this.joined.set(chatOrigin.topic, chatOrigin)
      return true // 加入房间成功
    }
  }
}
