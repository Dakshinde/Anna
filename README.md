# 🍃 Anna Sampada - Food Waste Management System

Anna Sampada is a smart, web-based platform designed to reduce food waste by connecting surplus food with those in need. It features an AI-powered tool to predict food shelf life and an intelligent chatbot assistant to provide helpful information on food safety and waste reduction.

---

## ✨ Features

* **ML Prediction Tool:** Analyzes sensor data (temperature, moisture, gas) to predict the remaining shelf life of food items, helping users determine if their surplus food is suitable for donation.
* **Intelligent Chatbot ("Anna"):** A conversational AI assistant powered by the Google Gemini API. It provides:
    * Dynamic, personalized recipes for leftover ingredients.
    * Specific food safety tips.
    * Navigation to different parts of the application.
* **Decoupled Architecture:** A modern React frontend communicating with a robust Python (Flask) backend API.
* **User-Friendly Interface:** A clean and intuitive UI built with Material-UI, featuring guided inputs for the ML model.

---

## 🛠️ Tech Stack

* **Frontend:**
    * **React.js**
    * **Material-UI:** For professional UI components.
    * **Axios:** For making API requests to the backend.
    * **Lucide-React:** For clean and modern icons.
    * `react-markdown`: To render formatted text from the chatbot.
* **Backend:**
    * **Python 3**
    * **Flask:** To create the web server and API endpoints.
    * **Google Gemini API:** The language model powering the chatbot.
    * **Scikit-learn:** For the machine learning models.
    * **Pandas:** For data handling.
* **Machine Learning:**
    * **RandomForestClassifier:** To classify if food is spoiled.
    * **RandomForestRegressor:** To predict the remaining days until spoilage.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

### Prerequisites

* Node.js and npm (for the frontend)
* Python 3 and pip (for the backend)
* Git

### Installation & Setup

**1. Clone the Repository**
```bash
git clone [https://github.com/your-username/your-repository-name.git](https://github.com/your-username/your-repository-name.git)
cd your-repository-name