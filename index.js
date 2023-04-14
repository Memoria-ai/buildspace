const express = require('express');
const cors = require('cors');
const axios = require('axios');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
const port = 8000;

app.use(cors()); // Add this line to enable CORS
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/gpt', async (req, res) => {
    const { message, max_tokens } = req.body;
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: "gpt-3.5-turbo",
        messages: [{role:'system', content:message}],
        max_tokens: max_tokens,
        n: 1,
    }, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': "Bearer " + process.env.REACT_APP_GPT_PRIVATE_KEY
        }
    });
    // console.log(response.data)
    // console.log(response)
    console.log(response.data.choices[0].message.content)

    return res.json(response.data.choices[0].message.content);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});