/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                garden: {
                    dark: '#1e3a8a',
                    light: '#34c759',
                    soil: '#d7ccc8',
                    accent: '#007aff',
                },
                // Apple Minimalist Palette
                apple: {
                    gray: {
                        50: '#fbfbfd',
                        100: '#f5f5f7', // Main BG
                        200: '#e8e8ed',
                        300: '#d2d2d7',
                        400: '#aeaeb2',
                    },
                    text: {
                        primary: '#1d1d1f',
                        secondary: '#86868b',
                        tertiary: '#98989d',
                    },
                    green: {
                        light: '#e4f7e6',
                        DEFAULT: '#34c759',
                        dark: '#248a3d',
                    },
                    red: '#ff3b30',
                    blue: '#007aff',
                },
            },
            boxShadow: {
                'apple-card': '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
                'apple-hover': '0 8px 16px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.03)',
                'apple-panel': '0 0 20px rgba(0, 0, 0, 0.05)',
            },
            fontFamily: {
                sans: ['-apple-system', 'BlinkMacSystemFont', 'San Francisco', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
