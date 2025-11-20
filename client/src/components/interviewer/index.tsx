import { useState, useRef } from "react";

export default function Interviewer() {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  function speakText(text) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Text-to-Speech not supported in this browser.");
    }
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = sendAudio;

      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  }

  function stopRecording() {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function sendAudio() {
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

    setMessages((prev) => [
      ...prev,
      { from: "You (Audio)", text: "[Sending audio to AI...]" },
    ]);

    const formData = new FormData();
    formData.append("audio", audioBlob, "user_answer.webm");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/interview`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setMessages((prev) => {
        const newMessages = prev.slice(0, -1);
        newMessages.push({
          from: "You (Audio)",
          text: "Audio sent successfully.",
        });
        newMessages.push({ from: "AI", text: data.text });
        return newMessages;
      });
      speakText(data.text);
      
    } catch (error) {
      console.error("Error sending audio or processing response:", error);
      setMessages((prev) => [
        ...prev,
        { from: "System", text: `Error: ${error.message}` },
      ]);
    }
  }

  return (
    <div>
      <h1>🎤 AI Interviewer</h1>

      <div
        style={{
          width: "300px",
          height: "200px",
          backgroundColor: "#1a1a1a",
          borderRadius: 12,
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          color: "#ccc",
          fontSize: 18,
        }}
      >
        <div style={{ fontSize: 40, marginBottom: 10 }}>📷</div>
        <div>Interviewer camera is off</div>
      </div>

      <div
        style={{
          height: 200,
          overflowY: "auto",
          border: "1px solid #ccc",
          padding: 10,
          marginBottom: 20,
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.from}:</b> {m.text}
          </div>
        ))}
      </div>

      {!recording ? (
        <button onClick={startRecording}>🎤 Start Answer</button>
      ) : (
        <button onClick={stopRecording}>⏹️ Stop</button>
      )}
    </div>
  );
}
