# Rule-Based Speech Transcript Scoring System

## About this Project
This project is a web app that scores a speech transcript based on a fixed set of scoring rules.  
It does not use any AI or machine learning models.  
All scoring is done using simple programming logic and basic NLP libraries.

The goal is to help someone check the quality of their speech introduction, like greeting style, speaking speed, filler words, grammar, and engagement.

I am a beginner in coding, so I tried to write the project as simple and easy to understand as possible.

---

## How the System Works
1. The user pastes their transcript into a text box.
2. They enter the speech duration in seconds.
3. They click the Score Transcript button.
4. The text is sent to the backend server.
5. The backend calculates different scores.
6. The results are shown in the UI with charts and feedback.

---

## Rubric and Scoring
The total score is out of 100 points.  
The scoring is divided into different metrics based on rules.

### 1. Content and Structure (40 points)

| Metric | Explanation | Points |
|--------|------------|--------|
| Salutation | Detects greeting words like hello, good morning, etc | 0–5 |
| Mandatory keywords | Important details like name, age, school, hobbies, family | 4 points each |
| Optional keywords | Extra details like ambition, strength, achievement, place | 2 points each |
| Flow order | greeting -> details -> extra -> closing | 0 or 5 |

---

### 2. Speech Rate / WPM (10 points)

Formula:

WPM = word_count / (duration_in_seconds / 60)


| WPM Range | Score |
|-----------|--------|
| 111–140 | 10 |
| 81–110 or 141–160 | 6 |
| <80 or >160 | 2 |



### 3. Grammar (10 points)

Uses the LanguageTool API.


errors_per_100_words = errors / (word_count / 100)


| Errors | Score |
|--------|--------|
| 0–2 | 10 |
| 3–5 | 8 |
| 6–9 | 6 |
| 10–14 | 4 |
| 15+ | 2 |

---

### 4. Vocabulary Richness (10 points)

TTR = distinct_words / total_words


| TTR | Score |
|-----|--------|
| >=0.7 | 10 |
| 0.5–0.69 | 6 |
| 0.3–0.49 | 4 |
| <0.3 | 2 |

---

### 5. Clarity / Filler Words (15 points)

Filler words checked:


um, uh, like, actually, basically, right, i mean,
kinda, sort of, well, ok, ah, hmm



filler_rate = (filler_count / total_words) * 100



| Filler % | Score |
|----------|--------|
| 0–3% | 15 |
| 4–6% | 12 |
| 7–9% | 9 |
| 10–12% | 6 |
| 13%+ | 3 |

---

### 6. Engagement / Sentiment (15 points)
Uses vader sentiment analyzer.


posScore = sentiment.pos



| posScore | Score |
|----------|--------|
| >=0.9 | 15 |
| 0.7–0.89 | 12 |
| 0.5–0.69 | 9 |
| 0.3–0.49 | 6 |
| <0.3 | 3 |

---

### Overall Score


overall_score = sum of all metric scores (max 100)


## How to Run the Project Locally

### Requirements
- Node.js installed
- Firebase CLI installed

### Steps


npm install
firebase emulators:start


Then open index.html in a browser.

### To Deploy

firebase deploy --only hosting,functions



## Project Files

| File | Description |
|------|------------|
| index.html | Main webpage |
| style.css | Styling and animations |
| script.js | Frontend logic and API calls |
| functions/api/scoreTranscript.js | Backend scoring logic |
| README.md | Guide for understanding the project |

---

## Extra Features

* Dark / light theme toggle
* Loading animation
* Chart.js score charts
* PDF and JSON export

---

## Why I Built It

I want to learn real programming logic instead of always using AI models.  
Creating a rule based scoring engine helped me understand evaluation systems better.

---

## Future Improvements

* Add speech to text upload
* Save score history and progress
* More UI improvements

---

## Thank You

Thanks for reviewing my project.  
I hope this shows my learning journey and real effort.

