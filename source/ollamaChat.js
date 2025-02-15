
let localStorage = {};
let chats;
const readLocalStorage = async (key) => {
    return new Promise((resolve, reject) => {
      browser.storage.local.get([key], function (result) {
        if (result[key] === "undefined") {
          reject();
        } else {
          resolve(result[key]);
        }
      });
    });
  };
  
async function getData() {
    var tempChats = await readLocalStorage("chats"); 
    //console.log(tempChats);
     if (tempChats !== undefined  && tempChats!="") {
          
          console.log(tempChats);
          
          return tempChats;
     }
    else {
        return [];
    }
    
}



function openWindow() {
    browser.tabs.create({url: "panel.html"});
}
async function clearHist() {
    
    browser.storage.local.remove('chats');
    chats = await getData();
    var chatHandle = new ChatHistoryService();
    chatHandle.displayChat();
}

function removeImg(){
     var image = document.getElementById("selected-image");
     image.setAttribute("base64", "");
     image.setAttribute("src", "");
    var delBtn = document.getElementById("delBtn");
    delBtn.style.display = "none";
}




class ChatHistory {
  constructor() {
    this.chats = [];
        if (chats !== undefined && chats!="") {
          
          console.log(chats);
          var chatTemp =chats;
          
          for(let i = 0; i< chatTemp.length; i++) {
              this.chats.push(new ChatMessage(chats[i].id,chats[i].text, chats[i].image,chats[i].response));
          }
          
        }
        
    
    console.log(this.chats);
  }

  saveChats() {
    localStorage['chats'] = this.chats;
    browser.storage.local.set(localStorage);
  }

  getChats() {
      
    
    this.chats = [];
    if (chats !== undefined && chats!="") {
       
        this.chats = JSON.parse(chats);
    }
    return this.chats;
  }

  addChat(chat) {
    chat.id = Date.now();
    this.chats.push(chat);
    this.saveChats();
    return chat;
  }
}
function escapeHtml(unsafe)
{
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }
class ChatMessage {
  constructor(id, text, image, response) {
    if (image) {
      this.image = image;
    } else {
      this.image = null;
    }
    this.id = id;
    this.text = text;
    this.response = response;
  }



  toElement() {
      const messageElement = document.createElement('div');
      messageElement.classList.add('flex-message');
      if (this.image !== null && this.image != "") {
        const imgElement = document.createElement("img");
        imgElement.setAttribute("src", this.image);
        imgElement.classList.add('image-container');
        messageElement.appendChild(imgElement);
        
      }
      // Add incoming message content
      const incomingMessage = document.createElement('p');
      incomingMessage.classList.add('incoming');
      incomingMessage.textContent = this.text;
      messageElement.appendChild(incomingMessage);

      // Add outgoing message content
      const outgoingMessage = document.createElement('p');
      outgoingMessage.classList.add('outgoing');
      outgoingMessage.textContent = this.response;
      messageElement.appendChild(outgoingMessage);

  return messageElement;
}

  toString() {
    let result="";
    if (this.image !== null && this.image != "") {
      result = `<img class='image-container' src="${this.image}">`;
    }
    result += "<div class='flex-message'>" + "<p class='incoming'>" + escapeHtml(this.text)+ "</p><br><p class='outgoing'>" + escapeHtml(this.response) +  "</p></div>";
    
    return result;
  }
}

class ChatHistoryService {
  constructor() {
    this.chatHistory = new ChatHistory();
    

  }

  sendMessage(text, image, response) {
    let chatMessage = new ChatMessage(Date.now(), text, image, response);
    if (chatMessage.image) {
      // convert base64 string to file
     // let imgFile = new File([chatMessage.image], 'image.png', {type: 'image/png'});
      // add imgFile to chatMessage
      chatMessage = Object.assign(chatMessage, { 
        image: image
      });
    }
    return this.chatHistory.addChat(chatMessage);
  }

  getChats() {
    return this.chatHistory.getChats();
  }

  clearChats() {
    localStorage.removeItem('chats');
    this.chatHistory.chats = [];
  }

  displayChat() {
    let chatDivs = document.getElementById('chat-container');
    chatDivs.replaceChildren();
    var chats = this.chatHistory.chats;
    
    
    for (let i = 0; i < chats.length; i++) {
      
      chatDivs.appendChild(chats[i].toElement());

    }
  }
  
  


}


function convertBlobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}



  
  function UpdateOutput() {
      //User asked the model a question!
      
          const service = new ChatHistoryService();
  
        var chatInput = document.getElementById("chatInput");
        //var chatOutput = document.getElementById("chatOutput");
        var chatBtn = document.getElementById("chatBtn");
        var chatModel = document.getElementById("modelTypeDropdown");
        var blob;
        var image = document.getElementById("selected-image");
        var delBtn = document.getElementById("delBtn");
        selectedModel = chatModel.options[chatModel.selectedIndex].text;
        
          (async () => {
              
          try {
           
                
            if (selectedModel.indexOf("vision") !== -1 && image !== "undefined") {

              const response = await fetch('http://localhost:11434/api/generate',  {
                'method': 'POST',
                'headers': {
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    'model':   selectedModel,
                    'prompt': chatInput.value,
                'images': [image.getAttribute("base64").replace("data:image/png;base64,", "")],
                    'stream': false,
                    
            })});
            const data = await response.json();
            
            
            service.sendMessage(chatInput.value, image.getAttribute("base64"), data.response);
            service.displayChat();
            image.setAttribute("src", "");
            image.setAttribute("base64", "");
            document.getElementById("delBtn").style.display = "none";
            
            } else {
              console.log("Non-image model queried");
            
            const response = await fetch('http://localhost:11434/api/generate',  {
                'method': 'POST',
                'headers': {
                    'Content-Type': 'application/json'
                },
                'body': JSON.stringify({
                    'model':   selectedModel,
                    'prompt': chatInput.value,
                    'stream': false
            })});
            const data = await response.json();
            
            service.sendMessage(chatInput.value, image.getAttribute("base64") ,data.response);
            chatInput.value = "";
            service.displayChat();
            
            
            console.log(chatInput.value);
            } 
          } catch (error) {
             
            console.error("An error occurred:", error);
          }
          

        })();
        window.scrollTo(0, document.body.scrollHeight);
        if(image.base64 == ""){
        
        }
      
  }
function loadModels(modelListUrl="http://localhost:11434/api/tags") {
    // Get the select element
    var modelTypeDropDown = document.getElementById("modelTypeDropdown");

    // Clear existing options
    while (modelTypeDropDown.options.length > 0) {
        modelTypeDropDown.remove(0, modelTypeDropDown.options.length);
    }

    // Fetch model list from API endpoint
    (async () => {
        try {
            const response = await fetch(modelListUrl, {
                'method': 'GET',
                'headers': {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Add options to the select element
            for (const model of data.models) {
                var option = document.createElement('option');
                option.value = model.name;
                option.text = model.name;
                modelTypeDropDown.add(option);
            }
            chatInput.value = "";
        } catch (error) {
            
            throw new Error("An error occurred:", error);
        }
    })();
}

loadModels()

var selectedModel;
var chatModel = document.getElementById("modelTypeDropdown");
chatModel.addEventListener("changed", (event) => {
           
        
        
    selectedModel = chatModel.options[chatModel.selectedIndex].text;
});


document.getElementById("clearChatHistBtn").addEventListener("click", clearHist);
document.getElementById("openNewWindowBtn").addEventListener("click",openWindow);

chats = await getData();
    var chatHandle = new ChatHistoryService();
    chatHandle.displayChat();
document.addEventListener('DOMContentLoaded', (event) => {
    
    
});
chatBtn.addEventListener("click", UpdateOutput);

const delBtn = document.getElementById("delBtn");
delBtn.addEventListener("click", removeImg);


document.addEventListener("beforeunload", function (e) {
  const service = new ChatHistoryService();
  service.clearChats();
  e.preventDefault();
});


chatInput.addEventListener('paste', () => {
    //if (event.key === 'Enter') {
       (async () => {
            try {
           
                const clipboardItems = await navigator.clipboard.read();
                for (const clipboardItem of clipboardItems) {
                    
                  if (clipboardItem.types.includes('image/png')) {
                    const blob = await clipboardItem.getType('image/png');
                    //const image = document.createElement('img');
                    
                    var image = document.getElementById("selected-image");
                    image.setAttribute("base64", await convertBlobToBase64(blob));
                    image.src = URL.createObjectURL(blob);
                    //document.body.appendChild(image);
                    
                    
                    
                    //var delBtn = document.getElementById("delBtn");
                    delBtn.style.display = "inherit";
                    break;
                  }
                }
              } catch (error) {
                console.error('Error reading from clipboard:', error);
              }
        })();
    //}
});


//}
