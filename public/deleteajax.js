// Function to display results
const displayResults = (result) => {
    const divElement = document.getElementById("output");

    // Reset output at each call
    divElement.innerHTML = "";
    if (result.trans === "Error") {
        divElement.innerHTML += `
        <h2>Application Error</h2><br>
        <p>${result.result}</p>
        `;
    }
    else
    {
        divElement.innerHTML += `
        <h3>Customer Deleted!</h3>
        <p>${result.result}</p>
        `;
    
        let deleteButton = document.getElementById("deleteButton");
        if( deleteButton )
        {
            deleteButton.disabled = true;
        }
    
        let cancelButton = document.getElementById("cancelButton");
        if( cancelButton )
        {
            cancelButton.innerText = "Back";
        }
    };
};


// Handle form submission
document.querySelector("form").addEventListener("submit", e => {
    // Cancel default behavior of sending a synchronous POST request
    e.preventDefault();

    let cusIdElement = document.getElementById("cusId");
    if( cusIdElement )
    {
        // Create a FormData object, passing the form as a parameter
        const formData = new FormData(e.target);
        fetch(`/delete/${cusIdElement.value}`, {
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
});