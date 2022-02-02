import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WaitingRoom from './components/WaitingRoom';
import Room from './components/Room';
import './App.css';
import MediaProvider from './components/MediaProvider';
import NetworkProvider from './components/NetworkProvider'
import UserStatusProvider from './components/UserStatusProvider';

const App = () => {

    return (
        <div className="App">
            <Router>
            
            <MediaProvider>
            <UserStatusProvider>
            <NetworkProvider>

                <Routes>
                    <Route path="/" element={<Navigate to="/waiting-room"/>}/>
                    <Route path="/waiting-room" element={<WaitingRoom/>} />
                    <Route path="/room/:roomId" element={<Room/>} />
                </Routes>

            </NetworkProvider>
            </UserStatusProvider>
            </MediaProvider>
            
            </Router>
        </div>
    );
};

export default App;