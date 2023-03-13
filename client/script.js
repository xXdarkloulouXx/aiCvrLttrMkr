window.onload = function() {
    const form = document.querySelector('form') // Get the form from html file
    var responseContainer = document.querySelector('#response_container')

    let loadInterval
    // responseContainer.addEventListener('keyup', () => {
    //     responseContainer.style.height = `${responseContainer.scrollHeight}px`;
    // })

    function loader(element) {
        element.textContent = ''
    
        loadInterval = setInterval(() => {
            // Update the text content of the loading indicator
            element.textContent += '.';
    
            // If the loading indicator has reached three dots, reset it
            if (element.textContent === '....') {
                element.textContent = '';
            }
        }, 300);
    }

    async function getTextFromPDF(fileInput) {
        const file = fileInput.files[0];
        const url = URL.createObjectURL(file);
      
        try {
            const pdf = await pdfjsLib.getDocument(url).promise;
            const numPages = pdf.numPages;
            let fullText = '';
        
            for (let i = 1; i <= numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const textItems = textContent.items;
                let pageText = '';
        
                for (let j = 0; j < textItems.length; j++) {
                    pageText += textItems[j].str + ' ';
                }
        
                fullText += pageText;
            }
        
            return fullText;
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            URL.revokeObjectURL(url);
        }
    } 

    function typeText(element, text) {
        let index = 0
    
        let interval = setInterval(() => {
            if (index < text.length) {
                element.innerHTML += text.charAt(index)
                index++
            } else {
                clearInterval(interval)
            }
        }, 20)
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        // get cv pdf from form and extract the text from it in a string
        const cvInput = document.getElementById('cvFile');
        const cvFullText = await getTextFromPDF(cvInput);
        const cvString = cvFullText;

        // get old motivation letter pdf from form and extract the text from it in a string
        const oldMotivationLetterInput = document.getElementById('oldMotLetFile');
        const oldMotivationLetterFullText = await getTextFromPDF(oldMotivationLetterInput);
        const oldMotivationLetterString = oldMotivationLetterFullText;

        // cvString TEXTAREA
        // let cvString = document.getElementById("cv_uploadZone").getElementsByTagName("textarea")[0].value;
        
        // oldMotivationLetterString TEXTAREA
        // let oldMotivationLetterString = document.getElementById("oldMotivationLetter_uploadZone");

        let jobOffer = document.getElementById("jobOffer_uploadZone").getElementsByTagName("textarea")[0].value;

        let field = document.getElementById("field_uploadZone").getElementsByTagName("select")[0].value;

        // to focus scroll to the bottom 
        responseContainer.scrollTop = responseContainer.scrollHeight;

        // responseContainer.innerHTML = "..."
        loader(responseContainer)
        
        // create query for openAI api
        const combinedString = "Write a cover letter for this job offer: " + jobOffer + " based on my cv: " + cvString + ". Get inspiration from this old motivation letter of mine: " + oldMotivationLetterString + ". I want to work in the following field: " + field + ".";
        // console.log(combinedString);

        // send query and get response from/to openAI api
        // --------- query
        // https://aicoverlettermaker.onrender.com
        // http://localhost:5001
        const response = await fetch('https://aicoverlettermaker.onrender.com', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: combinedString
            })
        })
        // ---------

        // --------- clear loader
        clearInterval(loadInterval)
        responseContainer.innerHTML = " "
        // --------- 

        // handle openAI response and show it to user
        // --------- response
        if (response.ok) {
            const data = await response.json();
            // console.log(data)
            const parsedData = data.bot.trim(); // trims any trailing spaces/'\n' 

            typeText(responseContainer, parsedData);
            // responseContainer.innerHTML = parsedData;
        } else {
            const err = await response.text();

            responseContainer.innerHTML = "Something went wrong";
            alert(err);
        }
        // ---------
    }

    form.addEventListener('submit', handleSubmit)
    // form.addEventListener('keyup', (e) => {
    //     if (e.keyCode === 13) {
    //         handleSubmit(e)
    //     }
    // })
}
