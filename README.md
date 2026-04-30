# CELPIP Standalone App

This folder contains a standalone version of the CELPIP mock test app. It does not require any external backend APIs.

## Requirements

* PHP (to run the backend API serving the database)
* Node.js (to build the frontend)
* SQLite3 (pre-configured)

## How to Run

1. **Start the PHP Backend:**
   Open a terminal, navigate to the `celpip-standalone/backend` folder, and start the PHP built-in server:
   `cd celpip-standalone/backend`
   `php -S localhost:8000`

2. **Start the React Frontend:**
   Open a new terminal, navigate to the `celpip-standalone/frontend` folder, install dependencies, and start the Vite dev server:
   `cd celpip-standalone/frontend`
   `npm install`
   `npm start` (or whatever the command is)

3. **Access the App:**
   Open your browser and navigate to the local URL provided by Vite (usually `http://localhost:5173`).

## Details

* **Backend:** A lightweight `api.php` script handles routing and fetches test content from the local `database.sqlite`.
* **Database:** `database.sqlite` was created from the provided `databasee.sql` dump. The structure and content (test prompts, mock questions) are identical.
* **Frontend:** A React + Vite application that uses Tailwind CSS. It focuses solely on the CELPIP testing UI. The components and styles have been extracted and refactored to work independently.
