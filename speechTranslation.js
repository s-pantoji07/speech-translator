const rapidApiKey = '80017b73b7msh0de171aed264825p1c3f76jsn813681a823d9';
const rapidApiHost = 'google-translate1.p.rapidapi.com';

// Function to initialize languages from the API
const initializeLanguages = async () => {
    try {
        const response = await fetch('https://google-translate1.p.rapidapi.com/language/translate/v2/languages', {
            method: 'GET',
            headers: {
                'x-rapidapi-host': rapidApiHost,
                'x-rapidapi-key': rapidApiKey,
                'Accept-Encoding': 'application/gzip'
            }
        });

        const data = await response.json();
        if (data && data.data && data.data.languages) {
            const languageMap = {
                "af": "Afrikaans", "sq": "Albanian", "am": "Amharic", "ar": "Arabic", "hy": "Armenian",
                "az": "Azerbaijani", "eu": "Basque", "be": "Belarusian", "bn": "Bengali", "bs": "Bosnian",
                "bg": "Bulgarian", "ca": "Catalan", "ceb": "Cebuano", "ny": "Chichewa", "zh-cn": "Chinese (Simplified)",
                "zh-tw": "Chinese (Traditional)", "co": "Corsican", "hr": "Croatian", "cs": "Czech", "da": "Danish",
                "nl": "Dutch", "en": "English", "eo": "Esperanto", "et": "Estonian", "tl": "Filipino",
                "fi": "Finnish", "fr": "French", "fy": "Frisian", "gl": "Galician", "ka": "Georgian",
                "de": "German", "el": "Greek", "gu": "Gujarati", "ht": "Haitian Creole", "ha": "Hausa",
                "haw": "Hawaiian", "iw": "Hebrew", "hi": "Hindi", "hmn": "Hmong", "hu": "Hungarian",
                "is": "Icelandic", "ig": "Igbo", "id": "Indonesian", "ga": "Irish", "it": "Italian",
                "ja": "Japanese", "jw": "Javanese", "kn": "Kannada", "kk": "Kazakh", "km": "Khmer",
                "ko": "Korean", "ku": "Kurdish (Kurmanji)", "ky": "Kyrgyz", "lo": "Lao", "la": "Latin",
                "lv": "Latvian", "lt": "Lithuanian", "lb": "Luxembourgish", "mk": "Macedonian", "mg": "Malagasy",
                "ms": "Malay", "ml": "Malayalam", "mt": "Maltese", "mi": "Maori", "mr": "Marathi",
                "mn": "Mongolian", "my": "Myanmar (Burmese)", "ne": "Nepali", "no": "Norwegian", "ps": "Pashto",
                "fa": "Persian", "pl": "Polish", "pt": "Portuguese", "pa": "Punjabi", "ro": "Romanian",
                "ru": "Russian", "sm": "Samoan", "gd": "Scots Gaelic", "sr": "Serbian", "st": "Sesotho",
                "sn": "Shona", "sd": "Sindhi", "si": "Sinhala", "sk": "Slovak", "sl": "Slovenian",
                "so": "Somali", "es": "Spanish", "su": "Sundanese", "sw": "Swahili", "sv": "Swedish",
                "tg": "Tajik", "ta": "Tamil", "te": "Telugu", "th": "Thai", "tr": "Turkish",
                "uk": "Ukrainian", "ur": "Urdu", "uz": "Uzbek", "vi": "Vietnamese", "cy": "Welsh",
                "xh": "Xhosa", "yi": "Yiddish", "yo": "Yoruba", "zu": "Zulu"
            };
            const languageDropdowns = [document.getElementById('inputLanguage'), document.getElementById('outputLanguage')];
            data.data.languages.forEach(language => {
                const languageName = languageMap[language.language] || language.language;
                languageDropdowns.forEach(dropdown => {
                    const option = document.createElement('option');
                    option.value = language.language;
                    option.text = `${languageName} (${language.language})`;
                    dropdown.appendChild(option);
                });
            });
        }
    } catch (error) {
        console.error('Error fetching languages:', error);
    }
};

// Call this function to initialize languages on page load
initializeLanguages();

// Function to start speech recognition
const startSpeechRecognition = () => {
    const inputLang = document.getElementById('inputLanguage').value;
    const outputLang = document.getElementById('outputLanguage').value;

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = inputLang || 'en-US';

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        document.getElementById('transcribedText').innerText = transcript;

        // Detect the language if not provided
        const detectedLang = inputLang || await detectLanguage(transcript);

        if (detectedLang) {
            document.getElementById('detectedLanguage').innerText = detectedLang.toUpperCase();
            translateText(transcript, detectedLang, outputLang);
        } else {
            document.getElementById('detectedLanguage').innerText = 'Could not detect language.';
        }
    };

    recognition.onerror = (event) => {
        console.error('Error occurred in recognition:', event.error);
    };

    recognition.start();
};

// Function to detect the language of the text
const detectLanguage = async (text) => {
    try {
        const response = await fetch('https://google-translate1.p.rapidapi.com/language/translate/v2/detect', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-rapidapi-host': rapidApiHost,
                'x-rapidapi-key': rapidApiKey,
                'Accept-Encoding': 'application/gzip'
            },
            body: new URLSearchParams({ q: text })
        });

        const data = await response.json();
        if (data && data.data && data.data.detections && data.data.detections[0][0]) {
            return data.data.detections[0][0].language;
        }
    } catch (error) {
        console.error('Error detecting language:', error);
    }
    return null;
};

// Function to translate text using Google Translate API via RapidAPI
const translateText = async (text, sourceLang, targetLang) => {
    try {
        const response = await fetch('https://google-translate1.p.rapidapi.com/language/translate/v2', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'x-rapidapi-host': rapidApiHost,
                'x-rapidapi-key': rapidApiKey,
                'Accept-Encoding': 'application/gzip'
            },
            body: new URLSearchParams({
                q: text,
                source: sourceLang,
                target: targetLang
            })
        });

        const data = await response.json();
        if (data && data.data && data.data.translations && data.data.translations[0]) {
            const translatedText = data.data.translations[0].translatedText;
            document.getElementById('translatedText').innerText = translatedText;
            
            // Speak the translated text
            speakText(translatedText, targetLang);
        } else {
            document.getElementById('translatedText').innerText = 'Translation Error.';
        }
    } catch (error) {
        console.error('Error translating text:', error);
        document.getElementById('translatedText').innerText = 'Translation Error.';
    }
};

// Function to vocalize the translated text
const speakText = (text, lang) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    synth.speak(utterance);
};
