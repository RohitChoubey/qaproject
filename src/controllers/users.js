const db = require('../db')


exports.getCoQaDataByDateRange = (req, res) => {
  let { startDate, endDate, reportType } = req.query;

  if (!startDate || !endDate) {
    const today = new Date();
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

    // Format the dates to 'YYYY-MM-DD' format
    const formatDate = (date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };

    startDate = formatDate(lastMonth);  // One month ago from today
    endDate = formatDate(today);        // Today's date
  }

  // Convert formatted start and end dates to JavaScript Date objects
  const formattedStartDate = new Date(`${startDate}T00:00:00`).getTime(); // Convert to milliseconds
  const formattedEndDate = new Date(`${endDate}T23:59:59`).getTime();     // Convert to milliseconds

  let query;
  let queryParams;

  if (reportType === 'CO') {
    query = `
      SELECT
        c.signal_id,
        c.sco_qa_time,
        c.sop_score,
        c.active_listening_score,
        c.relevent_detail_score,
        c.address_tagging_score,
        c.call_handled_time_score,
        c.sco_employee_code,
        c.sco_remarks,
        d.review_status,
        d.agent_name,
        d.agent_full_name,
        d.call_duration_millis,
        d.signal_landing_time,
        d.signal_type
      FROM co_qa_data c
      JOIN call_data d
        ON c.signal_id = d.signal_id
      WHERE
        d.review_status = 'completed' AND  signal_landing_time BETWEEN ? AND ?
      ORDER BY d.signal_landing_time DESC;
    `;
    queryParams = [formattedStartDate, formattedEndDate];
  } else if (reportType === 'SCO') {

    const formattedStartDateSco = new Date(startDate).toISOString().split('T')[0] + ' 00:00:00';
    const formattedEndDateSco = new Date(endDate).toISOString().split('T')[0] + ' 23:59:59';


    query = `
  SELECT
    sco_employee_code,
    sco_name,
    COUNT(*) AS total_calls,
    AVG(sco_qa_time) AS average_qa_time_seconds
FROM co_qa_data
WHERE created_at BETWEEN ? AND ?
GROUP BY sco_employee_code, sco_name;
`;

    queryParams = [formattedStartDateSco, formattedEndDateSco];
  } else {
    return res.status(400).json({ error: "Invalid Report Type" });
  }

  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (reportType === 'CO') {
      // Process the results to merge data by agent_name
      const aggregatedData = results.reduce((acc, curr) => {
         const { agent_name, signal_type } = curr;
    // Calculate the average score based on signal_type
    let rowAverageScore;
    if (signal_type === 1) {
      // For signal_type 1, average all 5 scores
      rowAverageScore = (
        curr.sop_score +
        curr.active_listening_score +
        curr.relevent_detail_score +
        curr.address_tagging_score +
        curr.call_handled_time_score
      ) / 5;
    } else {
      // For other signal_types, average only 3 scores
      rowAverageScore = (
        curr.sop_score +
        curr.active_listening_score +
        curr.call_handled_time_score
      ) / 3;
    }

        if (!acc[agent_name]) {
          acc[agent_name] = {
            co_employee_code: curr.agent_name,
            co_name: curr.agent_full_name,
            total_calls: 0,
            total_completed_calls: 0,
            total_scores: 0,
            sop_score: 0,
            active_listening_score: 0,
            relevent_detail_score: 0,
            address_tagging_score: 0,
            call_handled_time_score: 0,
            call_duration_millis: 0,
          };
        }

        acc[agent_name].total_calls += 1;
        acc[agent_name].total_completed_calls += 1;
        acc[agent_name].total_scores += rowAverageScore; // Accumulate the row's average score
        acc[agent_name].sop_score += curr.sop_score;
        acc[agent_name].active_listening_score += curr.active_listening_score;
        acc[agent_name].relevent_detail_score += curr.relevent_detail_score;
        acc[agent_name].address_tagging_score += curr.address_tagging_score;
        acc[agent_name].call_handled_time_score += curr.call_handled_time_score;
        acc[agent_name].call_duration_millis += parseInt(curr.call_duration_millis, 10);

        return acc;
      }, {});

      const aggregatedArray = Object.values(aggregatedData).map(agent => {
        return {
          ...agent,
          average_score: agent.total_scores / agent.total_calls, // Calculate the overall average score for the agent
          average_call_duration_millis: agent.call_duration_millis / agent.total_calls,
        };
      });

      res.json(aggregatedArray);
    } else if (reportType === 'SCO') {
      // Convert average_qa_time_seconds back to HH:MM:SS format
      const scoResults = results.map(item => ({
        sco_name: item.sco_name,
        sco_employee_code: item.sco_employee_code,
        total_calls: item.total_calls,
        average_qa_time: item.average_qa_time_seconds,
        pending_calls : 0
      }));

      res.json(scoResults);
    }
  });
};







