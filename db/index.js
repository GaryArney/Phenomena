const { Client } = require('pg');
const CONNECTION_STRING = process.env.DATABASE_URL || 'postgres://localhost:5432/phenomena-dev'
const client = new Client(CONNECTION_STRING);


async function getOpenReports() {

  try {
    const { rows: reports } = await client.query(`
    SELECT *
    FROM reports
    WHERE reports."isOpen"=true;
    `)


    const { rows: comments } = await client.query(`
    SELECT *
    FROM comments
    WHERE "reportId" IN (${reports.map((report) => report.id).join(', ')})
   `)


    reports.forEach((report) => {
      delete reports.password
      report.isExpired = report.expirationDate < new Date();
      report.comments = comments.filter((comment) => comment.reportId === report.id)
    });



    return reports;

  } catch (error) {
    throw error;
  }
}


async function createReport(reportFields) {
  const { title, location, description, password } = reportFields;

  try {

    const { rows } = await client.query(`
    INSERT INTO reports(title, location, description, password)
    VALUES($1, $2, $3, $4)
    RETURNING *;
    `, [title, location, description, password])

    delete rows[0].password;

    return rows[0]



  } catch (error) {
    throw error;
  }
}


async function _getReport(reportId) {
  try {

    const { rows: [report] } = await client.query(`
      SELECT *
      FROM reports
      WHERE id=${reportId}
    `)


    return report;

  } catch (error) {
    throw error;
  }
}


async function closeReport(reportId, password) {
  try {
    const { rows: [report] } = await client.query(`
    SELECT id
    FROM reports
    WHERE id=${reportId};
    `)

    if (!report) {
      throw Error('Report does not exist with that id');
    }

    const { rows: [userPassword] } = await client.query(`
  SELECT password
  FROM reports
  WHERE id=${reportId} AND password='${password}';
  
  `)
    if (!userPassword) {
      throw Error('Password incorrect for this report, please try again');
    }

    const singleReport = await _getReport(reportId)

    if (singleReport.isOpen === false) {
      throw Error('This report has already been closed')
    }

    if (singleReport.isOpen === true) {
      const { rows: [updateReport] } = await client.query(`
    UPDATE reports
    SET "isOpen"='false'
    WHERE id=$1
    RETURNING "isOpen";
    `, [reportId])
      console.log('updatesssssss', updateReport);
      return ({ message: "Report successfully closed!" });
    }


  } catch (error) {
    throw error;
  }
}


async function createReportComment(reportId, commentFields) {
  const comment = commentFields.content;


  try {
    const report = await _getReport(reportId);
    if (!report) {
      throw Error('That report does not exist, no comment has been made')
    }

    if (report.isOpen === false) {
      throw Error('That report has been closed, no comment has been made');
    }

    if (Date.parse(report.expirationDate) < new Date()) {
      throw Error('The discussion time on this report has expired, no comment has been made')
    }
    const { rows: [newComment] } = await client.query(`
    INSERT INTO comments(content)
    VALUES($1)
    RETURNING *;

    `, [comment])


    const { rows: [newDate] } = await client.query(`
  UPDATE reports
  SET "expirationDate" = CURRENT_TIMESTAMP + interval '1 day'
  WHERE id=$1 AND reports."isOpen"='true'
  RETURNING *;
`, [reportId]);

    return newComment;

  } catch (error) {
    throw error;
  }
}


module.exports = {
  client,
  createReport,
  getOpenReports,
  _getReport,
  closeReport,
  createReportComment
}