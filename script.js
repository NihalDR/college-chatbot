document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-window');
  const fileInput = document.getElementById('file-input');
  const uploadBtn = document.getElementById('upload-btn');
  const sendBtn = document.getElementById('send-btn');
  const userInput = document.getElementById('user-input');

  const GEMINI_API_KEY = "your api-key";  // Replace with your actual API key
  const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  const appendMessage = (sender, message, isUser = false) => {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chat-message', isUser ? 'user-message' : 'bot-message');
    messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  };

  const handleMessage = async () => {
    const userInputValue = userInput.value.trim();
    if (!userInputValue) {
      appendMessage("Chatbot", "Please enter a message.");
      return;
    }

    appendMessage("You", userInputValue, true);
    userInput.value = "";

    try {
      const botResponse = await fetchGeminiResponse(userInputValue);
      appendMessage("Chatbot", botResponse);
    } catch (error) {
      appendMessage("Chatbot", "Sorry, there was an issue with the response.");
      console.error("Error fetching Gemini response:", error);
    }
  };

  const fetchGeminiResponse = async (input) => {
    try {
      const response = await fetch(GEMINI_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: input }] }]
        })
      });

      const data = await response.json();
      console.log("Gemini API Response:", data);  // Debugging output
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't understand that.";
    } catch (error) {
      console.error("API Error:", error);
      return "Error processing your request.";
    }
  };

  const appendImage = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const imgDiv = document.createElement('div');
      imgDiv.classList.add('chat-message');
      imgDiv.innerHTML = `<strong>You:</strong> <br><img src="${e.target.result}" alt="Uploaded Image" 
          style="max-width: 100%; border: 1px solid #ddd; border-radius: 5px; margin-top: 10px;">`;
      chatBox.appendChild(imgDiv);

      setTimeout(() => {
        appendMessage("Chatbot", "Image received! Currently, this bot does not process images.");
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  uploadBtn.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) appendImage(file);
  });

  sendBtn.addEventListener('click', handleMessage);
  userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') handleMessage();
  });
});
