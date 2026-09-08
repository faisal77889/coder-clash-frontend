import { useState } from "react";

const Test = () => {
    const [count, setCount] = useState(0);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    setCount(prev => prev + 1);
    console.log("printed")
    return (
        <div>
            Test
        </div>
    )
}
export default Test;