# Suc Khoe AI - AI-Powered Vision Testing Platform

An intelligent web application for comprehensive eye health testing with AI-powered analysis, voice control, and personalized insights.

**Live Demo:** https://testaivision.pages.dev/

---

## Features

### Vision Tests
- **Snellen Test** - Visual acuity measurement (20/20 vision standard)
- **Color Blindness Test** - Ishihara plates with AI analysis
- **Astigmatism Test** - Detect corneal irregularities
- **Amsler Grid Test** - Macular degeneration screening with heatmap
- **Duochrome Test** - Red-green balance testing

### AI & Voice
- **Eva AI Assistant** - 2-way voice conversation (Speech Recognition + Text-to-Speech)
- **Smart Dashboard** - AI-generated insights with trend analysis
- **Personalized Reports** - Automated PDF generation with recommendations
- **Voice Instructions** - Real-time test guidance in Vietnamese/English

### Progress Tracking
- **Visual Charts** - Snellen trends, test distribution, Amsler heatmaps
- **Test History** - Complete records with timestamps and results
- **AI Insights** - Score ratings, strengths, areas to monitor, pro tips
- **Export to PDF** - Professional reports with charts and analysis

### Gamification
- **7 Achievement Badges** - Unlock badges through consistent testing
- **Streak Tracking** - Daily continuity rewards
- **Points System** - Earn points for tests, exercises, and streaks
- **5 Eye Exercises** - 20-20-20 Rule, Palming, Figure 8, Near-Far Focus, Blinking

### Hospital Locator
- **GPS-Based Search** - Find nearest eye hospitals
- **Advanced Filters** - Search by specialty, emergency services, ratings
- **Google Maps Integration** - One-click directions and contact info

### Smart Reminders
- **Custom Notifications** - Test and exercise reminders
- **Flexible Scheduling** - Daily, Weekly, Bi-weekly, Monthly options
- **Browser Notifications** - Non-intrusive alerts

### User Experience
- **Dark Mode** - System/Light/Dark theme switcher
- **Bilingual** - Full Vietnamese/English support
- **Responsive Design** - Mobile-first, optimized for all devices
- **Smooth Animations** - Modern, polished user experience

---

## Quick Start

### Prerequisites
- Node.js v18+ (with npm)
- Google Gemini API Key (free at https://aistudio.google.com/app/apikey)

### Installation

1. **Clone and install:**
   ```bash
   git clone <repository-url>
   cd d-git-test
   npm install
   ```

2. **Set up environment:**
   - Create `.env.local` file in project root
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

3. **Run development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Navigate to `http://localhost:5173`
   - Grant permissions for microphone (optional), notifications (optional), location (optional)

---

## Tech Stack

### Frontend
- React 19.2 + TypeScript 5.8
- Vite 6.4 (build tool)
- Tailwind CSS 3.x (styling)
- React Router 6.23 (routing)
- Lucide React (icons)

### AI & Voice
- Google Gemini 2.0 Flash (chat & analysis)
- Web Speech API (speech recognition)
- Google Cloud Text-to-Speech (voice synthesis)

### Storage & APIs
- LocalStorage (test history, preferences)
- Geolocation API (hospital finder)
- Notification API (reminders)
- Canvas API (Amsler grid, color tests)

### Export
- jsPDF (PDF generation)
- html2canvas (chart screenshots)

---

## Project Structure

```
d-git-test/
├── components/          # React components
│   ├── vision tests    # Snellen, Color Blind, Astigmatism, Amsler, Duochrome
│   ├── VisionCoach.tsx # AI chatbot
│   ├── Header.tsx      # Navigation
│   └── ...
├── pages/              # Page components
│   ├── Home.tsx        # Dashboard
│   ├── History.tsx     # Test history
│   ├── ProgressPage.tsx # Analytics
│   ├── RemindersPage.tsx # Gamification
│   ├── AuthPage.tsx    # Login
│   └── ...
├── services/           # Business logic
│   ├── aiService.ts    # Gemini AI integration
│   ├── reminderService.ts # Gamification
│   ├── [test]Service.ts # Individual test logic
│   └── ...
├── context/            # State management
├── hooks/              # Custom React hooks
├── i18n/               # Translations (VI/EN)
├── utils/              # Utility functions
├── assets/             # Images & logos
├── App.tsx             # Main app component
├── index.tsx           # Entry point
└── index.css           # Global styles
```

---

## How to Use

### 1. Take Your First Test
- Click "Bat dau kiem tra" on the Home page
- Choose a test (Snellen recommended for beginners)
- Follow voice instructions or read on-screen guidance
- View AI-generated analysis of your results

### 2. Set Up Reminders
- Navigate to Reminders page
- Click "+ Them nhac nho"
- Choose frequency (Daily, Weekly, etc.)
- Enable browser notifications

### 3. Track Progress
- Go to Progress page
- View Snellen trend chart
- Read Eva's AI insights
- Export PDF report

### 4. Find Eye Care
- Open Hospitals page
- Allow location access
- Filter by specialty or emergency services
- Click for Google Maps directions

### 5. Chat with Eva
- Click the chat button
- Use voice or type your questions
- Get personalized eye health advice

### 6. Earn Badges
- Complete tests daily for streaks
- Do eye exercises
- Unlock 7 achievements
- Track points on Reminders page

---

## Performance Features

- Lazy Loading - Components load only when needed
- Code Splitting - Vendor chunks optimized for faster loading
- AI Caching - Chat responses cached for instant retrieval
- Service Worker - Offline support and instant page loads
- PWA Ready - Install as app, works offline

---

## Browser Support

| Feature | Chrome | Edge | Safari | Firefox |
|---------|--------|------|--------|---------|
| Core Tests | Yes | Yes | Yes | Yes |
| Voice Chat | Yes | Yes | Limited | No |
| Geolocation | Yes | Yes | Yes | Yes |
| Notifications | Yes | Yes | Limited | Yes |

Note: Voice features work best in Chrome/Edge.

---

## Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
Deploy the `dist/` folder to:
- Vercel (recommended - zero config)
- Netlify (drag & drop)
- GitHub Pages
- Firebase Hosting

### Environment Setup
- Set `GEMINI_API_KEY` in your hosting platform's environment variables
- Ensure HTTPS is enabled (required for Geolocation & Notifications)

---

## Environment Variables

Create `.env.local` file:
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

Security Note: This API key is exposed in the browser (suitable for demos). For production, consider using a backend proxy.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

## Acknowledgments

- Google Gemini AI - AI model and API
- Tailwind CSS - Styling framework
- React Community - Core framework
- Vietnamese Eye Health Community - Hospital data and feedback

---

## Support & Feedback

- Report Issues: Open an issue on GitHub
- Feature Requests: Discuss in GitHub Discussions
- Chat with Eva: Ask questions directly in the app!

---

Made with love for better eye health. Star this repo if you find it helpful!
