console.log("hello")
function searchfunction() {
    console.log("inside search")
}


function outSideFunction() {
    let timer;
    function innerFunction(){
        
        clearTimeout(timer)
       timer = setTimeout(searchfunction,3000)
    }
   
    return innerFunction;
    
    // clearTimeout(timer)
}

// function functionToCall(){
//     let z = outSideFunction();
    
// }
let functionToCall = outSideFunction()
