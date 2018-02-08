'use strict';
(function () {
    var chatArea = domIdTraverser("chatArea");
    var inputMsg = domIdTraverser("inputMsg");
    var sendBtn = domIdTraverser("sendBtn");
    var qaObj, index = 0, slideIndex;

    sendBtn.addEventListener("click", addQuestionAnswer);
    

    function domIdTraverser(id) {
        return document.getElementById(id);
    }
    function loadJSON(callback) {   
        var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
        xobj.open('GET', 'qa.json', true);
        xobj.onreadystatechange = function () {
            if (xobj.readyState == 4 && xobj.status == "200") {
                callback(xobj.responseText);
            }
        };
        xobj.send(null);
    }

    function getJSONdata(data) {
        const parsedData = JSON.parse(data);
        qaObj = parsedData;
        startChat();
    }

    function startChat() {
        const { questions } = qaObj;

        addQuestionAnswer(null, questions[index]);
    }

    function addQuestionAnswer(evt, text, type, link) {
        if(evt) {
            evt.preventDefault();
        }
        var chatAreaInnerHTML = chatArea.innerHTML;

        if( text ) {
            chatArea.innerHTML = `${chatAreaInnerHTML}
                                <div class="text-div">
                                    <div class="bot-text">${text}</div>
                                    <div class="clearfix"></div>
                                </div>`;
        }
        else if (evt && !text && inputMsg.value) {
            chatArea.innerHTML = `${chatAreaInnerHTML}
                                <div class="text-div">
                                    <div class="user-text">${inputMsg.value}</div>
                                    <div class="clearfix"></div>
                                </div>`;
            processInput(inputMsg.value);
            inputMsg.value = '';
        }
        else if (type === "video") {
            chatArea.innerHTML = `${chatAreaInnerHTML}
                                <div class="text-div">
                                    <div class="bot-text">
                                        <iframe width="200"
                                            src="${link}" frameborder="0" allowfullscreen>
                                        </iframe>
                                    </div>
                                    <div class="clearfix"></div>
                                </div>`;
        }
        else if (type === "carousel") {
            var carouselWrapper = document.createElement('div');
            link.forEach((imageLink, idx) => {
                carouselWrapper.innerHTML = `${carouselWrapper.innerHTML}
                                                <div class="slide ${idx}">
                                                    <img src="${imageLink}" style="width:100%">
                                                </div>`;
            });
            carouselWrapper.innerHTML = `${carouselWrapper.innerHTML}
                                            <span id="prevBtn" class="prev-btn">&#10094;</span>
                                            <span id="nextBtn" class="next-btn">&#10095;</span>`;

            chatArea.innerHTML = `${chatAreaInnerHTML}
                                <div class="text-div">
                                    <div class="carousel-wrapper">
                                        ${carouselWrapper.innerHTML}
                                    </div>
                                    <div class="clearfix"></div>
                                </div>`;

            slideIndex = 1;
            showSlides(slideIndex);

            var prevBtn = domIdTraverser("prevBtn");
            var nextBtn = domIdTraverser("nextBtn");

            prevBtn.addEventListener("click",() => {
                showSlides(slideIndex += -1);
            });

            nextBtn.addEventListener("click",() => {
                showSlides(slideIndex += 1);
            });
                                
        }
    }

    function showSlides(n) {
        var i;
        var slides = document.getElementsByClassName("slide");
        if (n > slides.length) {slideIndex = 1} 
        if (n < 1) {slideIndex = slides.length}
        for (i = 0; i < slides.length; i++) {
            slides[i].style.display = "none"; 
        }
        slides[slideIndex-1].style.display = "block"; 
    }


    function processInput(inputVal){
        const {
            answers: {
                hairCondition,
                washCheck: {
                    recommendedWashes,
                    optionalReplyArray,
                    replyArray: replyArrayForWashCheck,
                    media: {
                        type: washCheckMediaType,
                        link: washCheckMediaLinks
                    }
                } = {},
                other
            } = {},
            answers
        } = qaObj;
        const answerValue = answers[inputVal.toLowerCase()];
        const goToQuestionNumber = answerValue && answerValue.goToQuestion;
        if(typeof goToQuestionNumber === "number" && index === 0) {
            answers["hairCondition"] = inputVal;

            index = goToQuestionNumber;

            setTimeout(() => {
                startChat();
            }, 1000);
        }
        else if(typeof parseInt(inputVal) === "number" && index === 1) {
            const noOfWashes = parseInt(inputVal);
            if(noOfWashes < recommendedWashes && hairCondition === "dull") {
                Array.isArray(optionalReplyArray) && optionalReplyArray.length &&
                    optionalReplyArray.forEach((eachReply, idx) => {
                        eachReply = eachReply.replace('{number}',noOfWashes).replace('{hairCondition}',hairCondition);
                        setTimeout(() => {
                            addQuestionAnswer(null, eachReply)
                        }, (idx+1)*1000);
                    });
            }
            else if(noOfWashes >= recommendedWashes && hairCondition === "oily") {
                Array.isArray(optionalReplyArray) && optionalReplyArray.length &&
                    optionalReplyArray.forEach((eachReply, idx) => {
                        eachReply = eachReply.replace('{number}',noOfWashes).replace('{hairCondition}',hairCondition);
                        setTimeout(() => {
                            addQuestionAnswer(null, eachReply)
                        }, (idx+1)*1000);
                    });
            }
            Array.isArray(replyArrayForWashCheck) && replyArrayForWashCheck.length &&
                replyArrayForWashCheck.forEach((eachReply, idx) => {
                    eachReply = eachReply.replace('{recommendedShampoo}',answers[answers["hairCondition"]].recommendedShampoo);
                    setTimeout(() => {
                        addQuestionAnswer(null, eachReply)
                    }, (optionalReplyArray.length+1)*1000);
                });
            washCheckMediaType === "carousel" && setTimeout(() => {
                addQuestionAnswer(null, null, washCheckMediaType, washCheckMediaLinks);
            }, (optionalReplyArray.length+replyArrayForWashCheck.length+2)*1000);
        }
        else if(typeof answerValue === "object") {
            const {
                replyArray,
                media: {
                    type,
                    link
                } = {}
            } = answerValue;

            answers["hairCondition"] = inputVal;

            Array.isArray(replyArray) && replyArray.length &&
                replyArray.forEach((eachReply, idx) => {
                    setTimeout(() => {
                        addQuestionAnswer(null, eachReply)
                    }, (idx+1)*1000);
                });
            type === "video" && setTimeout(() => {
                    addQuestionAnswer(null, null, type, link);
                }, (replyArray.length+1)*1000);
        }
        else {
            setTimeout(() => {
                addQuestionAnswer(null, other);
            }, 1000);
            setTimeout(() => {
                startChat();
            }, 2000);
        }
        
    }


    loadJSON(getJSONdata);
})();