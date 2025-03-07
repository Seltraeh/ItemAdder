# Item Adder Chrome Extension

A Chrome extension to automate tedious data entry on a company website hosted by AWS. Drag and drop a JSON file with item codes and quantities to populate the form effortlessly.

## Features
- **Drag-and-Drop**: Load items from a JSON file directly into the extension popup.
- **Automation**: Fills the `estimate-items` field, selects autocomplete options, sets quantities, and clicks "Add Item."
- **Scoped**: Works on specific project view pages (`https://website.com/apps/project/*`).
- **Error Handling**: Color-coded console logs for easy debugging.

## Demo
![Item Adder in Action](assets/demo.gif)

## Installation

### From Chrome Web Store
1. Visit [Item Adder on Chrome Web Store](https://chromewebstore.google.com/detail/dbkchnmkanheomghpiicapmogkfiemoj?utm_source=item-share-cb).
2. Click **Add to Chrome**.
3. Sign into Chrome with sync enabled to use it on any device.

### From Source (Unpacked)
1. Clone this repo: `git clone https://github.com/Seltraeh/ItemAdder.git`
2. Open Chrome > `chrome://extensions/` > Enable **Developer mode**.
3. Click **Load unpacked** and select the repo folder.

## Usage
1. Navigate to a project view page (e.g., `<company>.com/apps/project/some-id`).
2. Click the extension icon in the Chrome toolbar.
3. Drag a JSON file (e.g., `items.json`) into the popup:
   ```json
   [
     {"item_num": 832507, "item_qty": 200},
     {"item_num": 837008, "item_qty": 5}
   ]
