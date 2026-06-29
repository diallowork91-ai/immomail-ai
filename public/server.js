const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
require('dotenv').config();
const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  keyFile: 'credentials.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets']
});

const SHEET_ID = '1M_ya2RW6tooonQLanZ6-LE3suj6EKRpkwjCpCdUaxKI';

async function ajouterDansSheets(nom, email) {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: 'Sheet1!A:E',
    valueInputOption: 'RAW',
    resource: {
      values: [[new Date().toLocaleDateString('fr-FR'), nom, '', email, 'Généré']]
    }
  });
}
const app = express();
let compteur = { emails: 0 };
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

  compteur.emails++;
var emailText = message.content[0].text;
ajouterDansSheets(nom, bien + ' - ' + situation).catch(console.error);
res.json({ email: emailText });

app.get('/stats', function(req, res) {
  res.json({ emails_generes: compteur.emails });
});
app.listen(3000, function() {
  console.log('Serveur demarre sur le port 3000');
});