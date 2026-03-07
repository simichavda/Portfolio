document.addEventListener("DOMContentLoaded", function() {
    
    var h2 = document.getElementById("project-text");


    window.onscroll = function() {
        if (document.body.scrollTop > 170 || document.documentElement.scrollTop > 170) {
            h2.style.display = "none";
        } else {
            h2.style.display = "block";  
        }
    };

});
