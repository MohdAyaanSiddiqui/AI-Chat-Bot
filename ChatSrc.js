const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const minimizeButton = document.querySelector("#minimize-chatbot");
const closeButton = document.querySelector("#close-chatbot");
const chatbotPopup = document.querySelector(".chatbot-popup");
const fileInput = document.querySelector("#file-input")
const fileCancelButton = document

// Configuration
const config = {
    API_KEY: "AIzaSyDS1D7A1aoPTKRg_m0MlOiX8eBq3Ouc8i0",
    API_URL: "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
};
const userdata = {
    message:null,
    file:{
        data:null,
        mime_type:null
    }
}

// State management
const state = {
    isMinimized: false,
    isProcessing: false
};

// Message handling
const createMessageElement = (content, isUser = false, imageData = null) => {
    const div = document.createElement("div");
    div.classList.add("message", isUser ? "user-message" : "bot-message");
    
    let messageContent = '';
    if (imageData) {
        messageContent = `
            <div class="message-content">
                <div class="image-container">
                    <img src="data:${imageData.mime_type};base64,${imageData.data}" class="message-image" alt="Uploaded image">
                    <button class="cancel-image" title="Cancel image">
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                </div>
                <div class="message-text">${content}</div>
            </div>
        `;
    } else {
        messageContent = `
            <div class="message-content">
                <div class="message-text">${content}</div>
            </div>
        `;
    }
    
    div.innerHTML = messageContent;
    return div;
}

