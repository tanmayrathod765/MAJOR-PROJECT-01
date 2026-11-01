import { useState } from "react";
import { sendChatMessage } from "../api/aiApi";

const suggestions = [
  "Earthquake Safety",
  "Flood Preparedness",
  "Fire Emergency",
  "Heatwave Precautions",
  "Build an Emergency Kit",
  "School Evacuation Plan",
];

const ChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event) => {
    event?.preventDefault();
    const text = message.trim();
    if (!text || loading) return;
    setMessage("");
    setError("");
    setMessages((items) => [...items, { role: "user", text }]);
    setLoading(true);
    try {
      const result = await sendChatMessage({ message: text });
      setMessages((items) => [
        ...items,
        { role: "assistant", text: result.answer, meta: result.isFallback ? "Educational fallback" : "AI guidance" },
      ]);
    } catch (err) {
      setError(err.response?.data?.message || "The assistant is unavailable. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6">
        <p className="text-sm font-semibold text-blue-800">Safety support</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">AI Safety Assistant</h1>
        <p className="mt-2 text-slate-500">
          Ask for educational preparedness guidance. For an immediate threat, follow local authorities and contact emergency services.
        </p>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => setMessage(suggestion)} className="rounded-full border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-900 hover:bg-blue-50">
            {suggestion}
          </button>
        ))}
      </div>
      <section className="min-h-[420px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="space-y-4">
          {messages.length === 0 && <p className="py-16 text-center text-slate-500">Choose a suggested question or type your own.</p>}
          {messages.map((item, index) => (
            <div key={`${item.role}-${index}`} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${item.role === "user" ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-800"}`}>
                <p className="whitespace-pre-wrap">{item.text}</p>
                {item.meta && <p className="mt-2 text-xs opacity-70">{item.meta}</p>}
              </div>
            </div>
          ))}
          {loading && <p className="text-sm text-slate-500">Preparing safety guidance...</p>}
        </div>
        {error && <div className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
        <form onSubmit={submit} className="mt-6 flex gap-2">
          <input aria-label="Safety question" value={message} onChange={(event) => setMessage(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-700 focus:ring-2 focus:ring-blue-200" placeholder="Ask a safety question..." maxLength={2000} />
          <button type="submit" disabled={loading || !message.trim()} className="rounded-lg bg-blue-900 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">Send</button>
        </form>
      </section>
    </div>
  );
};

export default ChatAssistant;
