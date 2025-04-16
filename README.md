![Apollo Logo](/client/src/assets/logo_apollo.svg)

Apollo is a real-time messaging application with AI chatbot capabilities, built with modern web technologies and designed for a seamless communication experience.

Live demo: [helloapollo.chat](www.helloapollo.chat)

## Features

### Core Functionality
- **User Authentication** - Secure login/registration with JWT
- **Real-Time Messaging** - Instant message delivery via WebSockets
- **User Profiles** - Customizable profiles with display names and avatars
- **Conversation Management** - Create, view, and delete conversations

### Enhanced Features
- **AI Chatbots** - Chat with customizable AI personas
- **Image Sharing** - Send images in conversations and set profile pictures
- **Typing Indicators** - See when someone is typing in real-time
- **Unread Message Indicators** - Visual cues for unread messages
- **Responsive Design** - Optimized for both desktop and mobile devices
- **Dark/Light Theme** - Toggle between visual themes

### Security Features
- **Password Reset** - Secure email-based password recovery
- **Rate Limiting** - Protection against brute force attacks
- **Input Validation** - Robust form validation and error handling
- **Proper Data Access Control** - Users can only access their own conversations

## Technology Stack

### Frontend
- **React** - Component-based UI library
- **TypeScript** - Type-safe JavaScript
- **CSS Modules** - Scoped styling solution
- **Socket.io Client** - Real-time client-server communication
- **Context API** - State management

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Type-safe ORM for database operations
- **PostgreSQL** - Relational database
- **Socket.io** - Real-time bidirectional event-based communication
- **JWT** - Secure authentication
- **Passport** - Authentication middleware
- **Multer** - File upload handling
- **Nodemailer** - Email functionality for password reset

### Deployment
- **Docker** - Containerization
- **Nginx** - Reverse proxy
- **Let's Encrypt** - SSL certificates
- **Cloudflare** - DNS management and security