exports.getCallData = (req, res) => {
  const { signalType } = req.query;
  const query = `
  SELECT * 
  FROM call_data 
  WHERE is_active = 'Y' 
    AND is_qa_active = 'Y' 
    AND signal_type = ? 
    AND FROM_UNIXTIME(signal_landing_time / 1000, '%Y-%m-%d') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d')
`;
  db.query(query, [signalType], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Function to handle the POST request and insert data into the database
exports.createCoQaData = (req, res) => {
  const {
    signalId,
    scoQaTime,
    sopScore,
    activeListeningScore,
    releventDetailScore,
    addressTaggingScore,
    callHandledTimeScore,
    scoEmployeeCode,
    scoName,
    scoRemarks
  } = req.body;

  // Validate that all required fields are present
  if (
    signalId === undefined ||
    scoQaTime === undefined ||
    sopScore === undefined ||
    activeListeningScore === undefined ||
    (releventDetailScore === undefined) || // Can be NULL
    (addressTaggingScore === undefined) || // Can be NULL
    (callHandledTimeScore === undefined) || // Can be NULL
    scoEmployeeCode === undefined ||
    scoName === undefined ||
    (scoRemarks === undefined)
  ) {
    return res.status(400).json({ error: 'All required fields must be provided.' });
  }

  // SQL query to insert the data into the database
  const insertQuery = `
    INSERT INTO co_qa_data (
      signal_id,
      sco_qa_time,
      sop_score,
      active_listening_score,
      relevent_detail_score,
      address_tagging_score,
      call_handled_time_score,
      sco_employee_code,
      sco_name,
      sco_remarks,
      is_active
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?,?, ?,'Y')
  `;

  // SQL query to update the review_status in the call_data table
  const updateQuery = `
    UPDATE call_data
    SET review_status = 'Completed'
    WHERE signal_id = ?
  `;

  // Start a transaction
  db.beginTransaction(err => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Insert data into co_qa_data
    db.query(
      insertQuery,
      [
        signalId,
        scoQaTime,
        sopScore,
        activeListeningScore,
        releventDetailScore || null, // Handle NULL values
        addressTaggingScore || null, // Handle NULL values
        callHandledTimeScore || null, // Handle NULL values
        scoEmployeeCode,
        scoName,
        scoRemarks
      ],
      (err, results) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json({ error: err.message });
          });
        }

        // Update the review_status in call_data
        db.query(
          updateQuery,
          [signalId],
          (err, results) => {
            if (err) {
              return db.rollback(() => {
                res.status(500).json({ error: err.message });
              });
            }

            // Commit the transaction
            db.commit(err => {
              if (err) {
                return db.rollback(() => {
                  res.status(500).json({ error: err.message });
                });
              }

              res.status(201).json({ message: 'Data successfully inserted and call_data updated', id: results.insertId });
            });
          }
        );
      }
    );
  });
};
exports.updateStatus = (req, res) => {
  const { signalId, status } = req.body;

  // Validate that both signalId and status are provided
  if (!signalId || !status) {
    return res.status(400).json({ error: 'Both signalId and status must be provided.' });
  }

  // SQL query to update the review_status in the call_data table
  const updateQuery = `
    UPDATE call_data
    SET review_status = ?
    WHERE signal_id = ?
  `;

  // Execute the update query
  db.query(updateQuery, [status, signalId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'No record found with the provided signalId.' });
    }

    res.status(200).json({ message: 'Status successfully updated.' });
  });
};

