async function loadExternalModule() {
  try {
    // Dynamically import the module
    const { DeepChat } = await import(
      "https://unpkg.com/deep-chat@1.3.21/dist/deepChat.bundle.js"
    );
  } catch (error) {
    console.error("Error loading external module:", error);
  }
}

// Call the function to load and use the external module
loadExternalModule().then(() => {
  let deepChatPocElement =
    document.getElementsByClassName("deep-chat-poc")?.[0];
  deepChatPocElement.innerHTML = `
  <div class="chat-wrapper">
    <button
      type="button"
      onclick="openChatContainer()"
      class="chat-icon-container"
      style="
        height: 3rem;
        width: 3rem;
        background-color: white;
        box-shadow: 0px 0px 10px rgb(125, 125, 125);
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: absolute;
        right: 2rem;
        bottom: 2rem;
        cursor: pointer;
        border-top-width: 0px;
        border-right-width: 0px;
        border-bottom-width: 0px;
        border-left-width: 0px;
      "
    >
      <img
        class="chat-icon"
        style="height: 50%; width: 50%"
        src="https://raw.githubusercontent.com/Vibencode-Solutions/deepchat-poc-assets/main/chatbot.png"
        alt="chat-bot-image"
      />
    </button>
  </div>
  
  <div
    class="chat-container"
    style="
      position: absolute;
      scale: 0;
      bottom: 5rem;
      width: 300px;
      right: 5.5rem;
      transition: 0.4s ease-in-out;
      transform-origin: 100% 100%;
      padding-bottom: 0.8rem;
      border-radius: 1rem 1rem 0rem 1rem;
      box-shadow: 0px 0px 10px rgb(196, 196, 196);
      background-color: white;
    "
  >
    <h2
      class="chat-heading"
      style="
        margin-bottom: 0.4rem;
        border-bottom: 2px solid gainsboro;
        padding: 1rem;
      "
    >
      Deep Chat
    </h2>
    <deep-chat
      id="chat-element"
      microphone="true"
      demo="true"
      style="border: none"
      introMessage='{"text": "Please enter your Access code"}'

      >
    </deep-chat>
  </div>
  `;

  const questions = [
    { role: "ai", text: "What's your name?" },
    { role: "ai", text: "How old are you?" },
    { role: "ai", text: "What's JavaScript?" },
  ];
  let questionIndex = 0;
  const chatElementRef = document.getElementById("chat-element");
  const userAudioResponses = [];

  chatElementRef.request = {
    handler: (body, signals) => {
      try {
        if (body instanceof FormData) {
          const formData = body;
          const audio_file = formData.get("files");

          const formData2 = new FormData();
          formData2.append("file", audio_file);
          formData2.append("model", "whisper-1");

          const url = "https://api.openai.com/v1/audio/transcriptions";
          const headers = {
            Authorization:
              "Bearer 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",
            // "Content-Type": "multipart/form-data",
          };
          fetch(url, {
            method: "POST",
            headers: headers,
            body: formData2,
          })
            .then((res) => {
              return res.json();
            })
            .then(async (data) => {
              const audioresponses = data.text;
              userAudioResponses.push(audioresponses);

              const transcription = questions
                .map(
                  (question, index) => `
                  Q${index + 1} : ${question.text} </br>
                  A${index + 1} : ${userAudioResponses[index]}
                `
                )
                .join("</br></br>");
              if (questionIndex < 3) {
                signals.onResponse({
                  text: questions[questionIndex].text,
                });
              } else {
                signals.onResponse({
                  text: "Thank you for your Response",
                  html: "Transcription </br> </br>" + transcription,
                });
              }
              questionIndex++;
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          const accessCode = body.messages[0].text;
          if (accessCode == "JGPGX".trim()) {
            signals.onResponse({
              html: questions[questionIndex].text,
            });
            questionIndex++;
          } else {
            signals.onResponse({ text: "Acess code is invalid" });
          }
        }
      } catch (e) {
        signals.onResponse({ error: "Error" });
      }
    },
  };
});

const openChatContainer = () => {
  let chatContainer = document.getElementsByClassName("chat-container")?.[0];
  let chatIcon = document.getElementsByClassName("chat-icon")?.[0];

  if (chatContainer.style.scale === "1") {
    chatContainer.style.scale = 0;
    chatContainer.style["transform-origin"] = "100% 100%";
  } else {
    chatContainer.style.scale = 1;
    chatContainer.style["transform-origin"] = "100% 50%";
  }

  if (
    chatIcon.src ===
    "https://raw.githubusercontent.com/Vibencode-Solutions/deepchat-poc-assets/main/chatbot.png"
  ) {
    chatIcon.src =
      "https://github.com/Vibencode-Solutions/deepchat-poc-assets/blob/main/close.png?raw=true";
  } else {
    chatIcon.src =
      "https://raw.githubusercontent.com/Vibencode-Solutions/deepchat-poc-assets/main/chatbot.png";
  }
};
