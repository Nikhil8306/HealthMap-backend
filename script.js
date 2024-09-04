const initialTime = Date.now();

const heavyWork = new Promise((resolve, reject)=>{
    setTimeout(()=>{
        resolve("Heavy Work is done");
    }, 3000)
})


setInterval( ()=>{
    let currTime = Date.now();
    console.log("Inside Interval :- ", (currTime - initialTime)/1000 );
    // const value = await heavyWork; // Function will complete execution after three seconds
    for(let i = 0; i < 10000000000; i++){}
    currTime = Date.now();
    console.log("After heavy work", (currTime - initialTime)/1000 );

}, 5000);