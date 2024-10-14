require('dotenv').config(); // Load environment variables from .env file
const axios = require('axios');
const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306
};

const IP_ADDR = '10.26.0.107'; // Replace with actual IP address from .env
const PORT = '8080'; // Replace with actual port from .env
const currentDate = new Date();

// Calculate the previous day
const previousDay = new Date(currentDate);
previousDay.setDate(currentDate.getDate() - 1); // Set to the previous day

// Calculate the start time (00:15:00) of the previous day
const startTime = new Date(previousDay.setHours(0, 15, 0, 0)).getTime(); // Start of the previous day at 00:15 AM

// Calculate the end time (00:14:59.999) of the previous day
const endTime = new Date(previousDay.setHours(23, 59, 59, 999)).getTime();

async function fetchDataAndInsert() {
  let connection;
  try {
    const response = await axios.get(`http://${IP_ADDR}:${PORT}/ERSSBiServer/bi/v1/auth/quality/signal-info/complex`, {
      params: {
        startTime: startTime,
        endTime: endTime,
        isSummary: false,
        asDownloadable: true,
        pageNumber: 0,
        pageSize: 10000
      }
    });

    
    // Extract data from the response
    const data = response.data.returnList || []; // Default to an empty array if undefined
    console.log(data);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.warn('No data found in the response.');
      return; // Exit early if there's no data to process
    }

    // Create a MySQL connection
    connection = await mysql.createConnection(dbConfig);

    // Fetch all signal statuses and their IDs from master_signal_status
    const [statuses] = await connection.execute('SELECT signal_status, signal_status_id FROM master_signal_status WHERE is_active = "Y"');

    // Create a lookup map for signal_status to signal_status_id
    const statusMap = {};
    statuses.forEach(status => {
      statusMap[status.signal_status] = status.signal_status_id;
    });

    const logQuery1 = `
      INSERT INTO cron_job_logs (log_details, created_at, updated_at)
      VALUES (?, NOW(), NOW())
    `;
    const logData = {
      success: true,
      apiResponse: response.data // Log the API response data
    };
    await connection.execute(logQuery1, [JSON.stringify(logData)]);

    // Prepare the SQL query for batch insertion
    const insertQuery = `
      INSERT INTO call_data (
        signal_id,
        event_id,
        signal_type,
        signal_landing_time,
        event_maintype,
        event_subtype,
        voip_extn,
        agent_name,
        addl_signal_info,
        voice_path,
        call_pick_duration_millis,
        call_duration_millis,
        event_registration_time,
        agent_full_name,
        priority,
        district_code,
        victim_name,
        victim_age,
        victim_gender,
        victim_address,
        near_ps,
        addl_info,
        signal_status,
        review_status,
        is_active,
        created_at,
        updated_at
      ) VALUES ?
    `;

    // Map the data to an array of values
    const values = data.map(item => {
      const eventInfo = item.eventBasicInfo || {};
      const victimInfo = eventInfo.victimInfo || {};
      const signalStatusId = statusMap[item.signalStatus] || null; // Correct field name for signalStatus
      return [
        item.signalId || null,
        item.eventId || null,
        null, // Map directly to signalType from API
        item.signalLandingTime || null,
        eventInfo.eventMainType || null,
        eventInfo.eventSubType || null, 
        item.voipExtn || null,
        item.agentName || null,
        item.addlSignalInfo || null,
        item.voicePath || null,
        item.callPickDurationMillis || null,  // Ensure null if missing
        item.callDurationMillis || null,      // Ensure null if missing
        item.eventRegistrationTime || null,  // Ensure null if missing
        item.agentFullName || null,
        eventInfo.priority || null,
        eventInfo.districtCode || null,
        victimInfo.personName || null,
        victimInfo.age || null,                // Ensure null if missing
        victimInfo.gender || null,             // Ensure null if missing
        victimInfo.personAddress || null,
        eventInfo.nearPs || null,
        eventInfo.addlInfo || null,
        signalStatusId,
        'Pending', // review_status default to Pending
        'Y', // is_active default to Y
        new Date(), // created_at
        new Date()  // updated_at
      ];
    });

    // Execute the batch insert query
    await connection.query(insertQuery, [values]);

    // Update signal_type based on signal_status
    const updateSignalTypeQuery = `
      UPDATE call_data cd
      JOIN master_signal_status mss ON cd.signal_status = mss.signal_status_id
      JOIN master_signal_type mst ON mss.master_signal_type_id = mst.signal_type_id
      SET cd.signal_type = mst.signal_type_id
      WHERE cd.signal_type IS NULL
    `;
    await connection.execute(updateSignalTypeQuery);

    // Get data from master_signal_type
    const [signalTypes] = await connection.execute('SELECT * FROM master_signal_type WHERE is_active = "Y"');

    for (const type of signalTypes) {
      const percentage = type.percentage_of_calls_qa;
      const maxLimit = type.maximum_limit;
      const signalTypeId = type.signal_type_id;

      // Fetch call data for the current signal_type
      const [callData] = await connection.execute(`
        SELECT id, agent_name
        FROM call_data
        WHERE signal_type = ?
          AND is_qa_active = 'N'
      `, [signalTypeId]);

      const totalCalls = callData.length;
      const numberOfCalls = Math.min(Math.ceil((percentage / 100) * totalCalls), maxLimit);

      // Group calls by agent_name
      const agentCallsMap = callData.reduce((acc, call) => {
        acc[call.agent_name] = acc[call.agent_name] || [];
        acc[call.agent_name].push(call.id);
        return acc;
      }, {});

      // Flatten the groups and ensure we cycle through each agent_name
      let markedIds = [];
      const agentNames = Object.keys(agentCallsMap);

      while (markedIds.length < numberOfCalls) {
        for (const agent of agentNames) {
          if (markedIds.length >= numberOfCalls) break;

          // Select a random id for this agent_name, ensuring no repeats
          const availableIds = agentCallsMap[agent].filter(id => !markedIds.includes(id));
          if (availableIds.length > 0) {
            const randomId = availableIds[Math.floor(Math.random() * availableIds.length)];
            markedIds.push(randomId);
          }
        }
      }

      // Update the selected calls to is_qa_active = 'Y'
      if (markedIds.length > 0) {
        const idsString = markedIds.join(',');
        await connection.execute(`
          UPDATE call_data
          SET is_qa_active = 'Y'
          WHERE id IN (${idsString})
        `);
      }
    }

    console.log('Data inserted and updated successfully!');

    // Insert log data into the cron_job_logs table
    const logQuery = `
      INSERT INTO cron_job_logs (log_details, created_at, updated_at)
      VALUES (?, NOW(), NOW())
    `;
    await connection.execute(logQuery, [JSON.stringify({ success: true })]);

  } catch (error) {
    console.error('Error fetching data or inserting into database:', error.message);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Execute the function
fetchDataAndInsert();
