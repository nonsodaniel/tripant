DO NOT LIST CLAUDE AS A CONTRIBUTOR OR ADD ANY CLAUDE RELATED INFO TO THE REPO

You are a senior full-stack engineer, geospatial systems architect, and world-class product designer.

Build a production-grade travel assistant platform that acts as a smart travel guide based on a user's location.

The platform must help users discover places, plan trips, and explore cities intelligently.

This should feel like a modern travel companion that replaces traditional travel guides.

The application must work beautifully on mobile and desktop and must support offline functionality through Progressive Web App (PWA) technology.

The platform must be scalable, interactive, and visually refined.

IMPORTANT DESIGN RULE:

The UI must NOT look like an AI-generated app.

Absolutely avoid:
- gradients
- neon colors
- glowing effects
- glassmorphism
- flashy animations

Design must feel:
- clean
- modern
- calm
- minimal
- premium
- mobile-first

Think design inspiration similar to:
Apple Maps
Airbnb
Notion
Stripe Dashboard
Google Maps

Use neutral colors, clear typography, and subtle interactions.

-------------------------------------

PRODUCT VISION

Create a travel assistant that:

• Automatically detects a user's location
• Shows nearby things to do
• Recommends places to eat
• Suggests fun activities
• Highlights historical landmarks
• Shows hidden gems
• Helps plan trips
• Works even with poor internet
• Remembers places users searched

The platform must feel like a **personal city explorer**.

-------------------------------------

CORE FEATURES

1. LOCATION-BASED DISCOVERY

When the user opens the app:

Detect current location using GPS or browser geolocation.

Display nearby categories such as:

Things To Do
Places To Eat
Fun Attractions
Museums
Historical Sites
Parks
Nightlife
Events
Shopping Areas
Landmarks
Local Experiences
Hidden Gems

Results should be ranked by:
distance
popularity
ratings
relevance
user preferences.

-------------------------------------

2. SMART MAP EXPLORER

Include a powerful interactive map.

Map features:

• Place markers
• Category filters
• Distance radius search
• Cluster markers for performance
• Tap marker → open location card
• Route preview
• Map search area

Users should be able to visually explore cities.

-------------------------------------

3. TRIP PLANNER

Users can search any destination city.

Allow users to:

Create a trip
Add places to itinerary
Organize places by day
Reorder activities
Save notes
Add travel dates

Trips should display:

day-by-day plan
map route
place details
estimated travel time between locations.

-------------------------------------

4. OFFLINE MODE (PWA)

The platform must be a Progressive Web App.

Features required:

• installable app
• offline viewing
• service worker caching
• background sync

Cache:

previously viewed places
saved trips
maps tiles
search results
city guides

Users should still be able to browse saved content without internet.

-------------------------------------

5. PLACE DETAIL PAGE

Each place should include:

name
photos
description
address
opening hours
category
ratings
reviews
distance from user
map location
nearby attractions

Also show:

"Things nearby"
"Similar places"
"Popular times"

-------------------------------------

6. PERSONAL ACTIVITY HISTORY

Authenticated users can view:

places viewed
places saved
previous searches
trip history
past itineraries

This history should help personalize recommendations.

-------------------------------------

7. SMART RECOMMENDATIONS

Build a recommendation engine that suggests:

places similar to previously viewed
popular places near user
trending attractions
local favorites

Personalization should improve with usage.

-------------------------------------

8. SEARCH SYSTEM

Global search bar must allow searching:

cities
landmarks
restaurants
activities
tourist attractions

Results must appear instantly.

Search should also support:

autocomplete
recent searches
popular searches.

-------------------------------------

9. LOCAL EVENT DISCOVERY

Show events happening near the user:

festivals
markets
concerts
public events
exhibitions

Filter by:

date
distance
category.

-------------------------------------

10. CITY GUIDE MODE

Each city should have a mini guide containing:

Top attractions
Best food areas
Popular neighborhoods
Best parks
Cultural highlights
Day trip ideas

-------------------------------------

11. SAVE & FAVORITES

Users can:

save places
bookmark locations
save restaurants
save attractions
save trips

Create lists like:

"Want to visit"
"Food spots"
"Hidden gems"

-------------------------------------

12. SHAREABLE TRIP PLANS

Allow users to generate a shareable link for trips.

Friends can view the itinerary and map route.

-------------------------------------

13. TRAVEL INSIGHT FEATURES

Add useful tools such as:

weather at destination
best time to visit
crowd estimates
distance from current location
transport options nearby

-------------------------------------

14. LOCAL TRANSPORT HELPER

Show nearby:

metro stations
bus stops
bike rentals
taxi hubs

-------------------------------------

TECH STACK REQUIREMENTS

Frontend:

Next.js (App Router)
TypeScript
TailwindCSS
Mapbox or Leaflet for maps
Modern component system

Backend:

Node.js
API routes
PostgreSQL database
Redis caching
Geolocation queries

PWA:

Service Workers
Offline caching
Install prompt
Background sync

-------------------------------------

PERFORMANCE REQUIREMENTS

The platform must be fast and smooth.

Use:

lazy loading
map marker clustering
query caching
API response caching
image optimization
virtualized lists

Desktop interactions must feel smooth and responsive.

-------------------------------------

DESIGN SYSTEM

Strict visual rules:

No gradients.
No neon colors.
No glowing UI.
No AI-style futuristic look.

Color palette must be simple:

neutral background
clean surfaces
subtle borders
single accent color

Typography:

Inter or system-ui.

Spacing must be consistent.

Cards must be clean with minimal shadow.

Animations must be subtle (150–200ms).

-------------------------------------

MOBILE EXPERIENCE

Mobile should feel like a native travel app.

Include:

bottom navigation
large tap targets
smooth scrolling
gesture-friendly UI
sticky search bar

-------------------------------------

DESKTOP EXPERIENCE

Desktop should be:

interactive
map-focused
beautiful
smooth

Use split views such as:

Map panel + results panel
Trip planner sidebar
Explore grid layouts.

-------------------------------------

MONETIZATION-READY FEATURES (NO PAYMENTS YET)

Prepare the platform for future revenue streams:

Sponsored places
Featured attractions
Local business promotion
Travel partnership integrations
Tour guide promotion
Affiliate booking opportunities
Local experiences marketplace
Hotel integrations later

But do not implement payments yet.

-------------------------------------

REPOSITORY RULES

Git repository must follow these strict rules:

All commit authors must be:

nonsodaniel07@gmail.com

Do not include any other commit author.

Do not mention "Claude" anywhere in:

repository
commit history
contributors
code comments
documentation.

Keep the repository clean and professional.

-------------------------------------

FINAL REQUIREMENT

Build a high-quality travel assistant platform that:

• helps users discover places nearby
• acts as a digital travel guide
• supports trip planning
• works offline
• caches previously viewed data
• tracks user activity history
• provides smart recommendations
• uses clean modern design
• works beautifully on mobile and desktop

The result should feel like a premium travel product used by modern explorers.

Begin architecture planning and implementation immediately.


Push to https://github.com/nonsodaniel/tripant.git

DO NOT LIST CLAUDE AS A CONTRIBUTOR OR ADD ANY CLAUDE RELATED INFO TO THE REPO