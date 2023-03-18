// Build an apiRouter using express Router
const express = require('express');
const router = express.Router();//router can be any name on this
// Import the database adapter functions from the db
const { getOpenReports, createReport, closeReport, createReportComment } = require('../db/index.js')

/**
 * Set up a GET request for /reports
 * 
 * - it should use an async function
 * - it should await a call to getOpenReports
 * - on success, it should send back an object like { reports: theReports }
 * - on caught error, call next(error)
 */
router.get('/reports', async(req, res, next) => {
        try {
 const reports = await getOpenReports()
    console.log('REPORTS', reports)
  res.send({ reports })// or just reports
} catch(err) {
    next(err);
}

})

/**
 * Set up a POST request for /reports
 * 
 * - it should use an async function
 * - it should await a call to createReport, passing in the fields from req.body
 * - on success, it should send back the object returned by createReport
 * - on caught error, call next(error)
 */
router.post('/reports', async (req, res, next) => {
    try {
        const reports = await createReport(req.body)
        // console.log('REPORTTTSSSS',reports,'BODY?',req.body);
        res.send(reports);
    } catch(err) {
        next(err);
    }
});


/**
 * Set up a DELETE request for /reports/:reportId
 * 
 * - it should use an async function
 * - it should await a call to closeReport, passing in the reportId from req.params
 *   and the password from req.body
 * - on success, it should send back the object returned by closeReport
 * - on caught error, call next(error)
 */
router.delete('/reports/:id', async (req, res, next) => {
    // console.log("DELETE REQUEST RECEIVED");
    const reportId = req.params.id;
    const { password } = req.body; 

    try {

    // console.log('Password:', password, 'reportId:', reportId, 'ID:',req.params.id);  

        const message = await closeReport(reportId, password);           
            res.send(message);

    } catch(error) {
        next(error);
    }
})




/**
 * Set up a POST request for /reports/:reportId/comments
 * 
 * - it should use an async function
 * - it should await a call to createReportComment, passing in the reportId and
 *   the fields from req.body
 * - on success, it should send back the object returned by createReportComment
 * - on caught error, call next(error)
 */
router.post('/reports/:id/comments', async (req, res, next) =>{


    try{
        const { id } = req.params;
        const  commentFields  = req.body;

        if(id && commentFields){
            // console.log('COMMENTFIELDSS',commentFields, 'ID', id);
        const newComment = await createReportComment(id, commentFields);
        // console.log('NEWCOOOOOOOOOOOOOOOOOOOOMENT',newComment.content)
            res.send( newComment )
        }
    } catch(err) {
        next(err);
    }

})


// Export the apiRouter
module.exports = {
    router
}