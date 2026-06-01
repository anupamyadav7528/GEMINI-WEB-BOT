import React, { useState, useRef, useEffect } from 'react';
import './App.css';

function App() {
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hi! Main UiPath AgentHack Support Bot hoon. Kahiye main aapki kya madad kar sakta hoon? 🚀' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Vercel Serverless Function Call Path
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await response.json();

      if (response.ok && data.reply) {
        setMessages((prev) => [...prev, { role: 'model', text: data.reply }]);
      } else {
        setMessages((prev) => [
          ...prev, 
          { role: 'model', text: data.error || 'Engine validation fails. Double check variable key setup!' }
        ]);
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      setMessages((prev) => [
        ...prev, 
        { role: 'model', text: 'Vercel Engine crash! Check project functions log details.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = async () => {
    try {
      await fetch('/api/chat/clear', { method: 'DELETE' });
    } catch (e) {}
    setMessages([
      { role: 'model', text: 'Chat logs reset successfully. Ready for next context session! 🧹' }
    ]);
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>AgentHack Bot</h2>
        </div>
        <button className="clear-btn" onClick={handleClearChat}>
          New Bot Session
        </button>
      </aside>

      <main className="chat-area">
        <header className="chat-header">
          <h3>UiPath AgentHack Support Bot</h3>
          <p>Type unique queries or click on the Mic icon below to chat using voice commands!</p>
        </header>

        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message-bubble ${msg.role === 'user' ? 'user-box' : 'bot-box'}`}>
              <strong>{msg.role === 'user' ? 'You: ' : 'Bot: '}</strong>
              <p>{msg.text}</p>
            </div>
          ))}

          {isLoading && (
            <div className="message-bubble bot-box">
              <strong>Bot: </strong>
              <div className="loader-dots">
                <span>.</span><span>.</span><span>.</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <footer className="chat-footer">
          <form onSubmit={handleSendMessage} className="input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message or use dynamic voice feature..."
              disabled={isLoading}
            />
            <span className="mic-icon" style={{ cursor: 'pointer' }}>
              🎤
            </span>
            <button type="submit" disabled={isLoading || !input.trim()} className="send-btn">
              Send
            </button>
          </form>
        </footer>
      </main>
    </div>
  );
}

export default App;