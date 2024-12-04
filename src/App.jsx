import { useEffect, useState } from "react";

import ActiveCallDetail from "./components/ActiveCallDetail";
import Button from "./components/base/Button";
import Vapi from "@vapi-ai/web";
import { isPublicKeyMissingError } from "./utils";

// Put your Vapi Public Key below.
const vapi = new Vapi("c9983a9c-8094-4096-8898-ebc60c76a964");

const App = () => {
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(false);

  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);

  const { showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage } = usePublicKeyInvalid();

  // hook into Vapi events
  useEffect(() => {
    vapi.on("call-start", () => {
      setConnecting(false);
      setConnected(true);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("call-end", () => {
      setConnecting(false);
      setConnected(false);

      setShowPublicKeyInvalidMessage(false);
    });

    vapi.on("speech-start", () => {
      setAssistantIsSpeaking(true);
    });

    vapi.on("speech-end", () => {
      setAssistantIsSpeaking(false);
    });

    vapi.on("volume-level", (level) => {
      setVolumeLevel(level);
    });

    vapi.on("error", (error) => {
      console.error(error);

      setConnecting(false);
      if (isPublicKeyMissingError({ vapiError: error })) {
        setShowPublicKeyInvalidMessage(true);
      }
    });

    // we only want this to fire on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // call start handler
  const startCallInline = () => {
    setConnecting(true);
    vapi.start(assistantOptions);
  };
  const endCall = () => {
    vapi.stop();
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!connected ? (
        <Button
          label="Call Maitri AI"
          onClick={startCallInline}
          isLoading={connecting}
        />
      ) : (
        <ActiveCallDetail
          assistantIsSpeaking={assistantIsSpeaking}
          volumeLevel={volumeLevel}
          onEndCallClick={endCall}
        />
      )}

      {showPublicKeyInvalidMessage ? <PleaseSetYourPublicKeyMessage /> : null}
      <ReturnToDocsLink />
    </div>
  );
};

const assistantOptions = {
  name: "Call Maitri AI",
  firstMessage: "Maitri AI, how can I help you?",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en-US",
  },
  voice: {
    provider: "playht",
    voiceId: "jennifer",
  },
  model: {
    provider: "google",
    model: "gemini-1.5-flash",
    messages: [
      {
        role: "system",
        content: `Embody a Maitri AI sales representative. Your goal is to engage potential clients, understand their needs, and enthusiastically present relevant AI solutions. Greet them warmly and confidently, ascertain their business challenges, and offer the perfect AI solution.

        AI Chatbots:
        
        24/7 availability for instant customer support.
        
        Automates lead generation and qualification.
        
        Reduces customer service costs and response times.
        
        Seamless integration with various platforms (website, social media).
        
        Personalized customer interactions based on data analysis.
        
        AI Voice Assistants:
        
        Handles high call volumes, reducing wait times and improving customer satisfaction.
        
        Automates appointment scheduling and information retrieval.
        
        Frees up human agents for complex tasks.
        
        Provides consistent and professional brand experience.
        
        Offers multilingual support for global reach.
        
        AI Interviewer:
        
        Automates candidate screening and shortlisting.
        
        Assesses candidates based on skills, experience, and personality.
        
        Reduces time-to-hire and HR workload.
        
        Eliminates human bias in initial screening.
        
        Provides data-driven insights for better hiring decisions.
        
        Object Detection & Counting:
        
        Automates object identification and counting in images/videos.
        
        Enables real-time inventory management and tracking.
        
        Improves accuracy and efficiency in various industries (retail, manufacturing, security).
        
        Provides valuable data for business analytics and optimization.
        
        Customizable to detect specific objects based on client needs.
        
        Customizable AI Solutions: "Looking for something more bespoke? Maitri AI offers customizable solutions tailored to your specific business needs. To discuss your requirements in detail and explore the possibilities, let me take your name, phone number, and email address. One of our experts will get back to you shortly for a personalized consultation." (Ensure you capture this information accurately.)
        
        If a client asks for a quote or wants to purchase a product, collect their phone number, email and name, and say that you will get a call back from our company soon.

        Remember to ask qualifying questions to understand the client's needs, highlight relevant product benefits, and emphasize ROI. Your confident and enthusiastic approach, coupled with Maitri AI's cutting-edge technology, is the key to closing deals and building lasting partnerships.`,
      },
    ],
  },
};

const usePublicKeyInvalid = () => {
  const [showPublicKeyInvalidMessage, setShowPublicKeyInvalidMessage] = useState(false);

  // close public key invalid message after delay
  useEffect(() => {
    if (showPublicKeyInvalidMessage) {
      setTimeout(() => {
        setShowPublicKeyInvalidMessage(false);
      }, 3000);
    }
  }, [showPublicKeyInvalidMessage]);

  return {
    showPublicKeyInvalidMessage,
    setShowPublicKeyInvalidMessage,
  };
};

const PleaseSetYourPublicKeyMessage = () => {
  return (
    <div
      style={{
        position: "fixed",
        bottom: "25px",
        left: "25px",
        padding: "10px",
        color: "#fff",
        backgroundColor: "#f03e3e",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      Is your Vapi Public Key missing? (recheck your code)
    </div>
  );
};

const ReturnToDocsLink = () => {
  return (
    <a
      href="https://docs.vapi.ai"
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: "fixed",
        top: "25px",
        right: "25px",
        padding: "5px 10px",
        color: "#fff",
        textDecoration: "none",
        borderRadius: "5px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      }}
    >
      return to docs
    </a>
  );
};

export default App;
