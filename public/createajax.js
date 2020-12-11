// Function to display results
const displayResults = (result) => {
    const divElement = document.getElementById("output");
    // Reset output at each call
    divElement.innerHTML = "";

    if (result.trans === "Error") {
        divElement.innerHTML += `
        <h2>Application Error</h2><br>
        <p>${result.result}</p>
        `
    }
    else
    {
        divElement.innerHTML += `
        <h3>New Customer Created!</h3>
        <p>${result.result}</p>
        `;
    };
};

// Handle form submission
document.querySelector("form").addEventListener("submit", e => {
    // Cancel default behavior of sending a synchronous POST request
    e.preventDefault();

    
    let cusFnameElement = document.getElementById("cusFname");
    let cusLnameElement = document.getElementById("cusLname");

    let cusSalesYTDElement = document.getElementById("cusSalesYTD");
    let cusSalesPrevElement = document.getElementById("cusSalesPrev");
    let cusStateElement = document.getElementById("cusState");
    if( cusFnameElement && cusLnameElement && cusSalesYTDElement && cusSalesPrevElement && cusStateElement)
    {
        if( ( cusSalesYTDElement.value != "" && isNaN( cusSalesYTDElement.value ) ) || ( cusSalesPrevElement.value != "" && isNaN( cusSalesPrevElement.value ) ) )
        {
            alert( "Customer Sales must be numeric" );
        }
        else if( cusStateElement.value != "" && ( ( cusStateElement.value.length != 2 ) || ( ! /^[a-zA-Z]+$/.test( cusStateElement.value ) ) ) )
        {
            alert( "Customer State must be two letter abreviation" );
        }
        else if( cusFnameElement.value == "" || cusLnameElement.value == "" )
        {
            alert( "First and Last name required" );
        }
        else
        {
            // Create a FormData object, passing the form as a parameter
            const formData = new FormData(e.target);
            fetch("/create", {
                method: "POST",
                body: formData
            })
            .then(response => response.json())
            .then(result => {
                displayResults(result);
            })
            .catch(err => {
                console.error(err.message);
            });
        }
    }
});