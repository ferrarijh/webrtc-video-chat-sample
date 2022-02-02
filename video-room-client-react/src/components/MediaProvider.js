import React, { useState } from 'react';

const MediaContext = React.createContext();

const MediaProvider = (props) => {

    const [stream, setStream] = useState(null);

    const toggleMyCamera = () => {
        if (stream === null)
            activateCamera();
        else
            stopMediaDevices();
    };

    const activateCamera = () => {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: {
                width: 320,
                height: 240
            }
        }).then(stream => {
            setStream(stream);
        }).catch(e => console.log(e));
    };

    const stopMediaDevices = () => {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
    };

    return (
        <MediaContext.Provider value={{ stream, toggleMyCamera }}>
            {props.children}
        </MediaContext.Provider>
    );
};

export default MediaProvider;
export { MediaContext };
