import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';

const app = express();
const PORT: number = parseInt(process.env.PORT || '3000', 10);

app.use(bodyParser.json());

// Interface para o hemograma (Observation FHIR)
interface HemogramaObservation {
  resourceType: string;
  id?: string;
  status: string;
  category?: Array<{
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  }>;
  code: {
    coding: Array<{
      system: string;
      code: string;
      display: string;
    }>;
  };
  subject?: {
    reference: string;
  };
  effectiveDateTime?: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  component?: Array<{
    code: {
      coding: Array<{
        system: string;
        code: string;
        display: string;
      }>;
    };
    valueQuantity?: {
      value: number;
      unit: string;
      system: string;
      code: string;
    };
  }>;
}

// Endpoint para enviar hemogramas (Observation) para o servidor HAPI FHIR
app.post('/fhir/observation', (req: Request, res: Response) => {
  const observation: HemogramaObservation = req.body;
  
  // Validação básica
  if (!observation.resourceType || observation.resourceType !== 'Observation') {
    return res.status(400).json({ 
      error: 'Invalid resource type. Expected Observation.' 
    });
  }

  // Log do hemograma recebido
  console.log('Hemograma recebido:', JSON.stringify(observation, null, 2));
  
  // TODO: Add lógica de parsing e validação específica para hemogramas
  // TODO: Implementar envio para HAPI FHIR server
  
  res.status(200).json({ 
    message: 'Hemograma recebido com sucesso',
    id: observation.id || 'generated-id'
  });
});

app.put('/fhir-webhook/Bundle/:id', async (req: Request, res: Response) => {
  const bundleId = req.params.id;

  console.log('Webhook received Bundle ID:', bundleId);

  try {
    // Fetch the full Bundle from the FHIR server
    const fhirUrl = `http://localhost:8080/fhir/Bundle/${bundleId}`;
    const response = await fetch(fhirUrl, {
      headers: { 'Accept': 'application/fhir+json' },
    });

    if (!response.ok) {
      console.error(`Failed to fetch Bundle ${bundleId}:`, response.statusText);
      return res.status(500).json({
        resourceType: 'OperationOutcome',
        issue: [{
          severity: 'error',
          code: 'processing',
          diagnostics: `Failed to fetch Bundle ${bundleId}`,
        }],
      });
    }

    const bundle = await response.json();
    console.log('Fetched full Bundle:', JSON.stringify(bundle, null, 2));

    // Respond to HAPI to acknowledge receipt
    res.status(200).json({
      resourceType: 'OperationOutcome',
      issue: [
        {
          severity: 'information',
          code: 'informational',
          diagnostics: 'Bundle received and fetched successfully',
        },
      ],
    });
  } catch (err) {
    console.error('Error fetching Bundle:', err);
    res.status(500).json({
      resourceType: 'OperationOutcome',
      issue: [{
        severity: 'error',
        code: 'exception',
        diagnostics: String(err),
      }],
    });
  }
});

app.get('/', (req: Request, res: Response) => {
  res.json({ 
    message: 'Receptor FHIR ativo.',
    version: '1.0.0',
    endpoints: {
      'POST /fhir/observation': 'Recebe hemogramas (Observation FHIR)',
      'GET /': 'Status do servidor'
    }
  });
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Health check disponível em: http://localhost:${PORT}/health`);
});

// Endpoint para enviar hemograma ao HAPI FHIR (comentado - para implementação futura)
/*
app.post('/enviar-hemograma', async (req: Request, res: Response) => {
  const observation: HemogramaObservation = req.body;

  try {
    const response = await fetch('http://localhost:8080/fhir/Observation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/fhir+json' },
      body: JSON.stringify(observation)
    });

    const result = await response.json();
    res.status(response.status).json(result);
  } catch (err) {
    console.error('Erro ao enviar hemograma:', err);
    res.status(500).json({ error: 'Erro ao enviar hemograma' });
  }
});
*/ 
