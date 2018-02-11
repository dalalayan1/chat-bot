
const CHATBOT_OBJ = {

    /**
     * domTraverser - traverses dom with id or class name
     * @param {string} selector - id or class name
     * @param {boolean} isClass - flag to determine id or class
     * @returns {object} - selected dom element
     */
    domTraverser: function(selector, isClass) {
        if (isClass) {
            return document.getElementsByClassName(selector);
        }
        return document.getElementById(selector);
    },

    /**
     * domELementCreator - creates dom element according to input object
     * @param {object} elementObj - object with details of new elements to be created
     * @returns {object} - created dom element(s)
     */
    domELementCreator: function(elementObj) {

        const { tag, attrs, children, innerText, innerHTML } = elementObj;
        let newEle = document.createElement(tag);

        if(attrs) {
            for(var key in attrs) {
                newEle.setAttribute(key, attrs[key]);
            }
        }

        if(innerText) {
            newEle.innerText = innerText;
        }

        if(innerHTML) {
            newEle.innerHTML = innerHTML;
        }
        
        if(children && children.length) {
            children.forEach((child) => {
                var childElement = domELementCreator(child);
                newEle.appendChild(childElement);
            })
        }

        return newEle;

    },

    /**
     * fetchData - performs ajax call to fetch data
     * @param {string} url - file path
     * @param {function} callback - callback which gets triggered of data fetch success
     */
    fetchData: function(url, callback) {   
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', url, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                callback(JSON.parse(xobj.responseText));
            }
        };
        xobj.send(null);
    },

    /**
     * fetchCityandWeather - performs ajax call to fetch location data
     * @param {function} callback - callback which gets triggered of data fetch success
     */
    fetchCityandWeather: function(callbackSuccess, callbackError) {

        navigator.geolocation.getCurrentPosition(function(position) {
			url = "http://api.openweathermap.org/data/2.5/weather?lat="+position.coords.latitude+"&lon="+position.coords.longitude+"&units=metric&APPID=d677437bdfcc77537e197a05bed652ab"
			fetchData(url, callbackSuccess);
        },
        function(err) {
            alert('Error: ' + err.message);
            console.error('Error: ', err.message);
            callbackError();
        });
    },

    /**
     * scrollToBottom - scrolls the view to the bottom of the page
     * @param {array} elementArray - the latest element of the array gets scrolled to
     */
    scrollToBottom: function(elementArray) {

        const elementArrayLength = elementArray.length;
        elementArray[elementArrayLength-1].scrollIntoView();
    },

    /**
     * showSlides - modifies the slide of the carousel
     * @param {number} n - no. of slides by which the carousel needs to be shifted
     * @param {number} slideIndex - current slide no.
     */
    showSlides: function(n, slideIndex) {
        var i;
        var slides = domTraverser("slide", true);
        if (n > slides.length) {slideIndex = 1} 
        if (n < 1) {slideIndex = slides.length}
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none"; 
        }
        slides[slideIndex-1].style.display = "block"; 
    }

}


const { domTraverser, domELementCreator, fetchData, fetchCityandWeather, scrollToBottom, showSlides } = CHATBOT_OBJ;
var CHATBOT = CHATBOT || {
    domTraverser,
    domELementCreator,
    fetchData,
    fetchCityandWeather,
    showSlides,
    scrollToBottom
};