// API call
const getBotResponse = async (userMessage) => {
    try {
        // Set the user message in userdata
        userdata.message = userMessage;

        const response = await fetch(`${config.API_URL}?key=${config.API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: userMessage },
                        ...(userdata.file.data ? [{ inline_data: userdata.file }] : [])
                    ]
                }]
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error:', error);
        return "I'm sorry, I encountered an error. Please try again.";
    }
}

// Message handling
const handleOutgoingMessage = async (userMessage) => {
    if (!userMessage || state.isProcessing) return;
    
    state.isProcessing = true;
    messageInput.value = "";

    // Add user message
    const userMessageDiv = createMessageElement(userMessage, true);
    chatBody.appendChild(userMessageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Show typing indicator
    const typingDiv = createMessageElement("Typing...");
    chatBody.appendChild(typingDiv);

    // Get bot response
    const botResponse = await getBotResponse(userMessage);
    chatBody.removeChild(typingDiv);
    
    const botMessageDiv = createMessageElement(botResponse);
    chatBody.appendChild(botMessageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    state.isProcessing = false;
}

// UI Controls
const toggleMinimize = () => {
    const chatBody = document.querySelector('.chat-body');
    const chatFooter = document.querySelector('.chat-footer');
    const minimizeIcon = minimizeButton.querySelector('i');

    state.isMinimized = !state.isMinimized;

    if (state.isMinimized) {
        chatBody.style.display = 'none';
        chatFooter.style.display = 'none';
        chatbotPopup.style.height = 'auto';
        minimizeIcon.className = 'fa-solid fa-plus';
    } else {
        chatBody.style.display = 'flex';
        chatFooter.style.display = 'flex';
        chatbotPopup.style.height = '600px';
        minimizeIcon.className = 'fa-solid fa-minus';
    }
}

const handleClose = () => {
    chatbotPopup.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => {
        chatbotPopup.style.display = 'none';
        showReopenButton();
    }, 300);
}

const showReopenButton = () => {
    let reopenButton = document.getElementById('reopen-chat');
    
    if (!reopenButton) {
        reopenButton = document.createElement('button');
        reopenButton.id = 'reopen-chat';
        reopenButton.innerHTML = '<i class="fa-solid fa-message"></i>';
        document.body.appendChild(reopenButton);
        
        reopenButton.addEventListener('click', () => {
            chatbotPopup.style.display = 'flex';
            chatbotPopup.style.animation = 'fadeIn 0.3s ease';
            reopenButton.style.display = 'none';
        });
    }
    
    reopenButton.style.display = 'block';
}

// Event handlers
const handleSendMessage = () => {
    const message = messageInput.value.trim();
    if (message) {
        handleOutgoingMessage(message);
    }
}

const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
}

// Initialize
const initChat = () => {
    // Add event listeners
    minimizeButton?.addEventListener('click', toggleMinimize);
    closeButton?.addEventListener('click', handleClose);
    sendMessageButton?.addEventListener('click', handleSendMessage);
    messageInput?.addEventListener('keydown', handleKeyPress);

    // Welcome message
    const welcomeMessage = createMessageElement("Hello! How can I help you today?", false);
    chatBody.appendChild(welcomeMessage);

    // Add styles
    addStyles();
}

// Add required styles
const addStyles = () => {
    const styles = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(20px); }
        }

        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }

        #reopen-chat {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background: linear-gradient(135deg, #3d39ac, #4c1871);
            border: none;
            color: white;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            display: none;
            animation: fadeIn 0.3s ease;
            z-index: 1000;
        }

        #reopen-chat:hover {
            transform: scale(1.1);
            transition: transform 0.3s ease;
        }

        .chatbot-popup {
            transition: height 0.3s ease;
        }

        .message {
            animation: fadeIn 0.3s ease;
        }

        .image-container {
            position: relative;
            display: inline-block;
        }

        .message-image {
            max-width: 300px;
            max-height: 300px;
            border-radius: 8px;
            margin-bottom: 8px;
            display: block;
        }

        .cancel-image {
            position: absolute;
            top: -10px;
            right: -10px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: #ff4444;
            color: white;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: transform 0.2s ease;
        }

        .cancel-image:hover {
            transform: scale(1.1);
        }

        .message-content {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
        }
    `;

    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}

fileInput.addEventListener("change",()=>{
    const file = fileInput.files[0];
    if(!file)return;

    const reader = new  FileReader();
    reader.onload = (e)=>{
        const base64String = e.target.result.split(",")[1];

        userdata.file = {
            data: base64String,
            mime_type: file.type
        };
        fileInput.value = "";
        
        // Show the image in chat
        const imageMessageDiv = createMessageElement("I've uploaded an image:", true, userdata.file);
        chatBody.appendChild(imageMessageDiv);
        chatBody.scrollTop = chatBody.scrollHeight;

        // Add cancel button functionality
        const cancelButton = imageMessageDiv.querySelector('.cancel-image');
        cancelButton.addEventListener('click', () => {
            // Remove the image message
            imageMessageDiv.remove();
            // Clear the file data
            userdata.file = {
                data: null,
                mime_type: null
            };
        });
    }

    reader.readAsDataURL(file);
})
const picker = new EmojiMart.Picker({
    theme: "light",
    skinTonePosition: "none",
    previewButton: "none",
    onEmojiSelect: (emoji) => {
        const { selectionStart: start, selectionEnd: end } = messageInput;
        messageInput.setRangeText(emoji.native, start, end, "end");
        messageInput.focus();
        document.body.classList.remove("show-emoji-picker");
    }
});

// Add emoji picker toggle functionality
const emojiButton = document.querySelector("#emoji-picker");
const emojiPickerContainer = document.createElement("div");
emojiPickerContainer.id = "emoji-picker-container";
emojiPickerContainer.appendChild(picker);
document.querySelector(".chat-footer").appendChild(emojiPickerContainer);

emojiButton.addEventListener("click", (e) => {
    e.stopPropagation();
    document.body.classList.toggle("show-emoji-picker");
});

// Close emoji picker when clicking outside
document.addEventListener("click", (e) => {
    if (!e.target.closest("#emoji-picker") && !e.target.closest("#emoji-picker-container")) {
        document.body.classList.remove("show-emoji-picker");
    }
});

// Prevent emoji picker from closing when clicking inside it
emojiPickerContainer.addEventListener("click", (e) => {
    e.stopPropagation();
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initChat);
document.querySelector("#file-upload").addEventListener("click",()=>fileInput.click());