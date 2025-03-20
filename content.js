// Prevent the script from running multiple times
if (!window.itemAdderLoaded) {
  window.itemAdderLoaded = true;

  // Declare global variables for DOM elements
  let itemField = null; // Input field for item number
  let qtyField = null;  // Input field for quantity
  let submitButton = null; // "Add Item" button

  // Utility function to wait for the DOM to be fully loaded
  function waitForDOM() {
    return new Promise((resolve) => {
      if (document.readyState === "complete" || document.readyState === "interactive") {
        resolve();
      } else {
        document.addEventListener("DOMContentLoaded", resolve);
      }
    });
  }

  // Initialize DOM elements required for the script
  async function initializeElements() {
    // Wait for the DOM to be ready
    await waitForDOM();

    // Locate the item field, quantity field, and submit button
    itemField = document.getElementById("estimate-items");
    qtyField = document.getElementById("qty");
    submitButton = document.querySelector(".col-md-2 .v-btn");

    // Check if all required elements are found
    if (!itemField || !qtyField || !submitButton) {
      console.error(
        "%cRequired elements not found on page: { itemField: %s, qtyField: %s, submitButton: %s }",
        "color: red",
        !!itemField,
        !!qtyField,
        !!submitButton
      );
      return false;
    }

    // Log successful initialization
    console.log("Elements initialized:", {
      itemField: itemField.id,
      qtyField: qtyField.id,
      submitButton: submitButton.outerHTML
    });
    return true;
  }

  // Pre-activate the item field to ensure it’s ready for input
  async function preActivateField() {
    if (!itemField) return;

    // Focus and clear the item field to prepare for input
    itemField.click();
    itemField.focus();
    itemField.value = "";
    itemField.dispatchEvent(new Event("input", { bubbles: true }));

    // Wait 1 second to ensure the field is ready
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Process a single item by filling fields and submitting
  async function enterItem(item) {
    // Validate that DOM elements are initialized
    if (!itemField || !qtyField || !submitButton) {
      console.error(
        "%cElements not initialized for item %s",
        "color: red",
        item.item_num
      );
      return;
    }

    // Validate item number
    if (!item.item_num) {
      console.error(
        "%cItem number is missing or invalid for item: %s",
        "color: red",
        JSON.stringify(item)
      );
      return;
    }

    // Normalize item number to string and trim whitespace
    const normalizedItemNum = String(item.item_num).trim();
    console.log(`Processing item_num: ${normalizedItemNum} (type: ${typeof item.item_num})`);

    // Clear input fields to start fresh
    itemField.value = "";
    qtyField.value = "";
    itemField.dispatchEvent(new Event("input", { bubbles: true }));
    qtyField.dispatchEvent(new Event("input", { bubbles: true }));

    // Fill the item field to trigger autocomplete
    itemField.focus();
    itemField.click();
    itemField.value = normalizedItemNum;
    itemField.dispatchEvent(new Event("input", { bubbles: true }));
    itemField.dispatchEvent(new Event("change", { bubbles: true }));

    console.log(`Filled itemField with ${normalizedItemNum}`);

    // Wait 250ms for the autocomplete to start fetching results
    await new Promise(resolve => setTimeout(resolve, 250));

    // Monitor the dropdown for matching items
    let dropdownContainer = null;
    let options = [];
    for (let attempts = 0; attempts < 12; attempts++) { // Max 3 seconds
      // Re-fill itemField if the website clears it prematurely
      if (itemField.value !== normalizedItemNum) {
        console.warn(
          "%citemField was cleared prematurely for %s, re-filling",
          "color: orange",
          normalizedItemNum
        );
        itemField.value = normalizedItemNum;
        itemField.dispatchEvent(new Event("input", { bubbles: true }));
        itemField.dispatchEvent(new Event("change", { bubbles: true }));
      }

      // Check for the dropdown container
      dropdownContainer = document.querySelector(".v-menu__content.v-autocomplete__content");
      if (dropdownContainer) {
        options = dropdownContainer.querySelectorAll(".v-list-item.v-list-item--link");
        // If the dropdown only shows "CREATE NEW ITEM", the item doesn’t exist
        if (options.length === 1 && options[0].textContent.trim() === "CREATE NEW ITEM") {
          console.error(
            "%cDropdown condensed to only 'CREATE NEW ITEM' for %s",
            "color: red",
            normalizedItemNum
          );
          break;
        }
        // Check if the first dropdown item matches the item number
        if (options.length > 1) {
          const firstOptionText = options[0].textContent.trim();
          const firstOptionCode = firstOptionText.substring(0, 6).trim();
          if (firstOptionCode === normalizedItemNum) {
            console.log(`Dropdown first item matches ${normalizedItemNum}: ${firstOptionText}`);
            break;
          }
        }
      }
      console.log(
        `%cWaiting for dropdown on attempt ${attempts + 1} for ${normalizedItemNum}, items found: ${options.length}`,
        "color: orange"
      );
      // Poll every 250ms
      await new Promise(resolve => setTimeout(resolve, 250));
    }

    // Check if the dropdown failed to load or is empty
    if (!dropdownContainer || options.length === 0) {
      console.error(
        "%cDropdown not found or empty after retries for %s",
        "color: red",
        normalizedItemNum
      );
      itemField.value = "";
      itemField.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    // Check if the dropdown only contains "CREATE NEW ITEM"
    if (options.length === 1 && options[0].textContent.trim() === "CREATE NEW ITEM") {
      console.error(
        "%cCouldn't find %s in dropdown",
        "color: red",
        normalizedItemNum
      );
      itemField.value = "";
      itemField.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    // Log available dropdown options for debugging
    console.log(`Dropdown options for ${normalizedItemNum}:`, Array.from(options).map(opt => opt.textContent.trim()));

    // Find the matching dropdown option
    let selectedOption = null;
    for (const option of options) {
      const text = option.textContent.trim();
      if (text === "CREATE NEW ITEM") continue; // Skip "CREATE NEW ITEM"
      const dropdownItemCode = text.substring(0, 6).trim();
      console.log(`Comparing item_num: "${normalizedItemNum}" (length: ${normalizedItemNum.length}) with dropdown item code: "${dropdownItemCode}" (length: ${dropdownItemCode.length}) from text: ${text}`);
      console.log(`Are they equal? ${dropdownItemCode === normalizedItemNum}`);
      if (dropdownItemCode === normalizedItemNum) {
        selectedOption = option;
        console.log(`Match found for ${normalizedItemNum}! Setting selectedOption.`);
        break;
      }
    }

    // Click the matching dropdown option if found
    if (selectedOption) {
      console.log(`Found matching option for ${normalizedItemNum}: ${selectedOption.textContent.trim()}`);
      try {
        selectedOption.click();
        console.log(`Clicked option for ${normalizedItemNum}: ${selectedOption.textContent.trim()}`);
      } catch (error) {
        console.warn(
          "%cFailed to click outer element for %s, trying inner element",
          "color: orange",
          normalizedItemNum
        );
        const innerOption = selectedOption.querySelector(".v-list-item");
        if (innerOption) {
          innerOption.click();
          console.log(`Clicked inner option for ${normalizedItemNum}: ${innerOption.textContent.trim()}`);
        } else {
          console.error(
            "%cNo inner element found to click for %s",
            "color: red",
            normalizedItemNum
          );
          return;
        }
      }
    } else {
      console.error(
        "%cNo matching option found for %s in dropdown",
        "color: red",
        normalizedItemNum
      );
      itemField.value = "";
      itemField.dispatchEvent(new Event("input", { bubbles: true }));
      return;
    }

    // Fill the quantity field
    qtyField.focus();
    const normalizedQty = Math.floor(Number(item.item_qty)).toString();
    qtyField.value = normalizedQty;
    qtyField.dispatchEvent(new Event("input", { bubbles: true }));
    qtyField.dispatchEvent(new Event("change", { bubbles: true }));
    qtyField.dispatchEvent(new Event("blur", { bubbles: true }));

    console.log(`Filled qtyField with ${normalizedQty}`);

    // Wait 100ms to ensure the "Add Item" button is enabled
    await new Promise(resolve => setTimeout(resolve, 100));

    // Click the "Add Item" button
    if (!submitButton.disabled) {
      submitButton.click();
      console.log(`Clicked Add Item for ${normalizedItemNum}`);
    } else {
      console.error(
        "%cButton disabled after filling fields for %s",
        "color: red",
        normalizedItemNum
      );
      console.log("Button HTML:", submitButton.outerHTML);
    }
  }

  // Process all items in the provided list
  async function processItems(items) {
    // Initialize DOM elements
    const initialized = await initializeElements();
    if (!initialized) {
      console.error("%cAborting due to missing elements.", "color: red");
      return;
    }

    // Pre-activate the item field
    await preActivateField();

    // Process each item in the list
    for (let i = 0; i < items.length; i++) {
      console.log(`Processing item ${i + 1}: ${items[i].item_num}`);
      await enterItem(items[i]);
    }

    console.log("All items processed!");
  }

  // Expose the processItems function globally
  window.processItems = processItems;
}
