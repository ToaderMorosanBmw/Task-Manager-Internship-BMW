# Task Manager - BMW Internship Project

A modern, fully responsive Task Management application built with Angular. This project was developed as part of the BMW Internship program, focusing on clean architecture, standalone components, and an intuitive user experience.

🚀 **Live Demo:** [Task Manager App](https://ToaderMorosanBmw.github.io/Task-Manager-Internship-BMW/)

## 🌟 Key Features

- **Multiple Views**: Switch seamlessly between **Board (Kanban)**, **Table**, and **Calendar** views. (Your preferred view is automatically saved in the browser's local storage).
- **Advanced Task Management**: Create, edit, and delete tasks. Support for subtasks, assignees, due dates, priority levels, and customizable categories.
- **Drag & Drop**: Intuitive Kanban board supporting drag and drop to instantly change a task's status (Powered by Angular CDK).
- **Bulk Actions**: Select multiple tasks to perform bulk operations like mass-deletion efficiently.
- **Search & Filtering**: Real-time filtering by category, priority, and text search (including `#tag` search).
- **Export to CSV**: Easily export your currently filtered task list to a CSV file with a single click.
- **Dark Mode / Theming**: Full custom dark theme support with modern CSS variables for a better user experience.

## 🛠️ Tech Stack

- **Frontend**: Angular 18 (Standalone Components), TypeScript, RxJS
- **UI / Styling**: Angular Material, Angular CDK (Drag & Drop), Custom CSS
- **Calendar Integration**: `angular-calendar` paired with `date-fns`
- **Backend API**: `json-server` (Mock REST API) hosted on Render
- **CI/CD**: Automated deployments using **GitHub Actions** to **GitHub Pages**

## 🚀 Running Locally

To run this project on your local machine, follow these steps:

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ToaderMorosanBmw/Task-Manager-Internship-BMW.git
   cd Task-Manager-Internship-BMW/Task-Manager-Internship-BMW
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend (JSON Server):**
   ```bash
   npm run start:backend
   ```
   *(The mock database will run on `http://localhost:3000`)*

4. **Start the Angular application:**
   Open a new terminal window/tab and run:
   ```bash
   npm start
   ```

5. **Open in Browser:**
   Navigate to `http://localhost:4200/`

## 📁 Architecture Highlights

- **Core Module**: Contains singleton services (`TaskService`, `CategoryService`) and data models.
- **Features Module**: Organized by domain (`tasks`, `categories`). Includes specific view components like `TaskDashboard`, `TaskCalendar`, and `TaskTable`.
- **Shared Module**: Contains reusable UI components, smart custom Pipes (e.g., date-formatting, initials generator), and custom Directives.
- **Environment Config**: Uses dynamic environment variables to seamlessly switch between the local API and the production Render API.

## 📝 About
This project was developed for educational and evaluation purposes as part of the BMW Internship assignment.
