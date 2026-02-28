<div align="center">

# ⚡️ TATHASTU ERP

**Enterprise-Grade AI Gym Management & Telemetry System**

[![React](https://img.shields.io/badge/React-18.x-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Modern-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/AI_Powered-Google_Gemini-8E75B2?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)

<img src="https://via.placeholder.com/1000x500/0a0a0a/a3e635?text=TATHASTU+ERP+DASHBOARD+SCREENSHOT" alt="Tathastu ERP Dashboard" width="100%">

> Tathastu ERP is a unified, AI-powered Command Center designed to completely automate fitness facility operations. From biometric telemetry and predictive AI forecasting to automated payroll and smart access control, this system replaces 5+ fragmented SaaS tools with one seamless, high-performance interface.

[Live Demo](#) • [Report Bug](#) • [Request Feature](#)

</div>

---

## 🧠 Core Intelligence Modules

Tathastu ERP is built on a modular, interconnected architecture where every action syncs globally across the financial and operational databases.

* **📊 System Overview (Command Center):** A real-time executive bento-box dashboard calculating Net Profit, Daily Footfall, Churn Risk, and AI-generated business briefings.
* **💸 Finance & OpEx Ledger:** Tracks total gross revenue against operational burn rate (electricity, rent, maintenance), automatically calculating true Net Profit.
* **🤖 Elite Protocols (Diet Engine):** Leverages Google Gemini AI to instantly generate bespoke, hyper-personalized nutritional matrices based on member biometrics and goals.
* **📈 Growth Vision (Telemetry):** Dynamic area charts tracking muscle/fat deltas with **AI Predictive Forecasting** projecting future body composition trajectories.
* **🛡️ Retention & Access Bot:** Smart check-in terminal that reads subscription expiry dates, locking access for expired members and offering 1-click renewal billing.
* **⚙️ Machine Health:** IoT-style asset tracking. Logs usage hours on gym equipment, visually warning staff when hardware reaches critical service thresholds.
* **👥 Team Operations:** HR suite to manage staff roster, track base salaries + PT commissions, and execute 1-click monthly payroll deductions.
* **📦 Stock Engine:** Inventory management that uses AI to detect member diet needs and automatically triggers cross-sell nudges for supplements.

---

## 🛠️ Technology Stack

**Frontend (Client)**
* **Framework:** React.js (Vite)
* **Styling:** Tailwind CSS (Custom Dark/Glassmorphism theme)
* **Icons:** Lucide React
* **Data Visualization:** Recharts

**Backend (Server & AI)**
* **Framework:** FastAPI (Python)
* **Database:** SQLite / SQLAlchemy (ORM)
* **AI Integration:** Google Gemini Pro API (RAG Engine & Data Synthesis)
* **Validation:** Pydantic

---

## 🚀 Getting Started

Follow these instructions to get a local copy up and running for development and testing.

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/tathastu-erp.git](https://github.com/yourusername/tathastu-erp.git)
cd tathastu-erp
```
### 2. Backend Setup (FastAPI)
Open a terminal and navigate to your backend directory:
```bash
# Create a virtual environment
python -m venv venv

# Activate the virtual environment (Windows)
venv\Scripts\activate
# Activate the virtual environment (Mac/Linux)
source venv/bin/activate

# Install required dependencies
pip install -r requirements.txt

# Set up Environment Variables
cp .env.example .env
# Edit .env and add your Google Gemini API Key

# Start the server
python main.py
```
The backend will boot up at `http://localhost:8005`

### 3. Frontend Setup (React)
Open a second terminal and navigate to your frontend directory:
```bash
# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
The frontend will boot up at `http://localhost:5173`

## 🔐 Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file in the backend directory. Never commit your real `.env` file to version control.

`GEMINI_API_KEY` - Your Google Gemini API Key (Required for Diet Generation, Ad Generation, and Executive Summaries).

## 📸 Interface Preview

<div align="center">
<img src="https://www.google.com/search?q=https://via.placeholder.com/490x300/18181b/a3e635%3Ftext%3DBiometric%2BTelemetry" width="49%">
<img src="https://www.google.com/search?q=https://via.placeholder.com/490x300/18181b/a3e635%3Ftext%3DHardware%2BHealth%2BMonitoring" width="49%">
</div>

## 🛡️ Security & Privacy

Local First: The SQLite database (`tathastu_erp.db`) is stored locally and ignored via `.gitignore` to ensure client data never leaks to public repositories.

API Security: API keys are injected at runtime via environment variables.

