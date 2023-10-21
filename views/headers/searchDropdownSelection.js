function initSearchDropdown() {
    let searchType = document.getElementById("searchType");
    let chosenType = searchType.value;
    let placeholderText = '';
    console.log(chosenType);

    switch (chosenType) {
        case 'All Categories':
            placeholderText = 'Search in All Categories';
            break;
        case 'Works':
            placeholderText = 'Search in Works';
            break;
        case 'Collections':
            placeholderText = 'Search in Collections';
            break;
        case 'Networks':
            placeholderText = 'Search in Networks';
            break;
        default:
            placeholderText = 'Search in All Categories';
            break;
    }
    $('#inputField').attr('placeholder', placeholderText);

    let inputField = document.getElementById('inputField');
    inputField.onkeydown = function() {
        //Temporary implementation of search features, only to allow the website to function at the same level as before.
        inputField.onkeydown = function (e) {
            if (e.keyCode === 13) {
                window.location = "search?q=" + inputField.value;
            }
        }
    }
}