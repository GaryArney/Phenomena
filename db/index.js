// Require the Client constructor from the pg package
const { Client } = require('pg');
// Create a constant, CONNECTION_STRING, from either process.env.DATABASE_URL or postgres://localhost:5432/phenomena-dev
const CONNECTION_STRING = process.env.DATABASE_URL || 'postgres://localhost:5432/phenomena-dev'
// Create the client using new Client(CONNECTION_STRING)
//const client = new Client(process.env.DATABASE_URL)
const client = new Client(CONNECTION_STRING);
// Do not connect to the client in this file!

/**
 * Report Related Methods
 */
 
/**
 * You should select all reports which are open. 
 *  
 * Additionally you should fetch all comments for these
 * reports, and add them to the report objects with a new field, comments.
 * 
 * Lastly, remove the password field from every report before returning them all.
 */
async function getOpenReports() {

  try {
    // first load all of the reports which are open
    const { rows: reports } = await client.query(`
    SELECT *
    FROM reports
    WHERE reports."isOpen"=true;
    `)

    // then load the comments only for those reports, using a
    // WHERE "reportId" IN () clause
   const { rows: comments } = await client.query(`
    SELECT *
    FROM comments
    WHERE "reportId" IN (${ reports.map((report) => report.id).join(', ') })
   `)
    
    // then, build two new properties on each report:
    // .comments for the comments which go with it
    //    it should be an array, even if there are none
    // .isExpired if the expiration date is before now
    //    you can use Date.parse(report.expirationDate) < new Date()
    // also, remove the password from all reports
reports.forEach((report) => {
  delete report.password
  report.isExpired = report.expirationDate < new Date(); //checks if it's expired first
  report.comments = comments.filter((comment) => comment.reportId === report.id  )
});


    // finally, return the reports
  
    return reports;

  } catch (error) {
    throw error;
  }
}

/**
 * You should use the reportFields parameter (which is
 * an object with properties: title, location, description, password)
 * to insert a new row into the reports table.
 * 
 * On success, you should return the new report object,
 * and on failure you should throw the error up the stack.
 * 
 * Make sure to remove the password from the report object
 * before returning it.
 */
async function createReport(reportFields) {
  // Get all of the fields from the passed in object
const { title, location, description, password } = reportFields;

  try {
    // insert the correct fields into the reports table
    // remember to return the new row from the query
    const { rows } = await client.query(`
    INSERT INTO reports(title, location, description, password)
    VALUES($1, $2, $3, $4)
    RETURNING *;
    `, [title, location, description, password])

    // remove the password from the returned row
    delete rows[0].password;

    // return the new report
    return rows[0] //the object is the zero of rows

  

  } catch (error) {
    throw error;
  }
}

/**
 * NOTE: This function is not for use in other files, so we use an _ to
 * remind us that it is only to be used internally.
 * (for our testing purposes, though, we WILL export it)
 * 
 * It is used in both closeReport and createReportComment, below.
 * 
 * This function should take a reportId, select the report whose 
 * id matches that report id, and return it. 
 * 
 * This should return the password since it will not eventually
 * be returned by the API, but instead used to make choices in other
 * functions.
 */
async function _getReport(reportId) {
  try {
    // SELECT the report with id equal to reportId  //dollarsign curly braces since it's a variable
    const { rows: [report] } = await client.query(`
      SELECT *
      FROM reports
      WHERE id=${reportId}
    `)

    // return the report
    return report;

  } catch (error) {
    throw error;
  }
}

/**
 * You should update the report where the reportId 
 * and password match, setting isOpen to false.
 * 
 * If the report is updated this way, return an object
 * with a message of "Success".
 * 
 * If nothing is updated this way, throw an error
 */
async function closeReport(reportId, password) {
  try {
    // First, actually grab the report with that id
    const { rows: [report] } = await client.query(`
    SELECT id
    FROM reports
    WHERE id=${reportId};
    `) //this should only return one row
console.log('reporttttttttttttttttttttt',report);
    // If it doesn't exist, throw an error with a useful message
  if (!report) {
    throw Error('Report does not exist with that id');
  }    

  const { rows: [userPassword] } = await client.query(`
  SELECT password
  FROM reports
  WHERE id=${reportId} AND password='${password}';
  
  `)
    // If the passwords don't match, throw an error
console.log('userpaswworddddddddddddd',userPassword);
  if (!userPassword) {
    throw Error('Password incorrect for this report, please try again');
  }
    // If it has already been closed, throw an error with a useful message

  const singleReport = await _getReport(reportId)

  if (singleReport.isOpen === false) {
    throw Error('This report has already been closed')
  }  
console.log('singlereportttttttttttttttt',singleReport);
    // Finally, update the report if there are no failures, as above
  // const { rows: [noFailures]} = await client.query(`
  // SELECT *
  // FROM reports
  // WHERE id=${reportId} AND "isOpen"='true'
  // AND password='${password}';
  // `)
console.log('fail beforeeeeeeeeeeee',singleReport.isOpen,'REportId',reportId,'PASSword',password);
  if (singleReport.isOpen === true) {
    const {rows: [updateReport]} = await client.query(`
    UPDATE reports
    SET "isOpen"='false'
    WHERE id=$1
    RETURNING *;
    `, [reportId])
    console.log('updatesssssss',updateReport);
console.log('fail afterrrrrrrrrrrrrr',singleReport,'REportId',reportId,'PASSword',password);
return ({ message: "Report successfully closed!"}); ///F FINALLY
  }
    // if(noFailures.isOpen === false){
    //   return ({ message: "Report successfully closed!"}); ///F FINALLY

    // } 
  

    // Return a message stating that the report has been closed

  } catch (error) {
    throw error;
  }
}

/**
 * Comment Related Methods
 */

/**
 * If the report is not found, or is closed or expired, throw an error
 * 
 * Otherwise, create a new comment with the correct
 * reportId, and update the expirationDate of the original
 * report to CURRENT_TIMESTAMP + interval '1 day' 
 */
async function createReportComment(reportId, commentFields) {
  // read off the content from the commentFields
  const comment = commentFields.content;


  try {
    // grab the report we are going to be commenting on
const report = await _getReport(reportId);

    // if it wasn't found, throw an error saying so
    if (!report) {
      throw Error('That report does not exist, no comment has been made')
    }

    // if it is not open, throw an error saying so
    if (report.isOpen === false) {
      throw Error('That report has been closed, no comment has been made');
    }

    // if the current date is past the expiration, throw an error saying so
    // you can use Date.parse(report.expirationDate) < new Date() to check
    if (Date.parse(report.expirationDate) < new Date()) {
      throw Error('The discussion time on this report has expired, no comment has been made')
    }
    // all go: insert a comment
    const { rows: [newComment] } = await client.query(`
    INSERT INTO comments(content)
    VALUES($1)
    RETURNING *;

    `, [comment])
    // then update the expiration date to a day from now


//     const currDate = new Date(report.expirationDate);
// currDate.setHours(currDate.getHours() + 24);
const { rows: [newDate] } = await client.query(`
  UPDATE reports
  SET "expirationDate" = CURRENT_TIMESTAMP + interval '1 day'
  WHERE id=$1 AND reports."isOpen"='true'
  RETURNING *;
`, [reportId]);

// Finally, return the new comment and report objects
return newComment;

  } catch (error) {
    throw error;
  }
}

// export the client and all database functions below
module.exports = {
  client,
  createReport,
  getOpenReports,
  _getReport,
  closeReport,
  createReportComment
}