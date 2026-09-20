# 🔴 Live Polling Application

A real-time live polling web application where users can create polls, share them with others, vote, and see results update instantly without refreshing the page.

## 🚀 Features

- 🔐 User signup and login
- 📝 Create polls with multiple options
- 🔗 Share polls using a unique poll link
- 🗳️ Vote on polls
- 🔴 Real-time vote updates without page refresh
- 📊 Live vote counts and percentages
- 📋 Copy poll sharing link
- 🚪 Logout functionality
- 📱 Responsive and clean user interface

## 🛠️ Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Server-Sent Events (SSE)

### Backend
- Go
- Gin Web Framework
- MongoDB
- Redis
- bcrypt authentication

## 🏗️ Project Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │      Vite App       │
                    └──────────┬──────────┘
                               │
                    HTTP / REST API
                               │
                               ▼
                    ┌─────────────────────┐
                    │    Go + Gin API     │
                    │      Backend        │
                    └──────┬────────┬─────┘
                           │        │
                    ┌──────▼───┐ ┌──▼────────┐
                    │ MongoDB  │ │   Redis   │
                    │ Database │ │ Pub/Sub   │
                    └──────────┘ └────┬───────┘
                                      │
                                Live Events
                                      │
                                      ▼
                              ┌──────────────┐
                              │     SSE      │
                              │   Clients    │
                              └──────────────┘
## Screenshots

### Live Polling Application

![Live Polling App](poll-results.png)
