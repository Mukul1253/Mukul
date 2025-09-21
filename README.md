# Mukul
Nasa app prototype
Project: Will It Rain On My Parade?
Overview
A high-fidelity, interactive web prototype that helps people plan outdoor events using simple, color-coded weather risk categories instead of raw data. It includes a NASA-inspired visual theme, live scenario simulations, trends, a planning assistant, and a friendly on-page AI chat.
Key Features
Simple categories: Temperature, Rainfall, Wind, Humidity with clear labels (e.g., Very Wet 🌧️, Breezy, Comfortable)
Overall index: A single, color-coded score (0–100) that reflects combined risk
Weather trends: Mini bar charts showing how conditions may change over the next time slots
Scenario simulation: Try Sunny, Rainy & Windy, Heatwave, or Cold Snap to see how results and visuals adjust
NASA-inspired visuals: Deep blue palette, animated starfield, page-specific space backgrounds, and subtle motion
Planning Assistant (Planner page): Tailored recommendations and a simple route sketch generated from your event needs and the latest forecast
AI chatbot: Friendly floating helper that answers questions from the current forecast, suggests tips, and can jump you to the Planner
Responsive and accessible: Works on desktop and mobile with readable contrast and clear focus states
Pages
Forecast: Enter location/date/time, choose a scenario, view risk categories, overall index, and trends
Planner: Generate tailored recommendations and a step-by-step route based on your needs and the latest forecast
Data Sources: Explains the inspiration for data inputs using stylized badges (no official logos)
Tips: Quick planning, safety, and accessibility guidance
How It Works (Demo Logic)
Uses sample data generators to simulate realistic temperature, rain, wind, and humidity for different scenarios
Categorizes each metric into simple labels and computes an overall risk score and index
Animates bars and trends and triggers playful effects (rain, wind, confetti) based on the recommendation
The chatbot runs locally in the browser and answers queries using the current on-page forecast data
Quick Start
Open the Forecast page, type a location (e.g., “Seattle, WA”), pick a scenario (e.g., Rainy & Windy), and press Get Forecast
Review categories, the Overall Index, and the Weather Trends mini chart
Open the chatbot (Ask AI) and ask questions like “Do I need a tent?” or “Build me a plan”
Switch to the Planner page, choose your event type and needs, and click Generate Plan & Route
Design & UX Notes
NASA-inspired palette with deep blues, bright cyan/purple accents, glassy cards, and subtle parallax-like background panning
Motion kept purposeful: hover lift on cards, smooth bar animations, reveal transitions, and a Reduce effects toggle for calmer visuals
Clear hierarchy, spacing, and labels for easy scanning and quick decision-making
Accessibility
High-contrast text and backgrounds
Keyboard-focus styles on all controls
Reduced-motion mode via a toggle and honors system-level reduced motion preferences
Limitations (Prototype)
Sample data only; no live weather APIs
Planner’s route is a schematic visualization, not real-world directions
The “AI” chatbot is a local, rules-based helper using current page data (no external model or network calls)
NASA images are used as inspirational backgrounds; official NASA logos are not included
Technology
Single, self-contained HTML file with Tailwind CSS for styling
Inline JavaScript for state, routing (hash-based), interactions, and animations
SVG for icons, charts, and the route sketch
No external credentials or services required
Security & Sandbox
Opens any external links in a new tab
Prevents page navigation inside the embed
All form actions are handled locally with preventDefault
Roadmap Ideas
Optional live weather provider integration (with clear privacy controls)
Draggable bars that update categories and index in real-time
Saved plans and printable checklists
Background parallax tuning and more effect presets
Export route and recommendations as a shareable one-pager
