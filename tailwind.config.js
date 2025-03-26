/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,ts,jsx,tsx}',
    ],

    theme: {
        extend: {
            colors: {
                dark: '#111111',
                blue: '#00ADEE',
                orange: '#FF914D',
                ad: '#FF474A'
            }
        },
    },
};