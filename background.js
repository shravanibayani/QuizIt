chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getTabUrl') {
      // Get the url of current active tab
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const activeTab = tabs[0];

          // Check if the active tab is a YouTube page
          if (activeTab && activeTab.url.includes("youtube.com")) {
              const url = activeTab.url;

              // Fetching data from Flask (server)
              fetch(`http://127.0.0.1:5000/getquiz?url=${encodeURIComponent(url)}`)
                  .then(response => {
                      if (!response.ok) {
                          throw new Error('Network response was not ok');
                      }
                      return response.json();
                  })
                  .then(data => {
                      // Send the received data back to the content script
                      console.log(data);
                      sendResponse({ url: activeTab.url, quizData: data });
                  })
                  .catch(error => {
                      console.error('Error fetching quiz data:', error);
                      sendResponse({ error: 'Failed to fetch quiz data' });
                  });
          } else {
              console.log("This extension only works on YouTube pages from background script.");
              sendResponse({ error: "Not a YouTube page" });
          }
      });

      return true;
  }
});
