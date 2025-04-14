const dropZone = document.getElementById("dropZone");
const pasteArea = document.getElementById("pasteArea");
const submitPaste = document.getElementById("submitPaste");

// Handle drag-and-drop (unchanged)
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
        executeProcessItems(items);
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

// Handle pasted data
submitPaste.addEventListener("click", () => {
  const text = pasteArea.value.trim();
  if (!text) {
    alert("Please paste some data first.");
    return;
  }

  try {
    const items = parsePastedData(text);
    if (items.length > 0) {
      executeProcessItems(items);
      pasteArea.value = ""; // Clear textarea after successful processing
    } else {
      alert("No valid items found in pasted data.");
    }
  } catch (err) {
    alert("Error processing pasted data: " + err.message);
  }
});

// Parse tab-separated Excel data
function parsePastedData(text) {
  const lines = text.split("\n").filter(line => line.trim());
  const items = [];

  for (const line of lines) {
    const [item_num, item_qty] = line.split("\t").map(str => str.trim());
    if (item_num && item_qty) {
      const qty = Number(item_qty);
      if (!isNaN(qty) && qty > 0) {
        items.push({ item_num, item_qty: qty });
      }
    }
  }

  return items;
}

// Execute processItems in the active tab
function executeProcessItems(items) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ["content.js"]
    }, () => {
      if (chrome.runtime.lastError) {
        console.error("Script injection error:", chrome.runtime.lastError.message);
        alert("Error injecting script: " + chrome.runtime.lastError.message);
        return;
      }
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        func: (items) => {
          if (window.processItems) {
            window.processItems(items);
          } else {
            console.error("processItems function not found.");
          }
        },
        args: [items]
      }, (results) => {
        if (chrome.runtime.lastError) {
          console.error("Script execution error:", chrome.runtime.lastError.message);
          alert("Error executing script: " + chrome.runtime.lastError.message);
        }
      });
    });
  });
}