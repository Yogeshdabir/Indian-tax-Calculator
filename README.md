# Indian Tax Calculator (Static Web App)

A lightweight, browser-based Indian income tax calculator designed for static hosting (e.g., GitHub Pages).

## Interface Preview
- Input annual income and deductions.
- Calculate tax under a configurable slab model.
- View gross income, taxable income, tax before cess, cess, and total tax payable.
- See slab-by-slab tax contribution breakdown.

## Run Locally
Open `index.html` directly in your browser.

## Files
- `index.html` – UI structure
- `styles.css` – responsive styling
- `script.js` – tax calculation logic + DOM updates

## Notes
- Tax configuration is currently embedded in `script.js` for easy static deployment.
- Slabs, rebate threshold, and cess rate can be updated in one place.
