/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      current: 'currentColor',
      inherit: 'inherit',
      ds: {
        bg: 'var(--ds-color-bg)',
        surface: 'var(--ds-color-surface)',
        'surface-hover': 'var(--ds-color-surface-hover)',
        'surface-active': 'var(--ds-color-surface-active)',
        border: 'var(--ds-color-border)',
        'border-strong': 'var(--ds-color-border-strong)',
        text: 'var(--ds-color-text)',
        'text-strong': 'var(--ds-color-text-strong)',
        'text-muted': 'var(--ds-color-text-muted)',
        'text-inverse': 'var(--ds-color-text-inverse)',
        accent: 'var(--ds-color-accent)',
        'accent-hover': 'var(--ds-color-accent-hover)',
        'accent-subtle': 'var(--ds-color-accent-subtle)',
        'on-accent': 'var(--ds-color-on-accent)',
        danger: 'var(--ds-color-danger)',
        'danger-hover': 'var(--ds-color-danger-hover)',
        'danger-subtle': 'var(--ds-color-danger-subtle)',
        'danger-text': 'var(--ds-color-danger-text)',
        warning: 'var(--ds-color-warning)',
        'warning-subtle': 'var(--ds-color-warning-subtle)',
        'warning-text': 'var(--ds-color-warning-text)',
        success: 'var(--ds-color-success)',
        'success-subtle': 'var(--ds-color-success-subtle)',
        'success-text': 'var(--ds-color-success-text)',
        info: 'var(--ds-color-info)',
        'info-subtle': 'var(--ds-color-info-subtle)',
        'info-text': 'var(--ds-color-info-text)',
        overlay: 'var(--ds-color-overlay)',
        focus: 'var(--ds-color-focus)',
      },
    },
    extend: {
      borderColor: {
        DEFAULT: 'var(--ds-color-border)',
      },
      divideColor: {
        DEFAULT: 'var(--ds-color-border)',
      },
      ringColor: {
        DEFAULT: 'var(--ds-color-focus)',
      },
      ringOffsetColor: {
        DEFAULT: 'var(--ds-color-bg)',
      },
      placeholderColor: {
        DEFAULT: 'var(--ds-color-text-muted)',
      },
      caretColor: {
        DEFAULT: 'var(--ds-color-accent)',
      },
      accentColor: {
        DEFAULT: 'var(--ds-color-accent)',
      },
      outlineColor: {
        DEFAULT: 'var(--ds-color-focus)',
      },
      borderRadius: {
        'ds-sm': 'var(--ds-radius-sm)',
        'ds-md': 'var(--ds-radius-md)',
        'ds-lg': 'var(--ds-radius-lg)',
        'ds-full': 'var(--ds-radius-full)',
      },
      fontFamily: {
        ds: 'var(--ds-font-family)',
      },
      maxWidth: {
        ds: 'var(--ds-content-max-width)',
        'ds-wide': 'var(--ds-content-wide-max-width)',
      },
      boxShadow: {
        ds: 'var(--ds-shadow)',
        'ds-top': 'var(--ds-shadow-top)',
      },
    },
  },
  plugins: [],
}
