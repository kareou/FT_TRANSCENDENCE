
function toggleDiv(route) {
    let signin = document.getElementById("signin");
    let signup = document.getElementById("signup");

    if (route === 'signup') {
        signin.style.display = "none";
        signup.style.display = "block";
    } else if (route === 'signin') {
        signin.style.display = "block";
        signup.style.display = "none";
    }
}

function changeRoute(route) {
    history.pushState(null, null, route);
    toggleDiv(route);
}