exports.getCallSummaryBySignalType = (req, res) => {
  const getSignalTypesQuery = `SELECT signal_type_id, signal_type FROM master_signal_type WHERE is_active = 'Y'`;

  db.query(getSignalTypesQuery, (err, signalTypes) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const callSummary = [];
    const getCallDataForSignalType = (index) => {
      if (index >= signalTypes.length) {
        return res.json(callSummary);
      }

      const { signal_type_id, signal_type } = signalTypes[index];

      const getCallDataQuery = `
      SELECT 
        COUNT(*) AS totalCalls,
        SUM(CASE WHEN review_status = 'Completed' THEN 1 ELSE 0 END) AS completedCalls,
        SUM(CASE WHEN review_status = 'Pending' THEN 1 ELSE 0 END) AS pendingCalls
      FROM call_data
      WHERE is_active = 'Y' 
        AND is_qa_active = 'Y' 
        AND signal_type = ? 
        AND FROM_UNIXTIME(signal_landing_time / 1000, '%Y-%m-%d') = DATE_FORMAT(DATE_SUB(CURDATE(), INTERVAL 1 DAY), '%Y-%m-%d')
    `;
    
      db.query(getCallDataQuery, [signal_type_id], (err, callData) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }           

        callSummary.push({
          signalType: signal_type,
          signalTypeId: signal_type_id,
          totalCalls: callData[0]?.totalCalls ?? 0,
          completedCalls: callData[0]?.completedCalls ?? 0,
          pendingCalls: callData[0]?.pendingCalls ?? 0,
        });

        getCallDataForSignalType(index + 1);
      });
    };
    getCallDataForSignalType(0);
  });
};

exports.getScoDetailedData = (req, res) => {  const { scoEmployeeCode,startDate, endDate } = req.query;
  // Format dates for SQL query (if necessary)
  const formattedStartDate = `${startDate.split('-').reverse().join('-')} 00:00:00`;
  const formattedEndDate = `${endDate.split('-').reverse().join('-')} 23:59:59`;
  const formattedStartDateSco = formattedStartDate.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1');
  const formattedEndDateSco = formattedEndDate.replace(/(\d{2})-(\d{2})-(\d{4})/, '$3-$2-$1');
  // SQL query to retrieve data
  const query = `
    SELECT
      c.sco_employee_code,
      d.agent_full_name AS co_name,
      d.agent_name AS co_employee_code,
      c.sco_qa_time,
      c.sop_score,
      c.active_listening_score,
      c.relevent_detail_score,
      c.address_tagging_score,
      c.call_handled_time_score,
      c.sco_remarks
    FROM co_qa_data c
    JOIN call_data d ON c.signal_id = d.signal_id
    WHERE sco_employee_code = ? AND c.created_at BETWEEN ? AND ?;
  `;

  const queryParams = [scoEmployeeCode,formattedStartDateSco, formattedEndDateSco];
  // Execute the query
  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};
exports.getSignalTypes = (req, res) =>{

  // SQL query to retrieve active signal types
  const query = `
    SELECT
      signal_type_id,
      signal_type,
      percentage_of_calls_qa,
      maximum_limit,
      is_active
    FROM master_signal_type
    WHERE is_active = 'Y';
  `;

  // Execute the query
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};
exports.postSignalTypes = (req, res) =>{

  // SQL query to retrieve active signal types
  const { signal_type_id, percentage_of_calls_qa, maximum_limit } = req.body;
  // Validate input
  if (!signal_type_id || !percentage_of_calls_qa || !maximum_limit) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // SQL query to update the signal type
  const query = `
    UPDATE master_signal_type
    SET percentage_of_calls_qa = ?,
        maximum_limit = ?
    WHERE signal_type_id = ?;
  `;

  const queryParams = [percentage_of_calls_qa, maximum_limit, signal_type_id];

  // Execute the query
  db.query(query, queryParams, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    // Check if any row was affected
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Signal type not found' });
    }
    res.json({ message: 'Signal type updated successfully' });
  });
};


