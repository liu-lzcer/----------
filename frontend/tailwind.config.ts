import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{ts,js,html}'],
  theme: {
    extend: {
      colors: {
        mac: {
          bg: '#f5f5f7',
          surface: '#ffffff',
          text: '#1f2937',
          muted: '#6b7280',
          primary: '#0a84ff',
          success: '#34c759',
          warning: '#ffd60a',
          danger: '#ff3b30',
          info: '#64d2ff'
        }
      },
      borderRadius: {
        mac: '14px'
      },
      boxShadow: {
        mac: '0 10px 30px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)'
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'PingFang SC',
          'Microsoft YaHei',
          'Segoe UI',
          ...defaultTheme.fontFamily.sans
        ]
      }
    }
  },
  plugins: []
} satisfies Config;


