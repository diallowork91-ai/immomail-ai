const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

app.post('/generer-email', async function(req, res) {
  var nom = req.body.nom;
  var bien = req.body.bien;
  var situation = req.body.situation;

  var message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: 'Tu es un expert immobilier. Redige un email professionnel pour un agent immobilier. Client: ' + nom + '. Bien: ' + bien + '. Situation: ' + situation + '. Maximum 5 lignes.'
    }]
  });

  res.json({ email: message.content[0].text });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
  console.log('Serveur demarre sur le port ' + PORT);
});