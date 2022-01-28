import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import WaitingRoom from './components/WaitingRoom';
import Room from './components/Room';
import {v1 as uuid} from 'uuid';
import './App.css';
import MediaProvider from './components/MediaProvider';
import SessionProvider from './components/SessionProvider'

const App = () => {

    const [uid, setUid] = useState(null);

    useEffect(() => {
        let newId = uuid();
        setUid(newId);
    }, []);

    return (
        <div className="App">
            <div className="YourUidGuide">Your uid: {uid}</div>
            <Router><MediaProvider><SessionProvider uid={uid}>

                <Routes>
                    <Route path="/waiting-room" element={<WaitingRoom uid={uid}/>} />
                    <Route path="/room/:roomId" element={<Room/>} />
                </Routes>

            </SessionProvider></MediaProvider></Router>
        </div>
    );
};

export default App;
