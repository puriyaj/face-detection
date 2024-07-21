import { useRef, useState, useEffect } from 'react';
import './App.css';
import * as facemesh from '@tensorflow-models/facemesh';
import Webcam from 'react-webcam';
import { drawMesh } from './utilities/utilities.js';

function App() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);

    const runFacemesh = async () => {
        const net = await facemesh.load({
            inputResolution: { width: 640, height: 480 },
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

            if (faces.length > 0) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        runFacemesh();
    }, []);

    return (
        <div className="bg-gray-800 relative">
            {loading && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xl font-bold z-10">
                    <p>Loading...</p>
                </div>
            )}
            <Webcam
                ref={webcamRef}
                className="absolute inset-0 mx-auto w-full h-auto z-9"
            />
            <canvas
                ref={canvasRef}
                className="absolute inset-0 mx-auto w-full h-auto z-9"
            />
        </div>
    );
}

export default App;
