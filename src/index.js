import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import axios from 'axios';
const App = () => {


    console.log("hello");

    const [reports, setReports] = useState([]);
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [password, setPassword] = useState('');
    const [delPassword, setDelPassword] = useState('');
    const [delTitle, setDelTitle] = useState('');
       
        useEffect(() => {               
            console.log('useeffect fired');
            const getReports = async() => {
                try {
                const response = await axios.get('/api/reports')
                console.log('response:',response,'responeseData:',response.data.reports)
                setReports(response.data.reports) 
                } catch(err) {
                    console.log(err);
                }
            }
            getReports();
        }, []) 

        const onChange = (event) => {
            const name = event.target.name;
            const value = event.target.value;
            if(name === 'title') {
                setTitle(value);
            } else if (name === 'location') {
                setLocation(value);
            } else if (name === 'description') {
                setDescription(value)
            } else if (name === 'password') {
                setPassword(value)
            }
          
        }

const createReport = async(event) => {
    event.preventDefault();
    try {
        const response = await axios.post('/api/reports', {
            title,        
            location, 
            description, 
            password
        }) 
        console.log('Reponse from createReprot:::',response.data)
        setReports([...reports, response.data])
    } catch(err) {
        console.log(err);
    }

}

const closeReport = async(event) => {
    event.preventDefault();
    try {
        const response = await axios.delete(`/api/reports/`, {
            id,
           password,
    
        })
    } catch(err){
        console.log(err, 'Report did not close')
    }
    closeReport()
}


        return (
            <>
            
            <h1>Phenomena</h1>
            <ul>
                {
                    reports.map((report, i) => {
                        return <li keys={i}>{report.title}</li>
                    })
                }

            </ul>
            <form onSubmit={ createReport }>
                <input value={ title }
                   onChange={ onChange }
                   name='title'
                   placeholder='title'
                   />
                <input value={ location }
                    onChange={ onChange }
                    name='location'
                    placeholder='location'
                    />
                <input value={ description }
                    onChange={ onChange }
                    name='description'
                    placeholder='description'
                    />      
                <input value={ password }
                    onChange={ onChange }
                    name='password'
                    placeholder='password'
                    />  
                    <button>Create Report</button>
            </form>

                <form onSubmit={ closeReport }>
                    <input type="text" value={delTitle} onChange={ onChange } name='delTitle' placeholder='Title of post to delete' />
                    <input type="text" value={delPassword} onChange={ onChange } name='delPassword' placeholder='User Password'/>
                    <button>Delete Report</button>
                </form>

            </>
    )
    }


const root = createRoot(document.getElementById('root'));
root.render(
    <App />
)
