# Cones
Daily habit tracking

## Project structure

```text
.
├── index.html              # Loads Babel + script order for the app
├── styles/
│   └── main.css            # Global styles
└── src/
    ├── config.js           # Theme tokens, constants, icons, helpers, Supabase client
    ├── components.js       # Shared UI components
    ├── app.js              # Root app and navigation shell
    └── pages/
        ├── shared.js       # Page-shared helpers
        ├── auth.js         # Auth page
        ├── settings.js     # Settings page
        ├── today.js        # Today page
        ├── habits.js       # Habits page
        ├── goals.js        # Goals page
        ├── notes.js        # Notes page
        └── overview.js     # Overview page
```
