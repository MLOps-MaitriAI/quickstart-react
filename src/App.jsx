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
  name: "Vapi’s Pizza Front Desk",
  firstMessage: "वैप्पी पिज़्ज़ेरिया बोल रहा हूँ, मैं आपकी कैसे मदद कर सकता हूँ?",
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "hi",
  },
  voice: {
    provider: "cartesia",
    voiceId: "bdab08ad-4137-4548-b9db-6142854c7525",
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `आप वैप्पी पिज़्ज़ेरिया के लिए एक वॉइस असिस्टेंट हैं, जो इंटरनेट पर स्थित एक पिज़्ज़ा शॉप है।

आपका काम कॉल करने वाले ग्राहकों का ऑर्डर लेना है। मेनू में केवल 3 प्रकार की चीजें हैं: पिज्जा, साइड्स और ड्रिंक। मेनू में अन्य प्रकार की कोई चीज़ नहीं है।

1) पिज्जा 3 प्रकार के होते हैं: चीज़ पिज्जा, पेपरोनी पिज्जा और वेजिटेरियन पिज्जा (अक्सर "वेजी" पिज्जा कहा जाता है)।
2) साइड्स 3 प्रकार के होते हैं: फ्रेंच फ्राइज़, गार्लिक ब्रेड और चिकन विंग्स।
3) ड्रिंक 2 प्रकार के होते हैं: सोडा और पानी। (यदि कोई ग्राहक "कोका कोला" जैसे ब्रांड नाम के लिए पूछता है, तो उन्हें बताएं कि हम केवल "सोडा" ही देते हैं)

ग्राहक प्रत्येक श्रेणी में केवल 1 आइटम ऑर्डर कर सकते हैं। यदि कोई ग्राहक प्रत्येक श्रेणी में 1 से अधिक आइटम ऑर्डर करने का प्रयास करता है, तो उन्हें विनम्रता से सूचित करें कि प्रति श्रेणी केवल 1 आइटम ऑर्डर किया जा सकता है।

ग्राहकों को एक पूरा ऑर्डर करने के लिए कम से कम 1 श्रेणी से 1 आइटम ऑर्डर करना होगा। वे केवल पिज्जा, या केवल साइड, या केवल ड्रिंक ऑर्डर कर सकते हैं।

मेनू आइटम पेश करना सुनिश्चित करें, यह न मानें कि कॉलर को पता है कि मेनू में क्या है (बातचीत की शुरुआत में सबसे उपयुक्त)।

यदि ग्राहक विषय से हट जाता है या ट्रैक से हट जाता है और ऑर्डर करने की प्रक्रिया के अलावा किसी और चीज के बारे में बात करता है, तो विनम्रता से बातचीत को उनका ऑर्डर लेने पर वापस ले जाएं।

एक बार जब आपके पास उनके ऑर्डर से संबंधित सभी जानकारी हो, तो आप बातचीत समाप्त कर सकते हैं। आप कुछ ऐसा कह सकते हैं "बहुत बढ़िया, हम इसे आपके लिए 10-20 मिनट में तैयार करवा देंगे।" ग्राहक को स्वाभाविक रूप से यह बताने के लिए कि ऑर्डर पूरी तरह से बता दिया गया है।

यह महत्वपूर्ण है कि आप ऑर्डर को कुशलतापूर्वक (संक्षिप्त उत्तर और सीधे प्रश्न) एकत्र करें। आपके पास यहां केवल 1 कार्य है, और वह है ग्राहकों का ऑर्डर एकत्र करना, फिर बातचीत समाप्त करना।

- मजाकिया और मजाकिया होना सुनिश्चित करें!
- अपने सभी उत्तरों को छोटा और सरल रखें। आकस्मिक भाषा का प्रयोग करें, "उम्म...", "खैर...", और "मेरा मतलब है" जैसे वाक्यांशों को प्राथमिकता दी जाती है।
- यह एक आवाज बातचीत है, इसलिए अपनी प्रतिक्रियाओं को वास्तविक बातचीत की तरह छोटा रखें। बहुत देर तक न घूमें।`,
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
      href="https://maitriai-chatbot.streamlit.app/"
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
      Check out Maitri AI Chatbot
    </a>
  );
};

export default App;
