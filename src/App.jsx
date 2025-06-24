    import { useState, useRef, useEffect } from 'react';
    import agroLogo from './assets/agroai.png';

    export default function App() {
      const [query, setQuery] = useState('');
      const [messages, setMessages] = useState([]);
      const messageEndRef = useRef(null);

      const handleSubmit = async () => {
        if (!query.trim()) return;

        const userMessage = { role: 'user', text: query };
        setMessages((prev) => [...prev, userMessage]);
        setQuery('');

        try {
          // --- CHANGE THIS LINE ---
          // Append '/query' to your worker URL
          const res = await fetch('https://agro-mai.devsorg.workers.dev/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
          });

          // --- IMPROVE ERROR HANDLING FOR BETTER DEBUGGING ---
          if (!res.ok) {
              const errorData = await res.json();
              console.error("Worker Error:", errorData); // Log the detailed error from the worker
              throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
          }

          const data = await res.json();
          const botMessage = { role: 'bot', text: data.text || 'No response' };
          setMessages((prev) => [...prev, botMessage]);
        } catch (err) {
          console.error("Frontend Fetch Error:", err); // Log the actual fetch error
          setMessages((prev) => [...prev, { role: 'bot', text: 'Error getting response: ' + err.message }]);
        }
      };

      const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
          handleSubmit();
        }
      };

      useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, [messages]);

      return (
        <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center p-4">

          <img src={agroLogo} alt="AgroAI Logo" className="w-36 mb-4 drop-shadow-md" />

          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg border border-gray-300 flex flex-col"
               style={{ height: 'calc(100vh - 150px)' }}>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] px-4 py-2 text-sm rounded-xl whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-green-100 text-green-800 ml-auto'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {msg.text}
                </div>
              ))}
              <div ref={messageEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-2">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown} 
                placeholder="Ask a crop scenario..."
                className="flex-1 p-3 rounded-xl border border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              />
              <button
                onClick={handleSubmit}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-sm transition"
              >
                Send
              </button>
            </div>
          </div>

          {/* License Footer */}
          <div className="mt-4 text-xs text-center text-gray-500 max-w-xl space-y-2">

            {/* Creative Commons License */}
            <p>
              <a href="https://github.com/codxvoid/AgroAi" className="underline">AgroAi</a> © 2025 by{' '}
              <a href="https://github.com/codxvoid" className="underline">CodxVoid</a> is licensed under{' '}
              <a href="https://creativecommons.org/licenses/by-nc-nd/4.0/" className="underline">Creative Commons BY-NC-ND 4.0</a>
              <img src="https://mirrors.creativecommons.org/presskit/icons/cc.svg" className="inline-block w-4 h-4 ml-1" alt="Creative Commons" />
              <img src="https://mirrors.creativecommons.org/presskit/icons/by.svg" className="inline-block w-4 h-4 ml-1" alt="By" />
              <img src="https://mirrors.creativecommons.org/presskit/icons/nc.svg" className="inline-block w-4 h-4 ml-1" alt="NC" />
              <img src="https://mirrors.creativecommons.org/presskit/icons/nd.svg" className="inline-block w-4 h-4 ml-1" alt="ND" />
            </p>

            {/* GNU GPL v3 License */}
            <p>
              The source code is open-source and released under the{' '}
              <a
                href="https://www.gnu.org/licenses/gpl-3.0.en.html"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                GNU General Public License v3.0
              </a>{' '}
              (June 29, 2007).
            </p>

          </div>

        </div>
      );
    }
