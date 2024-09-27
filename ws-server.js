// websocket will contious if user click on another page or refresh the page

// const WebSocket = require("ws");

// const wss = new WebSocket.Server({ port: 8080 });

// let currentStatus = {}; // Track the current state of each callId
// let employeeProcessing = {}; // Track which event each employee is processing

// // Broadcast a message to all clients except the sender
// function broadcastToOthers(data, sender) {
//   wss.clients.forEach((client) => {
//     if (client.readyState === WebSocket.OPEN && client !== sender) {
//       client.send(JSON.stringify(data));
//     }
//   });
// }

// wss.on("connection", (ws) => {
//   console.log("Client connected");

//   // On connection, send the current state to the client
//   ws.send(JSON.stringify({ type: "INITIAL_DATA", data: currentStatus }));

//   ws.on("message", (message) => {
//     const data = JSON.parse(message);
//     const { callId, employeeCode } = data;

//     if (data.type === "UPDATE_STATUS" && callId && employeeCode) {
//       const previousCallId = employeeProcessing[employeeCode];

//       // Stop previous event if it exists and is different from the current one
//       if (previousCallId && previousCallId !== callId) {
//         currentStatus[previousCallId] = { status: "Stopped", employeeCode };
//         broadcastToOthers({
//           type: "STATUS_UPDATE",
//           callId: previousCallId,
//           status: "Stopped",
//         }, ws);
//       }

//       // Mark the new event as "Processing"
//       currentStatus[callId] = { status: "Processing", employeeCode };
//       employeeProcessing[employeeCode] = callId;

//       broadcastToOthers({
//         type: "STATUS_UPDATE",
//         callId,
//         status: "Processing",
//         employeeCode,
//       }, ws);
//     }
//   });

//   ws.on("close", () => {
//     console.log("Client disconnected");
//   });
// });

// console.log("WebSocket server running on ws://localhost:8080");
// WebSocket Server-side (Node.js)






// =====================================================================================

const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 8080 });

let currentStatus = {}; // Keeps track of the processing status for each callId

wss.on("connection", (ws) => {
  console.log("New client connected");

  // Send the current status to the newly connected client
  ws.send(
    JSON.stringify({
      type: "INITIAL_DATA",
      data: currentStatus,
    })
  );

  ws.on("message", (message) => {
    const data = JSON.parse(message);

    if (data.type === "START_PROCESSING") {
      const { callId, employeeCode } = data;

      // Stop previous processing for this employee
      for (const key in currentStatus) {
        if (currentStatus[key].employeeCode === employeeCode) {
          // Notify all clients to stop previous processing
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "STATUS_UPDATE",
                  callId: key,
                  status: "Stopped",
                })
              );
            }
          });
          delete currentStatus[key]; // Remove previous status for that employee
        }
      }

      // Update current status for the new call
      currentStatus[callId] = { status: "Processing", employeeCode };

      // Broadcast the new status to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "STATUS_UPDATE",
              callId,
              status: "Processing",
              employeeCode,
            })
          );
        }
      });
    }

    if (data.type === "STOP_PROCESSING") {
      const { callId } = data;
      delete currentStatus[callId];

      // Broadcast status update to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(
            JSON.stringify({
              type: "STATUS_UPDATE",
              callId,
              status: "Stopped",
            })
          );
        }
      });
    }

    if (data.type === "RESET_PROCESSING") {
      const { employeeCode } = data;
      // Reset all processing for this user
      for (const key in currentStatus) {
        if (currentStatus[key].employeeCode === employeeCode) {
          delete currentStatus[key];
          // Notify all clients to stop this processing
          wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({
                  type: "STATUS_UPDATE",
                  callId: key,
                  status: "Stopped",
                })
              );
            }
          });
        }
      }
    }
  });

  ws.on("close", () => {
    console.log("Client disconnected");

    // On disconnect, stop any processing associated with the disconnected client
    for (const callId in currentStatus) {
      const status = currentStatus[callId];
      if (status.ws === ws) {
        delete currentStatus[callId];
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(
              JSON.stringify({
                type: "STATUS_UPDATE",
                callId,
                status: "Stopped",
              })
            );
          }
        });
      }
    }
  });
});

console.log("WebSocket server running on ws://localhost:8080");
