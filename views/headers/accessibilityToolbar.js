/* Functions for creating, setting, and getting cookies used to store chosen color mode and text scale */
function createDefaultCookies() {
    // Check if the cookies already exist
    const colorMode = getCookie("colorMode");
    const scaleVal = getCookie("scaleVal");

    // If the cookies don't exist, create them with default values
    if (!colorMode) {
        setCookie("colorMode", "0", 365);
    }
    if (!scaleVal) {
        setCookie("scaleVal", "100", 365);
    }
}
function setCookie(name, value, daysToExpire) {
    const date = new Date();
    date.setTime(date.getTime() + (daysToExpire * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}
function getCookie(name) {
    const cookieName = name + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookieArray = decodedCookie.split(";");

    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i];
        while (cookie.charAt(0) === " ") {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf(cookieName) === 0) {
            const cookieValue = cookie.substring(cookieName.length, cookie.length);
            return parseInt(cookieValue, 10); // Convert the string to an integer
        }
    }

    return null;
}


/* Functions for the Accessibility Toolbar */
function initAccessibilityToolbar() {
    const toolbarButton = document.getElementById('toolbarButton');
    const toolbar = document.getElementById('toolbar');

    toolbarButton.addEventListener('click', () => {
        openToolbar();
    });

    toolbarButton.addEventListener('keydown', (event) => {
        if (event.code === 'Enter' || event.code === 'Space') {
            event.preventDefault();
            openToolbar();
        }
    });

    function openToolbar(){
        if (toolbar.style.display === 'none') {
            toolbar.style.display = 'block';
        } else {
            toolbar.style.display = 'none';
        }
    }

    const toolbarLinks = toolbar.querySelectorAll('a');
    toolbarLinks.forEach((link) => {
        link.addEventListener('keydown', (event) => {
            if (event.code === 'Escape') {
                toolbar.style.display = 'none';
                toolbarButton.focus();
            }
        });
    });

    // Close toolbar if clicked outside
    document.addEventListener('click', function (event) {
        let targetElement = event.target;
        if (!toolbar.contains(targetElement) && !toolbarButton.contains(targetElement)) {
            toolbar.style.display = 'none';
        }
    });

    colorModes();
    textScale();
}

