import {useEffect, useRef} from 'react';

const useInterval = (callback, delay) => {

const savedCallback = useRef();

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

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