const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const http = require('http');
const WebSocket = require('ws');
require('dotenv').config();
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send('Something broke!');
});

// const db = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASS,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT || 3306
// });

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root@123',
  database: 'quality_assurance_db',
  port: 3306 // Optional, in case you specify a different port in .env
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to the MySQL database.');
});

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let callStatuses = {};  // Store current status for each callId

wss.on('connection', (ws) => {
  console.log('A new client connected!');

  // Send current call statuses to the new user
  ws.send(JSON.stringify({
    type: 'INITIAL_CALL_STATUSES',
    callStatuses,
  }));

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'UPDATE_STATUS') {
        console.log(data);
        handleUpdateStatus(data.userId, data.callId, data.status, ws);
      } else if (data.type === 'SUBMIT_STATUS') {
        handleSubmitStatus(data.callId,data.userId, ws);
      } else if (data.type === 'PAGE_NAVIGATE_OR_REFRESH') {
        handlePageNavigateOrRefresh(data.userId, data.callId, ws);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  });

  ws.on('close', () => {
    console.log('A client disconnected.');
  });
});

function handleUpdateStatus(userId, callId, status, ws) {
  // Broadcast the status directly as it is received
  if (status === 'Being Reviewed') {
    // If the call is being reviewed, store it in callStatuses
    callStatuses[callId] = {
      status: 'Being Reviewed',
      userId: userId,
    };
  } else if (status === 'Pending') {
    // If the call is set to "Pending," remove it from callStatuses
    delete callStatuses[callId];
  }
  
  // Broadcast status update to all clients
  broadcastStatusUpdate(callId,userId, status, ws);
}

function handleSubmitStatus(callId,userId,ws) {
  callStatuses[callId] = 'Completed';
  broadcastStatusUpdate(callId,userId,'Completed', ws);

  const query = 'UPDATE call_data SET review_status = ? WHERE signal_id = ?';
  db.query(query, ['Completed', callId], (err, results) => {
    if (err) {
      console.error('Error updating database:', err);
      return;
    }
    console.log(`Call with signal_id ${callId} updated to Completed.`);
    delete callStatuses[callId];

  });
}

function handlePageNavigateOrRefresh(userId, callId, ws) {
  console.log("Page navigation or refresh detected");
  
  // Set the call status to "Pending" when the user navigates away
  if (callStatuses[callId] && callStatuses[callId].userId === userId) {
    delete callStatuses[callId];  // Remove the call from callStatuses
    broadcastStatusUpdate(callId, userId, 'Pending', ws);
  }
}

function broadcastStatusUpdate(callId,userId, status, ws) {
  console.log(callId);  console.log(userId);console.log(status);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== ws) {
      client.send(JSON.stringify({ type: 'STATUS_UPDATE', callId,userId, status }));
    }
  });
}

server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
