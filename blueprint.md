# University Assistant Chatbot

## Overview

This project is a web-based chatbot designed to assist university students by providing answers to frequently asked questions and personalized information like grades. It features a secure, in-chat administration panel for managing student data directly from the interface, all powered by a real-time cloud database.

## Project Outline

### Style & Design
*   **Layout:** A responsive chat interface with a modern, clean design.
*   **Color Palette:** A vibrant color scheme using `oklch`, with a gradient header.
*   **Typography:** 'Poppins' font from Google Fonts.
*   **Iconography:** Boxicons for UI icons.
*   **Visual Effects:** Subtle background texture, multi-layered drop shadows, and interactive "glow" effects.

### Features
*   **General Information:** Provides answers on admissions, courses, etc.
*   **Intelligent Conversation:** Uses a state machine for complex interactions and provides dynamic suggestions.
*   **Personalized Grade Check:** A stateful feature allowing students to check their grades.
*   **Backend:** Uses **Firebase Firestore** as a scalable, real-time database for student data.
*   **In-Chat Admin Panel:** A password-protected administrative mode within the chatbot to manage the student database (add, edit, delete students and grades).

## Current Plan

### Implement In-Chat Database Management

Create a secure, conversation-based interface for administrators to manage student data directly within the chatbot.

1.  **Admin Entry Point & Authentication:**
    *   The user can type `admin` to enter a special mode.
    *   The chatbot will then require a password (hardcoded for now) to proceed.
    *   A new state, `awaiting_admin_password`, will be added.

2.  **Admin Menu:**
    *   Once authenticated, the admin will be presented with a menu of options: `Añadir Estudiante`, `Editar Estudiante`, `Eliminar Estudiante`, and `Salir`.
    *   A new state, `admin_menu`, will manage this.

3.  **Create Student Flow:**
    *   A guided conversation will ask for `cedula`, `name`, and then repeatedly for `materia` and `nota` until the admin says they are done.
    *   This will use states like `admin_add_cedula`, `admin_add_name`, `admin_add_grade_subject`, `admin_add_grade_score`.

4.  **Edit/Delete Student Flow:**
    *   The bot will first fetch and display a list of current students.
    *   The admin will select a student to modify or delete.
    *   The chatbot will then guide the admin through the update or confirm the deletion.
    *   These flows will use states like `admin_delete_start`, `admin_edit_start`, etc.

5.  **Firebase Integration:**
    *   The new `handleAdminActions` function will contain the logic to perform `add`, `update`, and `delete` operations on the Firestore `students` collection.
