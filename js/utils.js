
const CHATBOT_OBJ = {

    showSlides: function(n, slideIndex) {
        var i;
        var slides = domTraverser("slide", true);
        if (n > slides.length) {slideIndex = 1} 
        if (n < 1) {slideIndex = slides.length}
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none"; 
        }
        slides[slideIndex-1].style.display = "block"; 
    },

    domTraverser: function(selector, isClass) {
        if (isClass) {
            return document.getElementsByClassName(selector);
        }
        return document.getElementById(selector);
    },

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

    fetchData: function(file, callback) {   
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', file, true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                callback(xobj.responseText);
                startChat = callback;
                qaObj = JSON.parse(xobj.responseText);
            }
        };
        xobj.send(null);
    }
}


const { domTraverser, domELementCreator, fetchData, showSlides } = CHATBOT_OBJ;
var CHATBOT = CHATBOT || {
    domTraverser,
    domELementCreator,
    fetchData,
    showSlides
};