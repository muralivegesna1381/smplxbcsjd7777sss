

import {useEffect, useRef} from 'react';


const useInterval = (callback, delay) => {

    const savedCallback = useRef();

    // Remember the latest function.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function setupMethod() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(setupMethod, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
};

export default useInterval;
