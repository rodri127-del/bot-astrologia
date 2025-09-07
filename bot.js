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

// === PROMPT DINÁMICO ===
function obtenerPrompt() {
  const base = `Hoy es ${hoy}. Eres un experto en esoterismo y comunicación en redes. Escribe un hilo claro, emocional y natural, listo para publicar en X. No uses asteriscos, negritas ni markdown. Máximo 260 caracteres por tweet.\n\n`;
  
  if (hoy === 'Lunes') {
    return base + `Escribe un horóscopo diario para los 12 signos del zodíaco. Un tweet por signo. Usa un tono místico y empoderador. Incluye emojis. Ejemplo: "♈ ARIES\nHoy el fuego interno te impulsa a actuar. Ideal para empezar algo nuevo."`;
  }
  
  if (hoy === 'Martes') {
    return base + `Hoy es día de numerología. Escribe un hilo de 5 tweets sobre el número del día: qué significa, cómo afecta, ejemplos. Tonos: profundo, práctico. Ejemplo: "🔢 Hoy el número 7 domina la energía. Es momento de introspección y búsqueda de respuestas."`;
  }
  
  if (hoy === 'Miércoles') {
    return base + `Hoy es día de Kabbalah. Escribe un hilo de 3 tweets sobre la letra hebrea del día: su vibración, significado espiritual, cómo aplicarla. Ejemplo: "🪄 Hoy la letra "ג" (Guimel) está activa. Simboliza el avance y la recompensa silenciosa."`;
  }
  
  if (hoy === 'Jueves') {
    return base + `Hoy es día del Nombre. Escribe un hilo de 4 tweets: cómo el nombre influye en el destino, cómo calcular la vibración, ejemplo práctico. Ejemplo: "Tu nombre no es casualidad. Cada letra vibra y atrae una energía específica. Hoy, la 'M' activa el poder creativo."`;
  }
  
  if (hoy === 'Viernes') {
    return base + `Hoy es consejo astrológico. Escribe un hilo de 3 tweets con un consejo profundo basado en la energía cósmica actual. Puede ser sobre relaciones, dinero o propósito. Ejemplo: "✨ Hoy el cosmos te dice: no fuerces. Confía. Tu momento llegará cuando dejes de buscarlo."`;
  }
  
  if (hoy === 'Sábado') {
    return base + `Hoy es test rápido. Escribe un hilo de 4 tweets: pregunta 3 cosas al usuario (ej: fecha nacimiento, inicial nombre) y al final dile su "número de poder". Que sea interactivo y mágico. Ejemplo: "¿Naciste en año par o impar? ¿Tu nombre empieza con vocal o consonante? Responde y te digo tu número de poder."`;
  }
  
  if (hoy === 'Domingo') {
    return base + `Hoy es testimonio. Escribe un hilo de 4 tweets como si fuera un cliente real que recibió su carta de @ElOraculoDiario. Usa un tono emocional y realista. Ejemplo: "Hoy recibí mi carta numerológica de @ElOraculoDiario y fue un antes y un después. Descubrí que mi número de vida es el 7, y todo encajó."`;
  }
  
  // Por defecto
  return base + `Escribe un mensaje sobre autoconocimiento espiritual, 3 tweets, tono cálido y profundo.`;
}

// === LLAMADA A GEMINI ===
async function generarContenido() {
  const prompt = obtenerPrompt();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  
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
  // Divide por líneas que empiezan con número o emoji (ej: "1.", "♈")
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
