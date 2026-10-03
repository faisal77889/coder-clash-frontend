import { useState } from "react";

const Test = () => {
    const [count, setCount] = useState(0);
    console.log("Test count:", count, setCount);
    return (
        <div>
            Test: {count}
        </div>
    );
};
export default Test;