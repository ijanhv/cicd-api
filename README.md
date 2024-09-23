<div align="center">
<!--   <img src="https://github.com/ijanhv/dockify-api/raw/main/public/logo.png" alt="Dockify Logo" width="200"/> -->
  <h1>Dockify API</h1>
  <p><strong>Simplify Your Docker Workflow</strong></p>
</div>


---

## 🚀 Features

Dockify API offers a comprehensive set of features to streamline your Docker workflow:

- 🐳 Seamless Docker container management
- 🔄 Real-time container status updates
- 📊 Resource usage monitoring
- 🔐 Secure API authentication
- 📁 Volume and network management
- 🔧 Easy configuration and setup

## 💻 Tech Stack

| Category | Technologies |
|----------|--------------|
| Backend | Node.js, Express.js, Typescript |
| ORM | Prisma |
| Database | Postgres |
| Docker Integration | Docker Engine API |
| Containerization | Docker |

## 🏁 Getting Started

### Prerequisites

- Node.js (v14 or later)
- Docker

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ijanhv/dockify-api.git
   cd dockify-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start the server:
   ```bash
   npm start
   ```

## 💻 Usage

Once the server is running, you can interact with the Dockify API using HTTP requests. Here's a quick example using curl:

```bash
# Get all containers
curl http://localhost:3000/api/containers

# Start a container
curl -X POST http://localhost:3000/api/containers/start/container_id
```

---

<div align="center">
  <p>Built with ❤️ by Janhavi</p>
</div>
