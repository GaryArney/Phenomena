import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';



const App = () => {
    const [reports, setReports] = useState([]);


    useEffect(() => {
        const getReports = async() => {
            const response = await axios.get('/api/reports')
            setReports(response.data.reports)
        }
        getReports();
    }, []);

    const onChange = (event) => {
        if(event.target.name === 'title')
        console.log('somethg'); //added cs to prevent error
    } //else if {
      //  (event.target.name === 'location') 
   // }
    const createReport = (event) => {
        event.preventDefault();
        try {

        } catch (err){
            console.log(err)
        }
    }
    return (

        <>
        <h1>Phenomana</h1>

        <ul>
            {
                reports.map((report, i ) => {
                    return <li key={i}>{report.title}</li>
                })
            }
        </ul>

        <form>
            <input value={ title } onChange={ onChange} name='title' placehoder='title' />
            
        </form>
        </>
    )
}

const root = createRoot(docuement.getElementById('root'));
root.render()
