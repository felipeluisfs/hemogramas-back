import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// Endpoint para enviar hemogramas (Observation) para o servidor HAPI FHIR
app.post('/fhir/observation', (req, res) => {
  const observation = req.body;
  // Add lógica de parsing ?
  console.log('Hemograma recebido:', JSON.stringify(observation, null, 2));
  res.status(200).send('Recebido');
});

app.get('/', (req, res) => {
  res.send('Receptor FHIR ativo.');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Endpoint para enviar hemograma ao HAPI FHIR
/*app.post('/enviar-hemograma', async (req, res) => {
  const observation = req.body;

  try {
    const response = await fetch('http://localhost:8080/fhir/Observation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/fhir+json' },
      body: JSON.stringify(observation)
    });

    const result = await response.json();
    res.status(response.status).json(result);
  } catch (err) {
    res.status(500).send('Erro ao enviar hemograma');
  }
});*/
