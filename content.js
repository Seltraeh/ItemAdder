if (!window.itemAdderLoaded) {
  window.itemAdderLoaded = true;

  let itemField = null;
  let qtyField = null;
  let submitButton = null;

  function waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === "complete" || document.readyState === "interactive") {
        resolve();
      } else {
        document.addEventListener("DOMContentLoaded", resolve);
      }
    });
  }

  async function initializeElements() {
    await waitForDOM();
    itemField = document.getElementById("estimate-items");
    qtyField = document.getElementById("qty");
    submitButton = document.querySelector("div[data-v-4e32f486] .v-btn");

    if (!itemField || !qtyField || !submitButton) {
      console.error("Required elements not found on page:", {
        itemField: !!itemField,
        qtyField: !!qtyField,
        submitButton: !!submitButton
      });
    }
  }

  async function preActivateField() {
    if (!itemField) return;
    itemField.click();
    itemField.focus();
    itemField.value = ""; // Clear it to avoid confusion
    itemField.dispatchEvent(new Event("input"));
    await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay to let autocomplete initialize
  }

  async function enterItem(item) {
    if (!itemField || !qtyField || !submitButton) {
      console.log(`%cElements not initialized for ${item.item_num}`, 'background: #222; color: #ff0000');
      return;
    }

    itemField.value = "";
    qtyField.value = "";

    itemField.click();
    itemField.focus();

    itemField.value = item.item_num;
    itemField.dispatchEvent(new Event("input"));
    itemField.dispatchEvent(new Event("change"));

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Retry loop for dropdown
    let dropdownContainer = null;
    for (let attempts = 0; attempts < 3; attempts++) {
      dropdownContainer = document.querySelector(".v-menu__content.v-autocomplete__content");
      if (dropdownContainer) break;
      console.log(`%cDropdown not found on attempt ${attempts + 1} for ${item.item_num}, retrying...`, 'background: #222; color: #ffa500');
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    if (!dropdownContainer) {
      console.log(`%cDropdown not found after retries for ${item.item_num}`, 'background: #222; color: #ff0000');
      return;
    }

    const options = dropdownContainer.querySelectorAll(".v-list-item");
    let selectedOption = null;
    for (const option of options) {
      const text = option.textContent.trim();
      if (text !== "CREATE NEW ITEM") {
        selectedOption = option;
        break;
      }
    }

    if (selectedOption) {
      selectedOption.click();
      console.log(`Selected option for ${item.item_num}: ${selectedOption.textContent}`);
    } else {
      console.log(`%cNo valid option found for ${item.item_num}`, 'background: #222; color: #ff0000');
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    qtyField.value = item.item_qty;
    qtyField.dispatchEvent(new Event("input"));

    await new Promise(resolve => setTimeout(resolve, 1000));

    if (submitButton && !submitButton.disabled) {
      submitButton.click();
      console.log(`Clicked Add Item for ${item.item_num}`);
    } else {
      console.log(`%cButton not enabled or not found for ${item.item_num}, disabled: ${submitButton ? submitButton.disabled : 'button missing'}`, 'background: #222; color: #ff0000');
    }
  }

  async function processItems(items) {
    await initializeElements();
    if (!itemField || !qtyField || !submitButton) return;

    // Pre-activate the field before processing items
    await preActivateField();

    for (let i = 0; i < items.length; i++) {
      console.log(`Processing item ${i + 1}: ${items[i].item_num}`);
      await enterItem(items[i]);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    console.log("All items processed!");
  }

  window.processItems = processItems;
}