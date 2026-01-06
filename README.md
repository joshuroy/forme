# forme

Chrome extension: **Sale Size & Sort Assistant**

The extension detects when the current page URL contains the word "sale" and:
- Tries to set any size-related selector to **Medium**.
- Tries to set sorting controls to **price: low to high**.

It looks for selects, radios, and checkboxes with labels/names that mention size or sorting and automatically chooses the best matching option.

## Load the extension in Chrome
1. Open **chrome://extensions** and enable **Developer mode**.
2. Click **Load unpacked**.
3. Choose the `extension` folder in this repository.
4. Visit a sale page; the extension will apply size and sorting preferences automatically on matching elements.
