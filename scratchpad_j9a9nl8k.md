# Website Styling Audit: https://the7-studio.vercel.app

## Todo List
- [x] Open the homepage URL https://the7-studio.vercel.app
- [x] Inspect the layout, text overlapping, and styling of the homepage
- [x] Capture a screenshot of the homepage
- [x] Check browser console logs for any errors (network, JS, CSS)
- [x] Check other pages if they exist (e.g. Booking, Contact)
- [x] Summarize findings

## Audit Findings
1. **Missing Stylesheet (404 Error):**
   - The CSS file `https://the7-studio.vercel.app/css/style.css` returns a 404 NOT FOUND error.
   - As a result, the entire website is completely unstyled (default browser HTML layout).
2. **Missing JavaScript (404 Error):**
   - The JavaScript file `https://the7-studio.vercel.gapp/js/script.js` returns a 404 NOT FOUND error.
   - Any dynamic functionality (including the booking/inquiry form handlers) will not work.
3. **Missing Logo (404 Error):**
   - The logo image at `https://the7-studio.vercel.app/images/logo.svg` returns a 404 NOT FOUND error.
4. **Broken Images (Local File Paths):**
   - The image elements on the homepage (specifically in the "Recent Work" section) reference local Windows file paths (e.g., `c:\Users\hpaid\Pictures\The7.Studio\024A6835.jpg`) instead of relative paths in the deployed environment. This makes all these images broken on the live site.
5. **Other Pages:**
   - Other pages (`about.html`, `contact.html`) are accessible but suffer from the same missing styles (404 stylesheet) and missing scripts.
