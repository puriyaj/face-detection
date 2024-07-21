import { useRef, useState, useEffect } from 'react';
import * as facemesh from '@tensorflow-models/facemesh';
import Webcam from 'react-webcam';
import { drawMesh } from './utilities/utilities.js';
import './App.css';

function App() {
    const webcamRef = useRef(null);
    const canvasRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [showCamera, setShowCamera] = useState(false);
    const [orientation, setOrientation] = useState('portrait');

    // Function to check and update orientation
    const checkOrientation = () => {
        if (webcamRef.current && webcamRef.current.video.readyState === 4) {
            const video = webcamRef.current.video;
            const videoWidth = video.videoWidth;
            const videoHeight = video.videoHeight;

            // Determine orientation based on video dimensions
            if (videoWidth > videoHeight) {
                setOrientation('landscape');
                setShowCamera(true);
            } else {
                setOrientation('portrait');
                setShowCamera(false);
            }
        }
    };

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
            checkOrientation(); // Update orientation and camera visibility

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
        // Initialize Facemesh
        runFacemesh();

        // Check orientation on initial render
        checkOrientation();

        // Set up matchMedia for orientation changes
        const mediaQueryList = window.matchMedia('(orientation: landscape)');
        const handleOrientationChange = (event) => {
            if (event.matches) {
                setOrientation('landscape');
                setShowCamera(true);
            } else {
                setOrientation('portrait');
                setShowCamera(false);
            }
        };

        // Listen for changes
        mediaQueryList.addEventListener('change', handleOrientationChange);

        return () => {
            mediaQueryList.removeEventListener('change', handleOrientationChange);
        };
    }, []);

    return (
        <div >
            {loading && !showCamera && (
                <div className="loader">
                    <p className='text-gray-900'>Please rotate your phone to landscape mode.</p>
                </div>
            )}
            {showCamera && (
                <>
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
                            width: 640,  // 2/3 of the viewport width
                            height: 480, // 2/3 of the viewport height
                        }}
                        onUserMediaError={() => setLoading(true)}
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
                            zIndex: 10,
                            width: 640,  // 2/3 of the viewport width
                            height: 480, // 2/3 of the viewport height
                        }}
                    />
                </>
            )}
        </div>
    );
}

export default App;