/* Color Mode Carousel */
function colorModes(){
    let currentItem = getCookie("colorMode");
    let totalItems = $('.carousel-item').length;
    console.log(currentItem);

    function showItem(index) {
        $('.carousel-inner').css('transform', 'translateX(' + (-index * 100) + '%)');

        // Get the root element (to access CSS variables)
        const root = document.documentElement;
        // Perform action based on the displayed image
        switch (index) {
            case 0:
                // Set CSS variables to Dark Mode presets
                root.style.setProperty('--bg-main', '#E7DFC5');
                root.style.setProperty('--primary', '#000000');
                root.style.setProperty('--primary-inv', '#FFFFFF');
                root.style.setProperty('--secondary', '#323232');
                root.style.setProperty('--secondary-inv', '#CDCDCD');
                root.style.setProperty('--special', '#000000');

                root.style.setProperty('--icon-primary', 'url("images/ui-icons_000000_256x240.png")');
                root.style.setProperty('--icon-primary-inv', 'url("images/ui-icons_FFFFFF_256x240.png")');
                root.style.setProperty('--icon-secondary', 'url("images/ui-icons_323232_256x240.png")');
                root.style.setProperty('--icon-secondary-inv', 'url("images/ui-icons_CDCDCD_256x240.png")');
                setCookie("colorMode", "0", 365);
                break;
            case 1:
                // Set CSS variables to Light Mode presets
                root.style.setProperty('--bg-main', '#E7DFC5');
                root.style.setProperty('--primary', '#FFFFFF');
                root.style.setProperty('--primary-inv', '#000000');
                root.style.setProperty('--secondary', '#CDCDCD');
                root.style.setProperty('--secondary-inv', '#323232');
                root.style.setProperty('--special', '#000000');

                root.style.setProperty('--icon-primary', 'url("images/ui-icons_FFFFFF_256x240.png")');
                root.style.setProperty('--icon-primary-inv', 'url("images/ui-icons_000000_256x240.png")');
                root.style.setProperty('--icon-secondary', 'url("images/ui-icons_CDCDCD_256x240.png")');
                root.style.setProperty('--icon-secondary-inv', 'url("images/ui-icons_323232_256x240.png")');
                setCookie("colorMode", "1", 365);
                break;
            case 2:
                // Set CSS variables to Invert Colors presets
                root.style.setProperty('--bg-main', '#18203A');
                root.style.setProperty('--primary', '#FFFFFF');
                root.style.setProperty('--primary-inv', '#000000');
                root.style.setProperty('--secondary', '#CDCDCD');
                root.style.setProperty('--secondary-inv', '#323232');
                root.style.setProperty('--special', '#FFFFFF');

                root.style.setProperty('--icon-primary', 'url("images/ui-icons_FFFFFF_256x240.png")');
                root.style.setProperty('--icon-primary-inv', 'url("images/ui-icons_000000_256x240.png")');
                root.style.setProperty('--icon-secondary', 'url("images/ui-icons_CDCDCD_256x240.png")');
                root.style.setProperty('--icon-secondary-inv', 'url("images/ui-icons_323232_256x240.png")');
                setCookie("colorMode", "2", 365);
                break;
            default:
                // Default to Dark Mode in case something goes wrong
                root.style.setProperty('--bg-main', '#E7DFC5');
                root.style.setProperty('--primary', '#000000');
                root.style.setProperty('--primary-inv', '#FFFFFF');
                root.style.setProperty('--secondary', '#323232');
                root.style.setProperty('--secondary-inv', '#CDCDCD');
                root.style.setProperty('--special', '#000000');

                root.style.setProperty('--icon-primary', 'url("images/ui-icons_000000_256x240.png")');
                root.style.setProperty('--icon-primary-inv', 'url("images/ui-icons_FFFFFF_256x240.png")');
                root.style.setProperty('--icon-secondary', 'url("images/ui-icons_323232_256x240.png")');
                root.style.setProperty('--icon-secondary-inv', 'url("images/ui-icons_CDCDCD_256x240.png")');
                setCookie("colorMode", "0", 365);
        }
    }
    showItem(currentItem);

    function nextItem() {
        currentItem = (currentItem + 1) % totalItems;
        showItem(currentItem);
    }

    function prevItem() {
        currentItem = (currentItem - 1 + totalItems) % totalItems;
        showItem(currentItem);
    }

    $('.carousel-control.next').click(nextItem);
    $('.carousel-control.prev').click(prevItem);
}
/* Text scale slider and text box */
function textScale(){
    let slider = document.getElementById("percent");
    let output = document.getElementById("percentValue");
    let root = document.documentElement;

    // Get saved scale value from cookie
    slider.value = getCookie("scaleVal");

    // Update the text box with the initial value of the slider
    output.value = slider.value;
    root.style.setProperty('--scale', (slider.value / 100));

    // Update the text box and save to cookie whenever the slider value changes
    slider.oninput = function() {
        output.value = this.value;
        root.style.setProperty('--scale', (this.value / 100));
        setCookie("scaleVal", this.value, 365);
    };

    // Update the slider and save to cookie whenever the text box value changes
    output.oninput = function() {
        let enteredValue = this.value;
        let numericValue = parseFloat(enteredValue);

        // Check if the entered value is numeric
        if (!isNaN(numericValue)) {
            // Ensure the entered value is within the slider's range
            if (numericValue < parseFloat(slider.min)) {
                numericValue = parseFloat(slider.min);
            } else if (numericValue > parseFloat(slider.max)) {
                numericValue = parseFloat(slider.max);
            }
            slider.value = numericValue;
            root.style.setProperty('--scale', (numericValue / 100));
            setCookie("scaleVal", numericValue, 365);
        } else {
            // If the entered value is not numeric, reset the text box to the current slider value
            this.value = slider.value;
        }
    };

    // Prevent non-numeric input in the text box
    output.onkeypress = function(event) {
        let keyCode = event.which ? event.which : event.keyCode;
        let isValid = keyCode >= 48 && keyCode <= 57; // Check if the key code corresponds to a numeric value
        if (!isValid) {
            event.preventDefault();
        }
    };
}