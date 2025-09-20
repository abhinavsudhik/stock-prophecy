# 🔮 Stock Prophecy

<div align="center">
  <img src="public/logo.png" alt="Stock Prophecy Logo" width="200" height="200">
  <p><em>Official Stock Prophecy logo featuring a futuristic bull design with circuit patterns</em></p>
</div>

A modern financial portfolio management and analytics dashboard built with React, TypeScript, and advanced charting capabilities.

![Portfolio Dashboard](https://img.shields.io/badge/Status-Active-success)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)ck Prophecy

A modern financial portfolio management and analytics dashboard built with React, TypeScript, and advanced charting capabilities.

![Portfolio Dashboard](https://img.shields.io/badge/Status-Active-success)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)

## 📋 Overview

Stock Prophecy is a comprehensive financial dashboard that provides:

- **Portfolio Management**: Real-time portfolio tracking and analytics
- **Stock Analysis**: Technical indicators including RSI, Moving Averages, and 5-day high/low analysis
- **AI-Powered Predictions**: Google Gemini AI integration for market predictions
- **Interactive Charts**: Dynamic data visualization with Chart.js and Recharts

## ✨ Features

### 📊 Portfolio Analytics

- Real-time portfolio value tracking
- Asset allocation visualization
- Daily change tracking

### 📈 Technical Analysis

- Moving Average (MA50) calculations
- RSI (Relative Strength Index) indicators
- 5-day high/low price analysis
- Trend identification (bullish/bearish/neutral)

### 🤖 AI Integration

- Google Gemini AI for market predictions
- Intelligent stock analysis
- Automated trend detection

### 🎨 Modern UI/UX

- Responsive design with shadcn/ui components
- Dark/light theme support
- Mobile-friendly interface
- Professional dashboard layout

## 🛠️ Technology Stack

### Frontend

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library

### Data & Charts

- **Chart.js** - Canvas-based charts
- **Recharts** - React chart library
- **Yahoo Finance API** - Real-time financial data
- **React Query** - Data fetching and caching

### AI & Backend

- **Google Gemini AI** - AI-powered predictions
- **Express.js** - Backend server
- **CORS** - Cross-origin resource sharing

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Concurrently** - Run multiple commands
- **TypeScript** - Static type checking

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/abhinavsudhik/stock-prophecy.git
   cd stock-prophecy
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   # Add your API keys (Google Gemini AI, etc.)
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:5173
   ```

## 📝 Available Scripts

- `npm run dev` - Start development server with backend
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🏗️ Project Structure

```
src/
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── ChainAllocation.tsx
│   ├── PortfolioChart.tsx
│   └── ...
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions
├── pages/               # Page components
├── services/            # API services
└── ...
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_YAHOO_FINANCE_API_KEY=your_yahoo_finance_key
```

### Tailwind Configuration

The project uses a custom Tailwind configuration with:

- Custom colors for cryptocurrencies
- Dark mode support
- Custom animations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful component library
- [Lucide React](https://lucide.dev/) for the icon system
- [Chart.js](https://www.chartjs.org/) for charting capabilities
- [Google Gemini AI](https://ai.google.dev/) for AI predictions

## 📞 Support

If you have any questions or need help, please:

1. Check the [Issues](https://github.com/abhinavsudhik/stock-prophecy/issues) page
2. Create a new issue if your question isn't answered
3. Join our community discussions

---

Made with ❤️ by the Stock Prophecy team
