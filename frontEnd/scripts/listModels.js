import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

async function listModels() {
  try {
    let result = null;
    if (ai.models && typeof ai.models.listModels === 'function') {
      result = await ai.models.listModels();
    } else if (ai.models && typeof ai.models.list === 'function') {
      result = await ai.models.list();
    } else if (typeof ai.listModels === 'function') {
      result = await ai.listModels();
    } else {
      throw new Error('No list method found on SDK instance');
    }

    console.log('Models response:');
    console.log(JSON.stringify(result, null, 2));

    // Try to normalize and print model IDs and supported methods
    const entries = [];
    const data = result?.models || result?.data || result;
    if (Array.isArray(data)) {
      for (const m of data) {
        const id = m.name || m.model || m.id || m?.modelId || JSON.stringify(m);
        const features = m?.supportedMethods || m?.methods || m?.capabilities || null;
        entries.push({ id, features });
      }
    }
    if (entries.length) {
      console.log('\nAvailable models (brief):');
      for (const e of entries) {
        console.log('-', e.id, e.features ? `| features: ${JSON.stringify(e.features)}` : '');
      }
    }

    process.exit(0);
  } catch (err) {
    console.error('Failed to list models:', err);
    process.exit(1);
  }
}

listModels();
