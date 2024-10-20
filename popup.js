document.addEventListener('DOMContentLoaded', () => {
  const generateQuiz = document.getElementById("generateQuiz");

  generateQuiz.addEventListener("click", () => {

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];

      
      if (activeTab.url.includes("youtube.com")) {
        
        chrome.tabs.sendMessage(activeTab.id, { action: "checkScript" }, (response) => {
         
          if (chrome.runtime.lastError || !response) {
            console.log("Content script not injected. Injecting now.");

           
            chrome.scripting.executeScript({
              target: { tabId: activeTab.id },
              files: ['content.js']
            }, () => {
              console.log("Content script injected.");
              chrome.tabs.sendMessage(activeTab.id, { action: "showQuizBox" });
              window.close();
            });
          } else {
            chrome.tabs.sendMessage(activeTab.id, { action: "showQuizBox" });
            window.close();
          }
        });
      } else {
        window.close();
        alert("This extension only works on YouTube. Please open YouTube to generate a quiz. :)");
      }
    });
  });
});
