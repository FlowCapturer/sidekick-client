# SideKick Client

## Installation

```bash
npm install sidekick-client
```

## Important: Setup

This package uses **Tailwind CSS v4** and requires you to have Tailwind installed in your consuming application.

### Prerequisites

Install the required peer dependencies in your project:

```bash
npm install tailwindcss@^4.0.0 @tailwindcss/vite@^4.0.0
```

### Vite Configuration

Add the Tailwind plugin to your `vite.config.ts`:

```typescript
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // ... rest of your config
});
```

### CSS Import

**IMPORTANT**: You must import the package's CSS file in your application's entry point (e.g., `main.tsx` or `index.tsx`):

```typescript
// main.tsx or index.tsx
import 'sidekick-client/dist/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

The CSS file contains all the Tailwind utilities and custom styles needed for the components to work properly.

## Usage

```typescript
import { SideKickClient } from 'sidekick-client';
import type { NavItem } from 'sidekick-client';

function App() {
  return (
    <SideKickClient
    // your props here
    />
  );
}
```

## Theming

This package supports full theme customization through CSS variables. You can override colors, border radius, and other design tokens to match your brand.

### Quick Example

```css
/* In your app's CSS file, BEFORE importing the package CSS */
:root {
  --sk-primary: oklch(0.5 0.3 250); /* Custom primary color */
  --sk-radius: 1rem; /* Custom border radius */
}
```

## Available Exports

### Components

- `SideKickClient` - Main component

### Types

- `NavItemSub`
- `NavItem`
- `LoginCmd`
- `OrganizationType`
- `OrganizationTypeResponse`
- `loggedInUserInf`
- `purchasedPlansInfResponse`
- `purchasedPlansInf`
- `SessionInfoResponse`
- `EmailProcessingResult`
- `TeamMembersDetails`
- `responseTeamMembersInf`
- `IEachInvitation`
- `IInvitationsResponse`
- `ICountry`
- `ICountries`
- `ICreateOrderResponse`
- `IVerifyPaymentResponse`

## Troubleshooting

### Styles not appearing

If styles are not appearing in your application:

1. **Import the CSS**: Make sure you've imported `sidekick-client/dist/index.css` in your entry file
2. **Verify Tailwind is installed**: Make sure you have `tailwindcss@^4.0.0` and `@tailwindcss/vite@^4.0.0` installed
3. **Check Vite config**: Ensure the `@tailwindcss/vite` plugin is added to your Vite configuration
4. **Restart dev server**: After making changes, restart your development server

### Build Issues

If you encounter build issues:

1. Make sure all peer dependencies are installed (check `package.json` peerDependencies)
2. Ensure you're using compatible versions of React (^18.0.0 or ^19.0.0)
3. Clear your `node_modules` and reinstall if needed
