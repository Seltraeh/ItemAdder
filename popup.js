const dropZone = document.getElementById("dropZone");

dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", async (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragover");

  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith(".json")) {
    const text = await file.text();
    try {
      const items = JSON.parse(text);
      if (Array.isArray(items) && items.every(item => "item_num" in item && "item_qty" in item)) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          // Step 1: Inject content.js to define processItems
          chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            files: ["content.js"]
          }, () => {
            // Step 2: Call processItems with the items
            chrome.scripting.executeScript({
              target: { tabId: tabs[0].id },
              func: (items) => {
                if (window.processItems) {
                  window.processItems(items);
                } else {
                  console.error("processItems function still not found after injection.");
                }
              },
              args: [items]
            }, (results) => {
              if (chrome.runtime.lastError) {
                console.error("Script execution error:", chrome.runtime.lastError.message);
              }
            });
          });
        });
      } else {
        alert("Invalid JSON format. Expected array of {item_num, item_qty}.");
      }
    } catch (err) {
      alert("Error parsing JSON: " + err.message);
    }
  } else {
    alert("Please drop a valid .json file.");
  }
});