$(document).ready(function () {
    console.log("ready");

    // Function to apply the color scheme
    function applyColourScheme(newScheme) {
        $(":root").toggleClass("dark", newScheme === "dark");
        $("#appearance-button").text(newScheme === "dark" ? "wb_sunny" : "dark_mode");
    }

    // Get saved color scheme from localStorage or default to light
    let userSavedColourScheme = localStorage.getItem("colourScheme") || "light";
    applyColourScheme(userSavedColourScheme);

    // Handle color scheme toggle
    $("#appearance-button").click((e) => {
        e.preventDefault();
        // Toggle the scheme on click
        userSavedColourScheme = (userSavedColourScheme === "dark") ? "light" : "dark";  // Toggle the scheme value
        localStorage.setItem("colourScheme", userSavedColourScheme); // Save to localStorage
        applyColourScheme(userSavedColourScheme); // Apply the new scheme
        console.log(userSavedColourScheme); // Log the new scheme
    });

    // Back-to-top button functionality
    const button = document.getElementById("back-to-top");

    window.onscroll = () => {
        button.style.display = (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) ? "block" : "none";
    };

    button.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    // Tab navigation functionality
    const buttons = document.querySelectorAll(".tab-button");
    const contents = document.querySelectorAll(".tab-content");

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            buttons.forEach((btn) => btn.classList.remove("active"));
            contents.forEach((content) => content.classList.remove("active"));
            button.classList.add("active");
            document.getElementById(button.dataset.tab).classList.add("active");
        });
    });
});
