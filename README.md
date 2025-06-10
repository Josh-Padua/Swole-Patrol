# Swole-Patrol
Software Team Practice Development Repository

**Team Members**:<br/>
Josh-Padua - Josh Padua <br/>
maanas444 - Maanas Mehta <br/>
Nyima-T - Nyima Tsering <br/>
Caleb-Pace - Caleb Pace <br/>
## Table of Contents

* [Features](#features)
* [Technologies Used](#technologies-used)
* [Installation](#installation)
* [Usage](#usage)

## Features

Here's a detailed list of what SwolePatrol offers:

* **User Authentication:** Secure sign-up and login with [e.g., Email/Password or Google].
* **Profile Management:** Users can update personal details like username, age, height, weight, fitness goals, etc.
* **Workout Tracking:**
    * Log various exercise types (e.g., cardio, strength training).
    * Record sets, reps, weight, and duration.
    * Track personal records (PRs) for exercises.
    * Ability to estimate 1-rep max (1RM) for key lifts.
* **Progress Visualization:**
    * View historical workout data and trends.
    * Charts and graphs for weight, BMI, and exercise maxes over time.
* **Major features:**
    * See how users rank against others based on various metrics (e.g., total time in gym, age, BMI, exercise 1RM).
    * Filter leaderboards by different categories (e.g., Time in Gym, Age, BMI, Height, Weight, Exercise Max).
    * Select specific exercises (e.g., Bench Press, Deadlift, Squat) to view leaderboards for one-rep maxes.
    * Meal/Macro Tracking
    * Notifications/Reminders
    * Custom Workout Routines
    * Stopwatch/Timer functionality
    * Journaling for workouts and progress.

## Technologies Used

This application is built using the following key technologies:

* **Frontend:**
    * React Native (`[Version, e.g., 0.73.4]`) - For cross-platform mobile development.
    * Expo (`[Version, e.g., 50.0.0]`) - Development platform for React Native.
    * Tailwind CSS (with NativeWind) - For utility-first styling.

* **Backend/Database:**
    * Firebase Firestore - NoSQL cloud database for storing user data, workouts, etc.
    * Firebase Authentication - For user registration and login.
* **Testing:**
    * Jest - JavaScript testing framework.

## Installation

Follow these steps to get a local copy of the project up and running on your machine.

### Prerequisites

* Node.js (`[Recommended Version, e.g., v18.x or v20.x]`)
* npm (`[Recommended Version, e.g., v9.x or v10.x]`) or Yarn (`[Recommended Version]`)
* Expo CLI (`npm install -g expo-cli`)
* A physical Android/iOS device or an emulator/simulator.

### Steps

1.  **Clone the repository:**
    ```bash
    git clone [Your Repository URL]
    cd SwolePatrol
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```

## Usage

### Running the App Locally

1.  **Start the Expo development server:**
    ```bash
    npm start
    ```
2.  This will open a new tab in your browser with Expo Dev Tools.
3.  **Run on a device/simulator:**

    * **Android Emulator:** Press `a` in the terminal.
    * **Physical Device:** Scan the QR code displayed in the terminal or browser with the Expo Go app.

### Key Screens/Flows

* **Authentication:** Navigate to `[e.g., /auth/login]` or the initial screen.
* **Dashboard:** After logging in, explore the main dashboard.
* **Workout Logging:** Go to `[e.g., /workout]` to start a new workout.
* **Leaderboard:** Access the leaderboard from the navigation bar `[e.g., /leaderboard]`.
