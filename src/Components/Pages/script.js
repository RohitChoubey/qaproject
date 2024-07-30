// Wait for the DOM content to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    var getSidebar = document.querySelector('nav');
    var getToggle = document.getElementsByClassName('toggle');
    
    // Loop through each element with class 'toggle' and add click event listener
    for (var i = 0; i < getToggle.length; i++) {
        getToggle[i].addEventListener('click', function () {
            getSidebar.classList.toggle('active');
        });
    }
});
