[README.md](https://github.com/user-attachments/files/28187592/README.md)
# 💰 Wealth Tracker & Budget Hub

A comprehensive mobile-first wealth tracking and budgeting app built with React. Track your assets, manage debt, set savings goals, and gain insights into your spending—all with smart notifications and customizable settings.

---

## ✨ Features

### 📊 Core Features

- **💰 Wealth Tracking** - Track savings, stocks, retirement accounts, and custom assets with growth metrics
- **💳 Budget Management** - Categorize spending into Needs, Wants, and Save & Invest with custom budget cycles
- **🎯 Savings Goals** - Create and track goals with progress indicators and milestone celebrations
- **💳 Debt Tracking** - Track all debts (credit cards, loans, mortgages) with payment status and interest rates
- **📈 Spending Analytics** - Compare spending trends, identify patterns, and get personalized insights
- **📊 Net Worth Calculation** - View your true net worth: Total Assets - Total Debt

### 🔔 Smart Notifications (6 Types)

**Pop-up Modals (Center Screen):**
- 📝 **Daily Expense Reminder** - Prompts you to log today's expenses
- 🎉 **Savings Goal Milestones** - Celebrates when you reach 25%, 50%, 75%, 100% of a goal
- 📈 **Wealth Growth Updates** - Monthly achievement showing net worth growth percentage

**Persistent Cards/Banners:**
- 🔄 **Budget Cycle Reset** - Notifies when your budget cycle resets
- ⚠️ **Budget Limit Warnings** - Alerts at 75%, 90%, and 100% of budget spent
- 📊 **Weekly Spending Summary** - Every Sunday with breakdown and comparison to last week

### 🎨 Customization

- 🌓 **Dark/Light Theme** - Toggle between themes anytime
- 🌍 **Multi-Currency Support** - 20+ currencies (MYR, USD, SGD, etc.)
- 🔄 **Custom Budget Cycles** - Reset budget on any date (salary day, 27th, etc.)
- 📱 **Custom Categories** - Create, edit, and delete spending categories
- 📱 **Mobile-First Design** - Optimized for iOS (380px width), fully responsive

---

## 🚀 Quick Start

### Prerequisites
- Node.js 14+ and npm installed
- Modern browser (Chrome, Safari, Firefox, Edge)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/yourusername/Wealth-Tracking-And-Budgeting-App.git
cd Wealth-Tracking-And-Budgeting-App
```

2. **Install dependencies:**
```bash
npm install --legacy-peer-deps
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open in browser:**
- Automatically opens at `http://localhost:5173`
- Or open manually if it doesn't start

5. **Complete onboarding:**
- Choose currency and budget cycle
- Optionally load example data
- Start tracking!

---

## 📱 Navigation

### Bottom Navigation Bar (5 Tabs)

| Tab | Icon | Purpose |
|-----|------|---------|
| **Wealth** | 💰 | Track assets by category (Savings, Stocks, Retirement) |
| **Budget** | 💳 | Log expenses, track spending vs budget |
| **Home** | 🏠 | Dashboard with net worth, summaries, notifications |
| **Debt** | 💳 | Manage debts, payment status, interest tracking |
| **More** | ⋯ | Access Analytics and Settings |

---

## 💡 How to Use

### Getting Started

1. **Add Your Assets (Wealth Tab)**
   - Tap **Wealth** → **+ Add**
   - Select category (Savings, Stocks, Retirement)
   - Enter name and current amount
   - View total assets and growth metrics

2. **Set Your Budget (Budget Tab)**
   - Tap **Budget** → Set cycle date in Settings
   - Budget resets on your chosen date each month
   - Add expenses as you spend
   - Monitor progress in Needs/Wants/Save & Invest

3. **Create Savings Goals (Home Tab)**
   - Tap **Goals** → **+ Add Goal**
   - Set target amount and optional deadline
   - Track progress with visual indicators
   - Receive celebrations at milestones

4. **Track Debt (Debt Tab)**
   - Tap **Debt** → **+ Debt**
   - Choose type (credit card, car loan, mortgage, etc.)
   - Add balance, monthly payment, interest rate
   - Check off payments each cycle

5. **Review Insights (More → Analytics)**
   - View spending trends over 3-6 months
   - Compare categories to averages
   - Get alerts when spending changes >15%

---

## 🎯 App Sections

### Dashboard (Home)

**Hero Section:**
- **Net Worth** = Total Assets - Total Debt
- Monthly growth percentage
- Quick stats: Assets, Debt, Growth %

**Wealth Breakdown:**
- Savings, Stocks, Retirement totals
- By category breakdown

**Debt Summary:**
- Total debt amount
- Paid/unpaid count this cycle
- Projected debt-free date

**Notifications:**
- Budget Cycle Reset banner
- Budget warnings
- Weekly spending summary

### Wealth Tracker

- Add/edit/delete asset entries
- Track by category (Savings, Stocks, Retirement)
- View total assets and growth (YTD, 1Y, 5Y)
- Customizable categories

### Budget Tracker

- Log daily expenses
- Categorize into Needs/Wants/Save & Invest
- Visual progress bars per category
- Budget limit warnings at 75%, 90%, 100%
- Custom spending categories

### Savings Goals

- Create unlimited goals (vacation, laptop, house, etc.)
- Track progress with percentage
- View estimated time to reach goal
- Celebrate milestone achievements (25%, 50%, 75%, 100%)

### Debt Tracker

**Debt Types (6 Predefined + Custom):**
- 💳 Credit Card
- 🚗 Car Loan
- 🏠 Mortgage
- 📚 Student Loan
- 💰 Personal Loan
- ⚕️ Medical Debt
- ➕ Custom types

**Features:**
- Track current balance and monthly payment
- Optional interest rate for calculations
- Payment checkbox (resets each budget cycle)
- Payment status and reminders

### Analytics

- Spending comparison (current vs 3-6 month average)
- Category breakdown and trends
- Spending alerts when +15% above average
- Weekly and monthly insights

### Settings

- 🌓 Theme (Light/Dark)
- 🌍 Currency selection
- 🔄 Budget cycle date
- 📱 Custom spending categories
- 💾 View stored data

---

## 📊 Data & Storage

### How It Works

- **Local Storage Only** - All data stored in browser (no cloud/servers)
- **Private & Secure** - Your financial data never leaves your device
- **No Backend Required** - Fully client-side application
- **Persistent** - Data saved automatically and survives browser refresh

### localStorage Keys

```javascript
// Account & Settings
onboardingComplete
currency
theme
budgetCycleDay
customCategories

// Financial Data
wealthData
budgetHistory
debts
savingsGoals

// Notifications
dailyExpenseReminderShown
completedMilestones
budgetWarningLevel
budgetResetNotificationShown
weeklySummaryShown
wealthGrowthUpdateShown
```

---

## 🛠️ Technology Stack

- **Frontend:** React 18 with Hooks
- **Styling:** CSS with CSS variables (theme support)
- **Charts:** Recharts library
- **State:** React hooks + localStorage
- **Deployment:** Vercel (recommended)

### No External Dependencies for Features
- ✅ No backend server
- ✅ No API calls
- ✅ No authentication system
- ✅ No third-party services
- ✅ All offline-capable

---

## 📱 Responsive Design

- **Mobile-First** - Optimized for small screens
- **Max Width:** 380px (iPhone SE, 6, 7, 8)
- **Touch-Friendly** - 44px minimum tap targets
- **Full-Screen:** Works on tablets and desktop too
- **No Scrolling Needed:** Most features fit without excessive scrolling

---

## 🌓 Dark Mode

Automatic theme support:
- **Toggle:** Settings → Theme
- **Colors Auto-Adjust:** Text, backgrounds, borders
- **No Manual Configuration:** Respects system preference
- **Persistent:** Choice saved in localStorage

---

## 🔒 Privacy & Security

**Your Data, Your Device:**
- ✅ No servers - everything local
- ✅ No cloud storage
- ✅ No tracking
- ✅ No advertisements
- ✅ No personal data collection
- ✅ Open source - code is transparent

**Export Your Data:**
- Open DevTools (F12) → Application → localStorage
- Copy all keys/values
- Save as JSON backup

---

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub:**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repo
   - Click "Deploy"
   - Done! Your app is live

3. **Get Your URL:**
   - Vercel provides a URL like `your-app.vercel.app`
   - Share with friends/family
   - Works offline-capable on mobile

### Alternative: GitHub Pages

```bash
npm run build
# Push 'build' folder to gh-pages branch
```

---

## 📝 Onboarding (11 Steps)

New users see this flow:

1. 💰 Welcome screen
2. 📊 Net worth explanation (Assets - Debt)
3. 💰 Wealth tracking intro
4. 💳 Debt management intro
5. 🔄 Budget cycle explanation
6. 🔧 Budget cycle setup (choose date 1-31)
7. 🎯 Savings goals intro
8. 🔔 Smart notifications showcase
9. 🌓 Theme selection
10. 🌍 Currency selection
11. 🎉 Setup complete + optional example data

---

## 📊 Example Data

First-time users can load example data:

**Example Wealth:**
- Savings: RM 50,000
- Stocks: RM 150,000
- Retirement: RM 44,820

**Example Debts:**
- Credit Card: RM 3,500 @ 18% APR
- Car Loan: RM 45,000 @ 4.5% APR
- Student Loan: RM 25,000

**Example Goal:**
- New Laptop: RM 5,000 (50% complete)

**Sample Budget & Transactions**

---

## 🐛 Troubleshooting

### Data Not Saving?
1. Check browser's localStorage is enabled
2. Try clearing cache (Ctrl+Shift+Delete)
3. Check DevTools console for errors (F12)

### App Not Loading?
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Clear browser cache
3. Try different browser
4. Check internet connection

### Lost Data?
1. Check localStorage in DevTools (F12 → Application → localStorage)
2. Backups: Most browsers auto-backup
3. Reinstall app (data persists)

### Theme Not Changing?
1. Settings → Toggle theme
2. Clear cache if stuck
3. Check dark mode system setting

---

## 📖 Files & Structure

```
src/
├── components/
│   ├── Dashboard.js / Dashboard.css
│   ├── WealthTracker.js / WealthTracker.css
│   ├── BudgetTracker.js / BudgetTracker.css
│   ├── SavingsGoals.js / SavingsGoals.css
│   ├── DebtTracker.js / DebtTracker.css
│   ├── Analytics.js / Analytics.css
│   ├── Settings.js / Settings.css
│   ├── Onboarding.js / Onboarding.css
│   ├── NotificationModals.js / NotificationModals.css
│   └── NotificationCards.js / NotificationCards.css
├── utils/
│   ├── notificationHelpers.js
│   ├── budgetCycleHelpers.js
│   ├── analyticsHelpers.js
│   └── savingsGoalsHelpers.js
├── App.js / App.css
└── index.js / index.css
```

---

## 🎨 Customization

### Change Colors

Edit `App.css` CSS variables:

```css
:root {
  --color-primary: #16a34a;        /* Green */
  --color-secondary: #4a90e2;      /* Blue */
  --color-danger: #dc2626;         /* Red */
  --color-background: #ffffff;
  --color-text: #333333;
}
```

### Change Currencies

Edit in `Settings.js`:
```javascript
const CURRENCIES = ['MYR', 'USD', 'SGD', 'EUR', ...];
```

### Adjust Budget Categories

Edit `BudgetTracker.js`:
```javascript
const BUDGET_CATEGORIES = {
  needs: ['Food', 'Transport', 'Utilities'],
  wants: ['Entertainment', 'Dining', 'Shopping'],
  ...
};
```

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/amazing-feature`
3. **Make changes and commit:** `git commit -m 'Add amazing feature'`
4. **Push to branch:** `git push origin feature/amazing-feature`
5. **Open a Pull Request**

---

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

---

## 🙋 Support & Feedback

- **Report Bugs:** Open a GitHub Issue
- **Feature Requests:** Discuss in Issues
- **Questions:** Check existing Issues first
- **Improvements:** PRs welcome!

---

## 🗺️ Roadmap

### Planned Features (v3.0)

- [ ] Cloud backup & sync (Firebase/Supabase)
- [ ] Investment portfolio analysis
- [ ] Bill reminders
- [ ] Receipt scanning (OCR)
- [ ] Recurring transactions
- [ ] Budget templates
- [ ] Cash flow projections
- [ ] Financial goals with AI suggestions
- [ ] Multi-device sync
- [ ] Web & mobile app versions

---

## 📞 Contact

- **GitHub:** [@KMing1028](https://github.com/KMing1028)

---

## ✅ Version History

### v2.0 (Current)

**New Features:**
- 💳 Complete debt tracking system
- 🔔 6 smart notifications (3 pop-ups, 3 cards)
- 📊 Net worth calculation with debt deduction
- 🎯 5-tab navigation (Wealth, Budget, Home, Debt, More)
- 📱 11-screen onboarding

**Improvements:**
- Unified top/bottom bar styling
- Left-aligned debt card display
- Better spacing and typography
- Improved dark theme support
- Enhanced mobile responsiveness

### v1.0

**Initial Release:**
- Wealth tracking
- Budget management
- Savings goals
- Spending analytics
- Theme & currency support
- Custom budget cycles

---

## 🎓 Learning Resources

This app demonstrates:

- ✅ React Hooks (useState, useEffect, useContext)
- ✅ Local storage management
- ✅ CSS variables for theming
- ✅ Mobile-first responsive design
- ✅ Data visualization (Recharts)
- ✅ State management patterns
- ✅ Component composition
- ✅ Form handling

Perfect for learning React fundamentals!

---

## 🙏 Acknowledgments

- Built with [React](https://react.dev)
- Charts with [Recharts](https://recharts.org)
- Deployed on [Vercel](https://vercel.com)
- Icons & emojis for visual appeal
- You for using this app! 💙

---

**Made with ❤️ for better financial management**

---

## Quick Links

- 🌐 [Live Demo](https://your-app.vercel.app)
- 📚 [Documentation](https://github.com/KMing1028/Wealth-Tracking-And-Budgeting-App/wiki)
- 🐛 [Issue Tracker](https://github.com/KMing1028/Wealth-Tracking-And-Budgeting-App/issues)
- 💬 [Discussions](https://github.com/KMing1028/Wealth-Tracking-And-Budgeting-App/discussions)

---

**Last Updated:** May 2026 | v2.0.0
