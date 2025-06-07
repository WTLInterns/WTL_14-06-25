import Link from "next/link"
import { useState, useEffect, useRef, KeyboardEvent } from "react"
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner, FaWhatsapp, FaPhoneAlt } from 'react-icons/fa'

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function FloatingIcons() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Welcome to WTL Tourism! 🚕\nAsk me anything about cab booking, our services, or your trip. I answer only about worldtriplink.com.' }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    if (isChatOpen) inputRef.current?.focus()
  }, [isChatOpen])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleSendMessage = async () => {
    const trimmedMessage = inputMessage.trim()
    if (!trimmedMessage) return
    const userMessage: Message = { role: 'user', content: trimmedMessage }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    try {
      const apiMessages = [...messages, userMessage].map(msg => ({ role: msg.role, content: msg.content }))
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })
      const data = await response.json()
      if (!response.ok) {
        if (data.code === 402) {
          setMessages(prev => [...prev, { role: 'assistant', content: "I'm currently experiencing high demand. Please try again later or call us directly!" }])
          setIsLoading(false)
          return
        }
        throw new Error('Sorry, I encountered an error. Please try again later.')
      }
      if (data?.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
      } else {
        throw new Error('Invalid response format from API')
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: error.message || 'Sorry, I encountered an error. Please try again later.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Phone Icon */}
      <div className="fixed bottom-6 left-6 z-50">
        <Link href="tel:+919730545491" className="bg-blue-500 text-white p-3 rounded-full shadow-lg hover:bg-blue-600 transition-colors flex items-center justify-center" aria-label="Call us">
          <FaPhoneAlt className="w-6 h-6" />
        </Link>
      </div>
      {/* WhatsApp Icon */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link href="https://wa.me/919730545491" target="_blank" className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors flex items-center justify-center" aria-label="Chat on WhatsApp">
          <FaWhatsapp className="w-6 h-6" />
        </Link>
      </div>
      {/* Chatbot Icon */}
      <div className="fixed bottom-24 right-6 z-50">
        <button onClick={() => setIsChatOpen(!isChatOpen)} className="bg-gradient-to-br from-purple-600 to-indigo-500 text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform flex items-center justify-center relative" aria-label="Open Chatbot">
          <FaRobot className="w-7 h-7" />
          {!isChatOpen && messages.length > 1 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-bounce" aria-label={`${messages.length - 1} unread messages`}>
              {messages.length - 1}
            </span>
          )}
        </button>
      </div>
      {/* Chatbot Interface */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-80 md:w-96 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200 animate-fade-in">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-500 text-white p-4 flex justify-between items-center">
            <div className="flex items-center">
              <FaRobot className="mr-2 text-yellow-300 animate-pulse" />
              <h3 className="font-semibold text-lg">WTL Cab Assistant</h3>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white hover:text-gray-200" aria-label="Close chat">
              <FaTimes />
            </button>
          </div>
          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100">
            {messages.map((message, index) => (
              <div key={index} className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2 rounded-2xl shadow ${message.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}>{message.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-3">
                <div className="inline-block px-4 py-2 rounded-2xl bg-gray-200 text-gray-800 animate-pulse">
                  <FaSpinner className="inline mr-2 animate-spin" aria-label="Loading..." />
                  Typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          {/* Chat Input */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              <input ref={inputRef} type="text" value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyDown={handleKeyDown} placeholder="Ask about cab booking, pricing, routes..." className="flex-1 p-2 border border-gray-300 rounded-l-2xl focus:outline-none focus:ring-2 focus:ring-purple-500" aria-label="Message input" disabled={isLoading} />
              <button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()} className="bg-gradient-to-br from-purple-600 to-indigo-500 text-white p-2 rounded-r-2xl hover:from-purple-700 hover:to-indigo-600 transition-colors disabled:bg-purple-400" aria-label="Send message">
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}