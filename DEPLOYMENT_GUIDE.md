# Local Deployment Guide
Rule-Based Speech Transcript Scoring System

This document explains how to deploy and run the project locally in a simple and beginner-friendly way.

---

## 1. Requirements

Before starting, install the following:

### Node.js
Download from:
https://nodejs.org/

Check installation:
  sh
node -v
  

### Firebase CLI

Install using:

  sh
npm install -g firebase-tools
  

Check installation:

   sh
firebase --version
   

---

## 2. Login to Firebase

   sh
firebase login
   

A browser window will open.
Log in using your Google account.

---

## 3. Navigate to the Project Folder

Example:

   sh
cd path/to/your/project
   

Your project should look similar to:

   
project/
│── functions/        (backend)
│── public/           (frontend)
│── firebase.json
   

---

## 4. Install Backend Dependencies

Navigate to the backend folder:

   sh
cd functions
   

Install required packages:

   sh
npm install
   

Then return to the main project directory:

   sh
cd ..
   

---

## 5. Initialize Firebase (if not already done)

If Firebase has not been initialized yet:

   sh
firebase init
   

When prompted, select:

* Hosting
* Functions
* JavaScript (not TypeScript)

This will create configuration files such as:

   
firebase.json
functions/package.json
public/
   

If these files already exist, skip this step.

---

## 6. Verify Folder Structure

Ensure the project directory contains at least:

   
functions/
   └── index.js
public/
   ├── index.html
   ├── style.css
   └── script.js
firebase.json
   

*  public/  contains the frontend
*  functions/  contains the backend API logic

---

## 7. Start Firebase Local Emulator

Run:

   sh
firebase emulators:start
   

If successful, you should see messages like:

   
Hosting running at:
http://localhost:5000

Functions running at:
http://localhost:5001
   

---

## 8. Open the Web Application

Open a browser and visit:

   
http://localhost:5000
   

The application should now load locally.
Test the "Score Transcript" button to check backend communication.

---

## 9. Manual Backend Test (Optional)

You can test the backend API directly:

   sh
curl -X POST http://localhost:5001/api/scoreTranscript \
   -H "Content-Type: application/json" \
   -d '{"transcript":"Hello my name is Rahul...", "duration":60}'
   

If everything is working, you will receive JSON output.

---

## 10. Troubleshooting

### Frontend cannot connect to backend

Check that the fetch request in  script.js  looks like:

   js
fetch("/api/scoreTranscript", ...)
   

### View error logs

Errors will appear in the terminal running:

   sh
firebase emulators:start
   

### Add logs inside backend

Example:

   js
console.log("Transcript received:", transcript);
   

This helps debug input and output.

---

## 11. Editing the Scoring Logic

Backend metric logic is located in:

   
functions/api/scoreTranscript.js
   

You may modify:

* Keyword lists
* Rubric values
* Sentiment thresholds
* Filler word counts
* Point weights

Changes take effect on save without restarting the emulator.

---

## 12. Stop Local Server

Press:

   
CTRL + C
   

This stops all running Firebase services.

---

## 13. Deploy to Firebase Hosting (Optional)

To deploy online:

   sh
firebase deploy
   

Firebase will output:

* Live hosting URL
* Live API function URL

---

## Quick Reference

   txt
1. npm install -g firebase-tools
2. firebase login
3. cd project
4. cd functions && npm install && cd ..
5. firebase emulators:start
6. Open http://localhost:5000
   

---

## Completed

You now have:

* Frontend and backend running locally
* Ability to edit and test scoring logic
* Option to deploy online when ready

   
