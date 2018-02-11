'use strict';
(function () {
    const { domTraverser,
            domELementCreator,
            fetchData,
            fetchCityandWeather,
            scrollToBottom,
            showSlides
        } = CHATBOT,
        homeScreenContainer = domTraverser("homeScreenContainer"),
        chatAreaContainer = domTraverser("chatAreaContainer"),
        chatArea = domTraverser("chatArea"),
        inputArea = domTraverser("inputArea"),
        inputMsg = domTraverser("inputMsg"),
        sendBtn = domTraverser("sendBtn");
    let index = 0,
        qaObj,
        slideIndex,
        createElementsObj,
        createdElements,
        temperature,
        cityName;

    inputArea.addEventListener("submit",addQuestionAnswer);

    /**
     * processJSONdata - callback after data-fetch, takes further steps like asking question to user 
     * @param {object} data - parsed data after fetch
     */
    function processJSONdata(data) {

        qaObj = data;

        // removes home screen and brings in the next screen after 3s
        setTimeout(() => {
            homeScreenContainer.style.display = "none";
            chatAreaContainer.classList.add("fade-in");
            inputArea.classList.add("fade-in");
            inputMsg.focus();
        }, 3*1000);

        setTimeout(() => {
            addQuestionAnswer(null, qaObj.questions[index]);
        }, 5*1000);

    }

    /**
     * processInput - takes the input value and processes the next output 
     * @param {string} inputVal - value of input
     */
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
                    defaultReply
                } = {},
                answers
            } = qaObj,
            answerValue = answers[inputVal.toLowerCase()],
            goToQuestionNumber = answerValue && answerValue.goToQuestion;

        if ( typeof goToQuestionNumber === "number" && index === 0 ) {

            answers["hairCondition"] = inputVal;

            index = goToQuestionNumber;

            setTimeout(() => {
                addQuestionAnswer(null, qaObj.questions[index]);
            }, 1500);
        }
        else if ( typeof parseInt(inputVal) === "number" && !isNaN(inputVal) && index === 1 ) {

            const noOfWashes = parseInt(inputVal);

            if(noOfWashes < recommendedWashes && hairCondition === "dull") {

                Array.isArray(optionalReplyArray) && optionalReplyArray.length &&
                    optionalReplyArray.forEach((eachReply, idx) => {

                        eachReply = eachReply.replace('{number}',noOfWashes).replace('{hairCondition}',hairCondition);

                        setTimeout(() => {
                            addQuestionAnswer(null, eachReply);
                        }, (idx+1)*1500);
                    });
            }
            else if ( noOfWashes >= recommendedWashes && hairCondition === "oily" ) {

                Array.isArray(optionalReplyArray) && optionalReplyArray.length &&
                    optionalReplyArray.forEach((eachReply, idx) => {

                        eachReply = eachReply.replace('{number}',noOfWashes).replace('{hairCondition}',hairCondition);

                        setTimeout(() => {
                            addQuestionAnswer(null, eachReply)
                        }, (idx+1)*1500);
                    });
            }

            Array.isArray(replyArrayForWashCheck) && replyArrayForWashCheck.length &&
                replyArrayForWashCheck.forEach((eachReply, idx) => {

                    eachReply = eachReply.replace('{recommendedShampoo}',answers[answers["hairCondition"]].recommendedShampoo);

                    setTimeout(() => {
                        addQuestionAnswer(null, eachReply)
                    }, (optionalReplyArray.length+1)*1500);
                });
            washCheckMediaType === "carousel" && setTimeout(() => {

                addQuestionAnswer(null, null, washCheckMediaType, washCheckMediaLinks);
            }, (optionalReplyArray.length+replyArrayForWashCheck.length+2)*1500);

        }
        else if ( typeof answerValue === "object" ) {

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
                    }, (idx+1)*1500);
                });

            type === "video" && setTimeout(() => {

                    addQuestionAnswer(null, null, type, link);
                }, (replyArray.length+1)*1500);
        }
        // asks default question
        else {

            setTimeout(() => {
                addQuestionAnswer(null, defaultReply);
            }, 1500);

            setTimeout(() => {
                addQuestionAnswer(null, qaObj.questions[index]);
            }, 1500);
        }
        
    }

    /**
     * addQuestionAnswer - adds question/answer blocks in chat area
     * @param {object} evt - event object
     * @param {string} text - question string
     * @param {string} type - type of media
     * @param {string/array} link - media links
     */
    function addQuestionAnswer(evt, text, type, link) {


        if ( evt ) {
            evt.preventDefault();
        }

        if ( text ) {

            text = text.replace('{temperature}', temperature).replace('{cityName}', cityName);
            
            createElementsObj = {
                    tag: "div",
                    attrs: {
                        "class": "text-div"
                    },
                    children: [
                        {
                            tag: "div",
                            attrs: {
                                class: "bot-text"
                            },
                            innerText: text
                        },
                        {
                            tag: "div",
                            attrs: {
                                "class": "clearfix"
                            },
                        }
                    ]

            };
            createdElements = domELementCreator(createElementsObj);
            chatArea.appendChild(createdElements);

        }
        else if ( evt && !text && inputMsg.value ) {

            createElementsObj = {
                    tag: "div",
                    attrs: {
                        "class": "text-div"
                    },
                    children: [
                        {
                            tag: "div",
                            attrs: {
                                class: "user-text"
                            },
                            innerText: inputMsg.value
                        },
                        {
                            tag: "div",
                            attrs: {
                                "class": "clearfix"
                            },
                        }
                    ]

            };
                
            createdElements = domELementCreator(createElementsObj);
            chatArea.appendChild(createdElements);
            processInput(inputMsg.value);
            inputMsg.value = '';

        }
        else if ( type === "video" ) {

            createElementsObj = {
                    tag: "div",
                    attrs: {
                        "class": "text-div"
                    },
                    children: [
                        {
                            tag: "div",
                            attrs: {
                                class: "bot-text"
                            },
                            children: [
                                {
                                    tag: "iframe",
                                    attrs: {
                                        width: "200",
                                        src: link,
                                        frameborder: "0",
                                        allowfullscreen: true
                                    }
                                }
                            ],
                            innerText: inputMsg.value
                        },
                        {
                            tag: "div",
                            attrs: {
                                "class": "clearfix"
                            },
                        }
                    ]

            };

            createdElements = domELementCreator(createElementsObj);
            chatArea.appendChild(createdElements);

        }
        else if ( type === "carousel" ) {
            
            let childrenArray = [];
        
            link.forEach((imageLink, idx) => {

                var elementObj = {
                    tag: "div",
                    attrs: {
                        class: "slide"
                    },
                    children: [
                        {
                            tag: "img",
                            attrs: {
                                src: imageLink,
                                style: "width:100%"
                            }
                        }
                    ]
                }
                childrenArray = [ ...childrenArray, elementObj ];
            });

            createElementsObj = {
                tag: "div",
                attrs: {
                    "class": "text-div"
                },
                children: [
                    {
                        tag: "div",
                        attrs: {
                            "class": "carousel-wrapper"
                        },
                        children: [
                            ...childrenArray,
                            {
                                tag: "span",
                                attrs: {
                                    class: "prev-btn",
                                    id: "prevBtn"
                                },
                                innerHTML: "&#10094;"
                            },
                            {
                                tag: "span",
                                attrs: {
                                    class: "next-btn",
                                    id: "nextBtn"
                                },
                                innerHTML: "&#10095;"
                            },
                        ]
                    },
                    {
                        tag: "div",
                        attrs: {
                            "class": "clearfix"
                        },
                    }
                ]
            };

            createdElements = domELementCreator(createElementsObj);
            chatArea.appendChild(createdElements);

            slideIndex = 1;
            showSlides(slideIndex, slideIndex);

            const prevBtn = domTraverser("prevBtn"),
                nextBtn = domTraverser("nextBtn");

            prevBtn.addEventListener("click",() => {
                showSlides(slideIndex += -1, slideIndex);
            });

            nextBtn.addEventListener("click",() => {
                showSlides(slideIndex += 1, slideIndex);
            });
                                
        }

        const textDivs = document.querySelectorAll(".text-div");
        scrollToBottom(textDivs);
        
    }

    /**
     * fetchCityandWeather - calls api to fetch cityname and temperature
     * @param {function} - callback to add another fetch call
     */
    fetchCityandWeather(function(resp){

        const {
            main: {
                temp
            } = {},
            name
        } = resp;

        temperature = temp;
        cityName = name;

        fetchData('data/QnA.json', processJSONdata);

    });


})();