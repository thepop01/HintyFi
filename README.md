<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1g_zTe32SsdrrVLZagukT812e7g9QuYbz

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## 🧰 Developer Tips

If the app shows a blank white screen, follow these steps:
1. Open the browser console to check for errors.
2. Run `localStorage.clear()` once manually in the console.
3. Restart the development server with `npm run dev` to clear the Vite cache.
4. If issues persist, delete the `.vite` folder in your project directory.
