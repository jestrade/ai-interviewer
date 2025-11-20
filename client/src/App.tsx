import { useState, useRef } from "react";

export default function App() {
  const [messages, setMessages] = useState([]);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  function speakText(text) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Optional: Customize voice, pitch, rate here
      // utterance.rate = 1.0;
      // utterance.pitch = 1.0;
      // utterance.voice = window.speechSynthesis.getVoices().find(v => v.name === 'Desired Voice Name');
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn("Text-to-Speech not supported in this browser.");
    }
  }

  async function startRecording() {
    // 1. Request access to the microphone
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // 2. Initialize MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream);

      // Collect data chunks as they become available
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      // Call sendAudio when recording stops
      mediaRecorderRef.current.onstop = sendAudio;

      // Start recording
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  }

  function stopRecording() {
    // Stop recording, which triggers mediaRecorderRef.current.onstop (sendAudio)
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  }

  async function sendAudio() {
    // 1. Combine chunks into a single audio Blob
    const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

    // Add a placeholder message for the user's audio input (since we don't have text transcription here)
    setMessages((prev) => [
      ...prev,
      { from: "You (Audio)", text: "[Sending audio to AI...]" },
    ]);

    // 2. Prepare FormData for the API call
    const formData = new FormData();
    // The name "audio" must match what the backend expects (req.file in multer)
    formData.append("audio", audioBlob, "user_answer.webm");

    try {
      // 3. Send audio to the backend
      const response = await fetch("http://localhost:3001/api/interview", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // 4. Update the chat with the AI's response text
      setMessages((prev) => {
        // Replace the placeholder and add the AI response
        const newMessages = prev.slice(0, -1); // Remove the "[Sending audio...]" placeholder
        newMessages.push({
          from: "You (Audio)",
          text: "Audio sent successfully.",
        }); // Acknowledge sent audio
        newMessages.push({ from: "AI", text: data.text });
        return newMessages;
      });
      speakText(data.text);
      /* // 5. REMOVED: Play Gemini's audio reply
      // The backend has been corrected to *not* return audio. 
      // If you implement a separate Text-to-Speech (TTS) service 
      // on the backend, you would re-enable this section.
      
      const audio = new Audio("data:audio/ogg;base64," + data.audio);
      audio.play();
      */
    } catch (error) {
      console.error("Error sending audio or processing response:", error);
      setMessages((prev) => [
        ...prev,
        { from: "System", text: `Error: ${error.message}` },
      ]);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>🎤 AI Interviewer (Camera Off)</h1>

      {/* Camera-Off Box */}
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
