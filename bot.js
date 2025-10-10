// bot.js
import { TwitterApi } from 'twitter-api-v2';
import fetch from 'node-fetch';

// === CONFIG ===
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const TWITTER_APP_KEY = process.env.TWITTER_APP_KEY;
const TWITTER_APP_SECRET = process.env.TWITTER_APP_SECRET;
const TWITTER_ACCESS_TOKEN = process.env.TWITTER_ACCESS_TOKEN;
const TWITTER_ACCESS_SECRET = process.env.TWITTER_ACCESS_SECRET;

// === CLIENTES ===
const twitterClient = new TwitterApi({
  appKey: TWITTER_APP_KEY,
  appSecret: TWITTER_APP_SECRET,
  accessToken: TWITTER_ACCESS_TOKEN,
  accessSecret: TWITTER_ACCESS_SECRET,
});
const twitterRW = twitterClient.readWrite;

// === DÍA DE LA SEMANA ===
const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const hoy = dias[new Date().getDay()];

// === PROMPT DINÁMICO OPTIMIZADO ===
function obtenerPrompt() {
  const base = `Eres El Oráculo Diario, experto en numerología práctica. Crea contenido VIRAL que convierta seguidores en clientes. Resuelve problemas reales y al final menciona la carta numerológica. Tono natural, cercano, práctico. Máximo 260 caracteres por tweet. No uses asteriscos, negritas ni markdown.\n\n`;
  
  const prompts = [
    // LUNES - Patrones kármicos
    `Hilo: "Los patrones kármicos en tu fecha de nacimiento"
     Tweet 1: Pregunta hook: "¿Siempre tropiezas con la misma piedra en el amor/trabajo?"
     Tweet 2: Explica que son patrones kármicos según números de nacimiento
     Tweet 3: Ejemplo concreto: Nacido día 16 (1+6=7) = busca respuestas internas
     Tweet 4: "Tu carta numerológica muestra TU patrón específico y cómo sanarlo"
     Incluir CTA natural al final`,

    // MARTES - Propósito de vida  
    `Hilo: "Tu número de destino y tu misión en la vida"
     Tweet 1: "Todos tenemos un propósito. Tu fecha nacimiento lo revela"
     Tweet 2: Cómo calcular número destino (ejemplo simple: día+mes+año)
     Tweet 3: Ejemplo: Número 11 = maestro espiritual, número 8 = líder empresarial
     Tweet 4: "¿Listo para descubrir TU misión exacta?" + CTA suave`,

    // MIÉRCOLES - Relaciones y compatibilidad
    `Hilo: "Tu número personal determina qué parejas atraes"
     Tweet 1: "¿Atraes siempre el mismo tipo de persona problemática?"
     Tweet 2: Explica compatibilidad numérica básica
     Tweet 3: Ejemplo: Número 5 atrae aventureros, número 4 atrae estables
     Tweet 4: "Descubre tu compatibilidad ideal en tu carta numerológica" + CTA`,

    // JUEVES - Dinero y abundancia
    `Hilo: "El bloqueo económico oculto en tus números"
     Tweet 1: "¿El dinero se te escapa? Tu número personal tiene la respuesta"
     Tweet 2: Conexión números-vibración-abundancia
     Tweet 3: Ejemplo: Número 3 bloqueado = no monetiza su creatividad
     Tweet 4: "Tu carta revela TU bloqueo económico y cómo solucionarlo" + CTA`,

    // VIERNES - Caso práctico/interactivo
    `Hilo interactivo: "Responde y analizo tu energía actual"
     Tweet 1: Pregunta 1: "¿Naciste día par o impar?"
     Tweet 2: Pregunta 2: "¿Tu mes nacimiento es <6 o >6?"
     Tweet 3: Pregunta 3: "¿Prefieres salir o quedarte en casa?"
     Tweet 4: Análisis breve basado en respuestas + "Para análisis EXACTO, tu carta personalizada..."`,

    // SÁBADO - Salud y energía  
    `Hilo: "Tu número de vida y tu energía vital"
     Tweet 1: "Tu energía tiene un ritmo numérico específico"
     Tweet 2: Cómo tu número afecta tu salud y vitalidad
     Tweet 3: Ejemplo: Número 1 = energía de liderazgo, necesita movimiento
     Tweet 4: "Alinea tu vida con tu energía natural" + CTA`,

    // DOMINGO - Testimonio + futuro ecosistema
    `Hilo: "Cómo María descubrió por qué siempre tenía los mismos problemas"
     Tweet 1: Presenta problema común (ej: relaciones, trabajo, dinero)
     Tweet 2: Su carta numerológica reveló el patrón oculto
     Tweet 3: Cómo aplicó la solución y cambió su vida
     Tweet 4: "Tu turno. Descubre TU patrón oculto" + CTA`
  ];

  return base + prompts[new Date().getDay()];
}

// === LLAMADA A GEMINI ===
async function generarContenido() {
  const prompt = obtenerPrompt();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (data.error) {
    console.error('❌ Gemini error:', data.error);
    throw new Error(`Gemini API error: ${data.error.message}`);
  }
  
  return data.candidates[0].content.parts[0].text;
}

// === PUBLICAR EN X ===
async function publicarHilo(texto) {
  // Divide por líneas que empiezan con número o emoji
  const tweets = texto
    .split(/\n+/)
    .map(t => t.trim())
    .filter(t => t.length > 10);

  let firstTweet;
  for (let i = 0; i < tweets.length; i++) {
    const t = tweets[i];
    // Asegurar que no pase de 280 caracteres
    const tweet = t.length > 270 ? t.substring(0, 270) + '...' : t;

    try {
      if (i === 0) {
        firstTweet = await twitterRW.v2.tweet(tweet);
        console.log('✅ Inicio:', tweet);
      } else {
        await twitterRW.v2.reply(tweet, firstTweet.data.id);
        console.log('✅ Reply:', tweet);
      }
      await new Promise(resolve => setTimeout(resolve, 1000)); // 1s entre tweets
    } catch (err) {
      console.error('❌ Error tweet:', err.message);
    }
  }

  // AÑADIR TWEET FINAL CON CTA MEJORADO
  try {
    const tweetFinal = `✨ ¿Quieres tu análisis COMPLETO y personalizado? 
Tu Carta Numerológica revela:
• Tu propósito de alma
• Tus patrones kármicos 
• Tu camino de vida exacto

👉 Obténla aquí: eloraculodiario.novaproflow.com

#Numerologia #Propósito #CrecimientoPersonal`;

    await twitterRW.v2.reply(tweetFinal, firstTweet.data.id);
    console.log('✅ CTA final añadido');
  } catch (err) {
    console.error('❌ Error CTA final:', err.message);
  }
}

// === EJECUCIÓN ===
async function main() {
  console.log(`📅 Hoy es ${hoy}. Generando contenido...`);
  try {
    const respuesta = await generarContenido();
    console.log('🧠 Gemini respondió');
    await publicarHilo(respuesta);
    console.log('✅ Publicación completa');
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

main();
