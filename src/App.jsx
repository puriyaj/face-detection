import { useRef, useState, useEffect } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import * as facemesh from '@tensorflow-models/facemesh';
import Webcam from 'react-webcam';
import { drawMesh } from './utilities/utilities.js';

function App() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const runFacemesh = async () => {
        const net = await facemesh.load({
            inputResolution: { width: 300, height: 200 },
            scale: 0.8,
        });
        setInterval(() => {
            detectFacemesh(net);
        }, 100);
    };

    const detectFacemesh = async (net) => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
            const video = webcamRef.current.video;
            const videoWidth = webcamRef.current.video.videoWidth;
            const videoHeight = webcamRef.current.video.videoHeight;

            webcamRef.current.video.width = videoWidth;
            webcamRef.current.video.height = videoHeight;

            canvasRef.current.width = videoWidth;
            canvasRef.current.height = videoHeight;

            const faces = await net.estimateFaces(video);

            const ctx = canvasRef.current.getContext('2d');
            drawMesh(faces, ctx);

            // Show loader until a face is detected
            if (faces.length > 0) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        runFacemesh();
    }, []);

    return (
        <div className="bg-gray-800">
            {loading && (
                <div className="loader ">
                    <p className='text-gray-900'>Detecting your face ...</p>
                </div>
            )}
            <Webcam
                ref={webcamRef}
                style={{
                    position: 'absolute',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    zIndex: 9,
                    width: 300,
                    height: 200,
                }}
            />
            <canvas
                ref={canvasRef}
                style={{
                    position: 'absolute',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    zIndex: 9,
                    width: 300,
                    height: 200,
                }}
            />
        </div>
    );
}

export default App;
