import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [mainLoader, setMainLoader] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { text: "Hello, I want some information from you!", sender: "user" },
    { text: "Sure! What do you need to know?", sender: "bot" },
  ]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const data = JSON.parse(localStorage.getItem("data"));

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (data == null) {
      navigate("/signin");
    } else {
      const checkNS = async () => {
        try {
          const email =data.email;
          const role = data.role;
          console.log(email, role);

          const response = await axios.get(
            `http://localhost:5000/check-namespace?email=${email}&role=${role}`
          );
          if (response.data.result === 0) {
            navigate("/onboard");
          }
        } catch (e) {
          console.log(e);
        } finally {
          setMainLoader(false);
        }
      };
      checkNS()

      const fetchHistory = async () => {
        try {
          setMainLoader(true);
        
          const user_id = data.email;
          const user_type = data.role;
  
          const response = await axios.get(
            `http://localhost:5000/getHistory?user_id=${user_id}&user_type=${user_type}`
          );
  
          const history = response.data.history || [];
          console.log(history);
          
          const formattedMessages = history.flatMap((item) => [
            { text: item.question, sender: "user" },
            { text: item.answer, sender: "bot" },
          ]);
          setMessages(formattedMessages);
        } catch (error) {
          console.error("Error fetching history:", error);
        } finally {
          setMainLoader(false);
        }
      };
  
      fetchHistory();
    }
  }, []);

  // Fetch conversation history on initial load


  // Auto-scroll to the latest message smoothly
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSearch = async () => {
    if (!input.trim()) return;

    try {
      setLoading(true);
      const user = (data);
      const user_id = user.email;
      const user_type = user.role;

      // Add user message to state
      setMessages((prev) => [...prev, { text: input, sender: "user" }]);
      setInput("");

      // Show loading state in bot messages
      setMessages((prev) => [...prev, { text: "loading", sender: "bot", isLoading: true }]);

      const response = await axios.get(
        `http://localhost:5000/getresponse?user_question=${input}&user_id=${user_id}&user_type=${user_type}`
      );

      // Replace loading message with actual bot response
      setMessages((prev) => [
        ...prev.slice(0, -1), // Remove last message (loader)
        { text: response.data.answer, sender: "bot" },
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      {mainLoader ? (
        <span className="loading loading-dots loading-md"></span>
      ) : (
        <div className="right-container gap-7 flex flex-col h-full w-full rounded-lg shadow-md">
          {/* Messages Container */}
          <div className="navbar bg-base-300">
            <div className="flex-1">
              <a className="btn btn-ghost text-white rounded-lg text-xl">PDF.AI</a>
            </div>
            <div className="flex-none gap-2">
              <button
                onClick={() => navigate("/uploadfiles")}
                className="btn btn-square btn-ghost"
              >
                <svg
                  className="w-[25px] h-[25px] fill-[#8e8e8e]"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M288 109.3V352c0 17.7-14.3 32-32 32s-32-14.3-32-32V109.3l-73.4 73.4c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l128-128c12.5-12.5 32.8-12.5 45.3 0l128 128c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L288 109.3zM64 352H192c0 35.3 28.7 64 64 64s64-28.7 64-64H448c35.3 0 64 28.7 64 64v32c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V416c0-35.3 28.7-64 64-64zM432 456a24 24 0 1 0 0-48 24 24 0 1 0 0 48z"></path>
                </svg>
              </button>
              <button onClick={()=>{
                localStorage.removeItem("data")
                navigate("/signin")
              }} className="btn btn-square btn-ghost">
                <svg
                  className="w-[25px] h-[25px] fill-[#8e8e8e]"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z"></path>
                </svg>
              </button>
            </div>
          </div>

          <div className="messages-container m-10 flex flex-col space-y-4 overflow-y-auto flex-grow scrollbar-hide">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } animate-fadeIn`}
              >
                <p
                  className={`p-3 rounded-lg max-w-lg break-words ${
                    msg.sender === "user"
                      ? "bg-success text-black self-end"
                      : "bg-gray-200 text-black self-start"
                  }`}
                >
                  {msg.isLoading ? (
                    <span className="loading loading-dots loading-md"></span>
                  ) : (
                    msg.text
                  )}
                </p>
              </div>
            ))}
            {/* Invisible ref for auto-scroll */}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Field */}
          <div className="p-5 flex w-full">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              className="flex-1 p-3 border border-base-300 rounded-md w-full"
              placeholder="Ask Anything..."
            />
            <button
              onClick={handleSearch}
              className="ml-2 btn btn-success text-black px-4 py-2 rounded-md"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