exports.postLogin = (req, res) => {
  const { username, password, agentType, module } = req.body;

  // Simple validation for the required fields
  if (!username || !password || !agentType || !module) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Define two sample users with different designations and full names
  const users = {
    user1: {
      username: 'SCO1',
      password: '12345',
      designation_id: '74',
      fullname: 'Sco_1',
      emp_code: 'SCO1',
    },
    user2: {
      username: 'SCO2',
      password: '12345',
      designation_id: '74',
      fullname: 'Sco_2',
      emp_code: 'SCO2',
    },
    user3: {
      username: 'SCO3',
      password: '12345',
      designation_id: '74',
      fullname: 'Sco_3',
      emp_code: 'SCO3',
    },
    user4: {
      username: 'SCO4',
      password: '12345',
      designation_id: '74',
      fullname: 'Sco_4',
      emp_code: 'SCO4',
    },
    user5: {
      username: 'SCO5',
      password: '12345',
      designation_id: '74',
      fullname: 'Sco_5',
      emp_code: 'SCO5',
    },
    user6: {
      username: 'admin',
      password: '12345',
      designation_id: '75',
      fullname: 'ADMIN_TEST',
      emp_code: 'ADM_1',
    },
  };

  // Find the user based on the provided username and password
  const user = Object.values(users).find(
    (u) => u.username === username && u.password === password
  );

  // If user not found, return an error response
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }

  // Simulated response based on the authenticated user
  const response = {
    httpStatus: 'OK',
    payLoad: {
      commonName: `cn: ${username}`,
      sirName: 'sn: TEST USER',
      agentRole: 'employeeType: district',
      userPasswordEncrypted: null,
      userProfileDto: {
        employee_code: user.emp_code,
        desg_id: null,
        desg_name: user.designation_id === '74' ? 'SCO' : 'Admin',
        desg_name_hindi: null,
        dept_id: '0',
        dept_name: null,
        e_id: '1234',
        pan_number: '',
        email_id: null,
        fullname: user.fullname,
        fname: user.fullname.split(' ')[0],
        lname: user.fullname.split(' ')[1],
        name_hindi: null,
        gender: 'M',
        dob: '1969-03-12',
        phone: '1234567890',
        emergency_phone: '',
        address: 'HNO. 123, SECTOR-05',
        city: 'GURUGRAM',
        state: 'HARYANA',
        zip: '122001',
        contact: '1234567890',
        p_address: '',
        p_city: '',
        p_state: '',
        p_zip: '',
        p_contact: null,
        joining_date: '1994-04-07',
        designation_id: user.designation_id,
        employment_type: 'R',
        authority1: '',
        authority2: '',
        marital_status: '',
        blood_group: 'Tyt2ZQ==',
        is_active: 'Y',
        dp_is_active: null,
        emp_image: null,
        emp_signature: null,
        district: null,
        religion: '',
        caste: '',
        passport_detail: '',
        category_id: '',
        created_date: '2021-11-28 11:47:06',
        grade_pay_scale: null,
        employmenttype: null,
        allowedModules: [
          'CO',
          'DO',
          'IM',
          'PMS',
          'ERV',
          'WDT',
          'CITIZEN_PORTAL',
          'PFT',
          'REPORTS',
        ],
        agentRole: 'DISTRICT_ROLE',
        allocatedRoleParams: ['Mahendragarh'],
        agentSubRole: 5,
        location: 'Mahendragarh',
        rank1: user.designation_id === '74' ? 'SCO' : 'Admin',
        substantive_rnk: '',
        belt_no: '',
        erv_deployed: null,
        erss_job_profile: null,
      },
    },
    totalItems: null,
    totalPages: null,
    additionalData: null,
    token:
      'qZgwmNl1DTid0zhN9uC0ffXEakeGxrWH0/vWPa2PrW44MxNktUemMWaN5zQgTPjoCDFFNVXhPnFQrkS0QpOHviaIHGEAF5ifDuk+1Yqk7Pj3HnAnC665alO5DKkGtG0JFYqy94R1AE2EXVDmrCKAqS2OohIOB2haLyNTt04c0AWL+mTGGzcPE9Mu9dTNdWyeoR3NqFRAMgPIu88oyJYiCJGlZoRw8lPPo+Ly76rUfaqpV9jZRMhPnhn3zLTXBSCPCr8S/oZoc7jf4v5uB1oX54eFgoQGYn4+1S+pJBBBZQXeYhMINrlHfaDRHFj1qRuU',
  };

  // Send the response
  res.status(200).json(response);
};


