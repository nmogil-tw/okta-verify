/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'twilio-red': '#F22F46',
        'okta-blue': '#007DC1',
      },
    },
  },
  plugins: [],
}
