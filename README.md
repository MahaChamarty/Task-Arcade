# TaskArcade
> A gamified To-Do List application that transforms daily productivity into an exciting RPG adventure.

TaskArcade is a modern task management application built using **HTML, CSS, and JavaScript**. Instead of simply checking off tasks, users earn XP, level up, defeat weekly bosses, maintain streaks, and unlock achievements—making productivity fun and engaging.

## Features

### Task Management
- Create, edit, and delete tasks
- Mark tasks as completed
- Search tasks instantly
- Filter by:
  - Pending
  - Completed
  - Priority
  - Category
- Sort by:
  - Newest
  - Oldest
  - Due Date
  - Priority

### Gamification
-  XP and Level System
-  Weekly Boss Battles
-  Boss damage based on task priority
-  Daily Streak Tracking
-  Achievement Badges
-  Level-up animations and confetti

### User Experience
- Dark & Light Theme
- Responsive Design
- Grid & List View
- Beautiful Glassmorphism UI
- Custom Color Themes for Tasks
- Toast Notifications
- Undo Delete Feature

### Sound Effects
Built using the **Web Audio API** with no external audio files.
Includes:
- Button Click
- Task Completion
- Boss Hit
- Level Up
- Boss Defeat
- Delete Sound

### Data Persistence
Uses **LocalStorage** to store:
- Tasks
- User XP
- Levels
- Daily Streak
- Boss Progress
- Theme Preference
- Sound Preference

No backend or database is required.

## Tech Stack
- HTML5
- CSS3
- JavaScript (ES6)
- Web Audio API
- LocalStorage API
- Font Awesome
- Canvas Confetti

## Project Structure
```text
TaskArcade/
│
├── index.html
├── README.md
│
├── css/
│   └── styles.css
│
└── js/
    ├── app.js
    ├── storage.js
    └── sound.js
```

## Game Mechanics
### XP Rewards
| Priority | XP Earned |
|-----------|-----------|
| Low | 50 XP |
| Medium | 65 XP |
| High | 80 XP |

### Boss Damage
| Priority | Damage |
|-----------|---------|
| Low | 50 HP |
| Medium | 85 HP |
| High | 150 HP |

Completing all required damage defeats the Weekly Boss and rewards bonus XP.

## Getting Started
1. Clone the repository
```bash
git clone https://github.com/MahaChamarty/Task-Arcade.git
```
2. Navigate to the project folder
```bash
cd TaskArcade
```
3. Open `index.html` in your browser.
No installation or dependencies are required.

## Preview
Add screenshots or GIFs in the assets folder.
Example:

```
assets/home.png
assets/tasks.png
assets/boss-battle.png
```

## Future Improvements
- User Authentication
- Cloud Database Integration
- Drag-and-Drop Task Management
- Recurring Tasks
- Calendar View
- Leaderboards
- Mobile App
- PWA Support
- Multiplayer Challenges

## Learning Outcomes
This project demonstrates practical knowledge of:
- DOM Manipulation
- Event Handling
- LocalStorage
- Object-Oriented JavaScript
- State Management
- Responsive UI Design
- Web Audio API
- Modular JavaScript
- Gamification Principles

## Author
**Sri Mahalakshmi Chamarty**
Computer Science Engineering (AI & DS)

GitHub: https://github.com/MahaChamarty

## Support
If you enjoyed this project, consider giving it a ⭐ on GitHub!
