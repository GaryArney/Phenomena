const express = require('express');
const router = express.Router();
const { getOpenReports, createReport, closeReport, createReportComment } = require('../db/index.js')


router.get('/reports', async(req, res, next) => {
        try {
 const reports = await getOpenReports()
    console.log('REPORTS', reports)
  res.send({ reports })
} catch(err) {
    next(err);
}

})


router.post('/reports', async (req, res, next) => {
    try {
        const reports = await createReport(req.body)
        res.send(reports);
    } catch(err) {
        next(err);
    }
});



router.delete('/reports/:id', async (req, res, next) => {

    const reportId = req.params.id;
    const { password } = req.body; 

    try {



        const message = await closeReport(reportId, password);           
            res.send(message);

    } catch(error) {
        next(error);
    }
})





router.post('/reports/:id/comments', async (req, res, next) =>{


    try{
        const { id } = req.params;
        const  commentFields  = req.body;

        if(id && commentFields){
        const newComment = await createReportComment(id, commentFields);
            res.send( newComment )
        }
    } catch(err) {
        next(err);
    }

})


module.exports = {
    router
}