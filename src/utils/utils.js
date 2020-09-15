const axios = require('axios');

const axiosSentiInstance = axios.create({
    baseURL: `${process.env.URL_SENTI_API}:9443`,
    crossdomain: true,
    headers: {
        Authorization: `Basic ${process.env.TOKEN_SENTI_API}`,
        'Content-Type': 'application/json'
    }
});

const formatDate = (timestamp) => {
    let formatedDate = {
        date: '',
        time: ''
    }

    try {
        let epoch = Number.parseInt(timestamp);
        let date = new Date(0);
        date.setUTCSeconds(epoch);

        let day = (''+date.getUTCDate()).length == 1 ? '0' + date.getUTCDate() : date.getUTCDate();
        let month = (''+date.getUTCMonth()).length == 1 ?  '0' + date.getUTCMonth(): date.getUTCMonth();

        formatedDate.date = `${date.getUTCFullYear()}-${month}-${day}`;
        formatedDate.time = `${date.getHours()}:${date.getMinutes()}`;
    } catch (err) {
        console.log('Error en el formateo de timestamp');
    }

    return formatedDate;
}

const handleRestErrors = (error) => {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('ERROR RESPONSE DATA ', error.response.data);
        console.log('ERROR RESPONSE STATUS ', error.response.status);
        console.log('ERROR RESPONSE HEADERS ', error.response.headers);
    } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
    } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
    }
}

const sleep = (milliseconds) => new Promise(callback => setTimeout(callback, milliseconds));

const sendToLogstash = async (postObj) => {
    if (process.env.ENVIRONMENT == 'production') {
        axiosSentiInstance.post('/', postObj).then(() => {
            console.log('Objeto enviado correctamente a logstash');
        }).catch( async (err) => {
            //console.log('Error al enviar post al análisis de sentimiento ' + err);
            await sleep(10);
            sendToLogstash(postObj);
            //handleRestErrors( err );
        });
    } else {
        console.log(
            'The Object sent to Sentiment would have been: ',
            JSON.stringify(postObj)
        );
    }
}

module.exports = {
    sendToLogstash,
    formatDate
}