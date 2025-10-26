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
  
// === CONFIGURACIÓN MEJORADA ===
const config = {
  hashtags: ['#Numerologia', '#CartasNumerológicas', '#CrecimientoPersonal', '#Alma'],
  horarios: ['09:00', '12:00', '18:00', '21:00'], // Mayor frecuencia
  interaccionesDiarias: 15, // Límite seguro
  maxSeguimientosDia: 45 // MUY IMPORTANTE
};

// === PROMPTS MEJORADOS - MÁS VIRALES ===
function obtenerPromptMejorado() {
  const prompts = [
    // LUNES - Problema/Solución
    `Hilo VIRAL formato problema/solución:
     Tweet 1: "¿Sientes que repites los mismos errores? ⚠️ Esto es por qué..."
     Tweet 2: "Tu fecha nacimiento crea patrones kármicos que determinan tus relaciones, dinero y salud"
     Tweet 3: "Ejemplo: nacido día 7 = buscador espiritual, si no lo expresa → frustración constante"
     Tweet 4: "La solución: Identificar TU patrón exacto y reprogramarlo"
     Tweet 5: CTA: "Mi carta numerológica personalizada revela tu patrón único + solución práctica. 20€. 👇 [LINK]"`,

    // MARTES - Caso de éxito
    `Hilo formato caso éxito:
     Tweet 1: "María siempre atraía parejas emocionalmente no disponibles ❌"
     Tweet 2: "Su carta reveló: número kármico 16 → tendencia a rescatar a otros"
     Tweet 3: "Al aplicar las recomendaciones específicas de su carta..."
     Tweet 4: "¡En 3 meses conoció a su actual pareja! ✅"
     Tweet 5: CTA: "¿Listo para tu transformación? Pide tu carta: [LINK]"`,

    // MIÉRCOLES - Pregunta interactiva
    `Hilo interactivo:
     Tweet 1: "Responde SÍ o NO: ¿Sientes que no estás viviendo tu propósito real?"
     Tweet 2: "Esto es porque tu número de destino (calculado con tu fecha nacimiento) no está alineado"
     Tweet 3: "Ejemplo: Número destino 3 = creador, si trabajas en oficina → infelicidad"
     Tweet 4: "Tu carta numerológica te dice EXACTAMENTE tu propósito y cómo alcanzarlo"
     Tweet 5: CTA: "Descúbrelo aquí: [LINK] + 👇 Comenta 'SÍ' y te ayudo gratis"`,

    // JUEVES - Urgencia
    `Hilo con urgencia:
     Tweet 1: "ATENCIÓN: Estos 3 números en tu carta indican bloqueos económicos 🚨"
     Tweet 2: "Número 4 mal aspectado = dificultad para mantener empleo"
     Tweet 3: "Número 8 débil = dinero que se escapa"
     Tweet 4: "Número 2 en conflicto = no pides aumento por miedo"
     Tweet 5: CTA: "¡Solo 5 cartas disponibles esta semana! Reserva ahora: [LINK]"`,

    // VIERNES - Testimonio visual
    `Hilo testimonial:
     Tweet 1: "Carlos pasó de ganar 1.200€ a 3.500€/mes después de su carta 📈"
     Tweet 2: "Su carta reveló: número 8 de abundancia bloqueado por creencia familiar"
     Tweet 3: "Al aplicar la técnica específica para su número..."
     Tweet 4: "¡Consiguió aumento + empezó side business exitoso!"
     Tweet 5: CTA: "Transforma tu realidad. Tu carta personalizada: [LINK]"`
  ];
  return prompts[new Date().getDay()];
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
