# Customer Support Ticketing System Backend

A role-based customer support ticketing system built with **Node.js, Express, and MongoDB**.  
This backend models real-world support workflows including ticket lifecycle management, agent assignment, role-based access control, and structured comment handling.


## 🚀 Features

### 🔐 Authentication
- JWT-based authentication
- Secure login & registration
- Role-based authorization (User, Agent, Admin)



### 👤 User Capabilities
- Create support tickets
- View own tickets
- Cancel open tickets
- Add comments to tickets
- View detailed ticket history


### 👨‍💼 Agent Capabilities
- View all available tickets
- Filter tickets by:
  - Raised by user
  - Category (`payment`, `account`, `service`, `other`)
  - Status (`pending`, `processing`, `resolved`, `cancelled`)
- Assign tickets to self
- Comment on assigned tickets
- Mark tickets as resolved
- View assigned tickets


### 🛠 Admin Capabilities
- Create admin and agent accounts
- Activate / deactivate accounts
- Fetch all users with filters
- View specific user details
- Monitor agent activity


## 🧠 System Design Highlights

- Clear separation of `User`, `Agent`, and `Admin` roles
- Ticket lifecycle enforcement (`pending → processing → resolved / cancelled`)
- Ownership validation for user ticket access
- Assignment validation for agents
- Middleware-driven permission control
- Query-based filtering for scalable ticket listing


## API structure
### Auth
``` 
POST /api/auth/register
POST /api/auth/login
```
### User
``` 
GET    /api/user/ticket
POST   /api/user/ticket
GET    /api/user/ticket/:ticketId
PATCH  /api/user/ticket/:ticketId/status
POST   /api/user/ticket/:ticketId/comment
```
### Agents
``` 
GET    /api/agent/ticket
GET    /api/agent/ticket/:ticketId
GET    /api/agent/ticket/assigned
GET    /api/agent/ticket/assigned/:ticketId
PATCH  /api/agent/ticket/:ticketId/assign
PATCH  /api/agent/ticket/assigned:ticketId/status
POST   /api/agent/ticket/:ticketId/comment
```
### Admin
``` 
POST   /api/admin/register
GET    /api/admin/user
GET    /api/admin/user/:userId
PATCH  /api/admin/user/:userId
```

