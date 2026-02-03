# LegacyApp 2.0 Documentation

LegacyApp 2.0 is a modern task management web application built with the Next.js App Router. It features a secure administrative interface, real-time task tracking, and an automated activity history log.

## 🚀 Tech Stack

* **Framework**: Next.js 15.1.6 (App Router)
* **Language**: TypeScript
* **Styling**: Tailwind CSS 4
* **Database**: Vercel Postgres
* **Icons**: Lucide React

## 🛠️ Project Structure

The application follows the Next.js directory convention:

* **app/page.tsx**: The main client-side entry point containing UI logic, state management, and authentication views.
* **app/api/task/route.ts**: Server-side API endpoint for fetching and creating tasks using PostgreSQL.
* **package.json**: Configuration for dependencies including React 19 and Next.js 16.

## 🔑 Key Features

### 1. Administrative Authentication

The application includes a protected access layer. Users must authenticate via a password-protected login screen before accessing tasks. Session state is managed using `sessionStorage` to maintain the `admin_session`.

### 2. Task Management

Users can perform full CRUD operations on tasks:

* **Create**: Add new tasks via a dedicated input form.
* **Read**: Fetch and display all tasks ordered by creation date.
* **Update**: Toggle task status between pending and completed.
* **Delete**: Remove tasks with a confirmation prompt.

### 3. Activity History

Every major action (like creating a task) is automatically logged into a history table in the database. Users can switch to the **Historial** view to see a chronological record of actions and timestamps.

## 🚦 API Endpoints

### Tasks (`/api/task`)

* **GET**: Retrieves all rows from the tasks table, ordered by `created_at` DESC.
* **POST**: Accepts a title in the request body, inserts the task as pending, and simultaneously creates a log entry in the history table.

## 💻 Development

### Installation

```bash
npm install

```

### Environment Variables

Ensure you have a `.env.local` file configured with your Vercel Postgres credentials to enable database connectivity.

### Running the server

```bash
npm run dev

```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to view the application in development mode