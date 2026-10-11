const express = require("express");
const app = express();

// Serve images
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send(`
  <html>
  <head>
    <title>PG Connect - Architecture</title>
    <style>
      body {
        font-family: Arial;
        background: #cfdbee;
        text-align: center;
        padding: 20px;
      }
      h1 {
        margin-bottom: 20px;
      }
      .section {
        margin: 40px 0;
      }
      .diagram {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
      }
      .box {
        padding: 20px;
        border-radius: 10px;
        background: #080d13;
        color: white;
        min-width: 180px;
        font-weight: bold;
      }
      .arrow {
        font-size: 30px;
      }
      img {
        max-width: 90%;
        border-radius: 10px;
        margin-top: 20px;
      }
    </style>
  </head>

  <body>

    <h1>PG Connect - Full System Architecture</h1>

    <!-- MAIN ARCHITECTURE -->
    <div class="section">
      <h2>🌐 Application Flow</h2>
      <div class="diagram">
        <div class="box">User (Browser)</div>
        <div class="arrow">➡️</div>
        <div class="box">Frontend (React + Vite)</div>
        <div class="arrow">➡️</div>
        <div class="box">Backend (Node + Express)</div>
        <div class="arrow">➡️</div>
        <div class="box">Supabase (DB + Auth)</div>
      </div>
    </div>

    <!-- DOCKER ARCHITECTURE -->
    <div class="section">
      <h2>🐳 Docker Architecture</h2>
      <div class="diagram">
        <div class="box">Docker Compose</div>
        <div class="arrow">➡️</div>
        <div class="box">Frontend Container</div>
        <div class="arrow">➡️</div>
        <div class="box">Backend Container</div>
      </div>
    </div>

    <!-- CI/CD FLOW -->
    <div class="section">
      <h2>⚙️ CI/CD Pipeline</h2>
      <div class="diagram">
        <div class="box">GitHub Push</div>
        <div class="arrow">➡️</div>
        <div class="box">GitHub Actions</div>
        <div class="arrow">➡️</div>
        <div class="box">Docker Build</div>
        <div class="arrow">➡️</div>
        <div class="box">Docker Hub</div>
      </div>
    </div>

    

  </body>
  </html>
  `);
});

app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});