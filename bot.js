// bot.js - VERSIÓN COMPLETA Y SEGURA (HILOS + RT + REPLIES TIRADA GRATIS)
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

// === CONFIGURACIÓN TIRADA GRATIS ===
const POST_FIJO_ID = '1986511491785461979'; // ← CAMBIA POR EL ID REAL DE TU POST FIJADO
const TIRADA_URL = 'https://eloraculodiario.novaproflow.com/tirada/';
const MI_USER_ID = '1964715530348306432';

// === DÍA DE LA SEMANA ===
const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const hoy = dias[new Date().getDay()];

// === CONFIGURACIÓN PARA 4 PUBLICACIONES DIARIAS ===
const config = {
  hashtags: ['#Numerologia', '#CartasNumerológicas', '#CrecimientoPersonal', '#Alma'],
  publicacionesPorDia: 4,
  interaccionesDiarias: 15,
  maxSeguimientosDia: 45,
  horarios: ['09:00', '12:00', '15:00', '18:00']
};

// === PROMPTS MEJORADOS - 4 VARIACIONES POR DÍA ===
function obtenerPrompt(numeroPublicacion) {
  const dia = new Date().getDay();
  
  const promptsBase = [
    // LUNES - Problema/Solución
    `Hilo VIRAL formato problema/solución:
     Tweet 1: "¿Sientes que repites los mismos errores? Esto es por qué..."
     Tweet 2: "Tu fecha nacimiento crea patrones kármicos que determinan tus relaciones, dinero y salud"
     Tweet 3: "Ejemplo: nacido día 7 = buscador espiritual, si no lo expresa → frustración constante"
     Tweet 4: "La solución: Identificar TU patrón exacto y reprogramarlo"
     Tweet 5: CTA: "Mi carta numerológica personalizada revela tu patrón único + solución práctica. 25€. [LINK]"`,

    // MARTES - Caso de éxito
    `Hilo formato caso éxito:
     Tweet 1: "María siempre atraía parejas emocionalmente no disponibles"
     Tweet 2: "Su carta reveló: número kármico 16 → tendencia a rescatar a otros"
     Tweet 3: "Al aplicar las recomendaciones específicas de su carta..."
     Tweet 4: "¡En 3 meses conoció a su actual pareja!"
     Tweet 5: CTA: "¿Listo para tu transformación? Pide tu carta: [LINK]"`,

    // MIÉRCOLES - Pregunta interactiva
    `Hilo interactivo:
     Tweet 1: "Responde SÍ o NO: ¿Sientes que no estás viviendo tu propósito real?"
     Tweet 2: "Esto es porque tu número de destino (calculado con tu fecha nacimiento) no está alineado"
     Tweet 3: "Ejemplo: Número destino 3 = creador, si trabajas en oficina → infelicidad"
     Tweet 4: "Tu carta numerológica te dice EXACTAMENTE tu propósito y cómo alcanzarlo"
     Tweet 5: CTA: "Descúbrelo aquí: [LINK] + Comenta 'SÍ' y te ayudo gratis"`,

    // JUEVES - Urgencia
    `Hilo con urgencia:
     Tweet 1: "ATENCIÓN: Estos 3 números en tu carta indican bloqueos económicos"
     Tweet 2: "Número 4 mal aspectado = dificultad para mantener empleo"
     Tweet 3: "Número 8 débil = dinero que se escapa"
     Tweet 4: "Número 2 en conflicto = no pides aumento por miedo"
     Tweet 5: CTA: "¡Solo 5 cartas disponibles esta semana! Reserva ahora: [LINK]"`,

    // VIERNES - Testimonio visual
    `Hilo testimonial:
     Tweet 1: "Carlos pasó de ganar 1.200€ a 3.500€/mes después de su carta"
     Tweet 2: "Su carta reveló: número 8 de abundancia bloqueado por creencia familiar"
     Tweet 3: "Al aplicar la técnica específica para su número..."
     Tweet 4: "¡Consiguió aumento + empezó side business exitoso!"
     Tweet 5: CTA: "Transforma tu realidad. Tu carta personalizada: [LINK]"`,

    // SÁBADO - Testimonio espiritual
    `Hilo testimonial espiritual:
     Tweet 1: "Ana sentía vacío existencial a pesar de tenerlo todo..."
     Tweet 2: "Su carta numerológica mostró: alma vieja con misión de servicio"
     Tweet 3: "Al seguir su camino numérico específico..."
     Tweet 4: "¡Encontró paz interior y propósito real!"
     Tweet 5: CTA: "Encuentra tu paz interior. Tu carta personalizada: [LINK]"`,

    // DOMINGO - Resumen semanal
    `Hilo resumen:
     Tweet 1: "Esta semana ayudé a 7 personas a descubrir sus patrones kármicos"
     Tweet 2: "Problemas comunes: bloqueos económicos, relaciones repetitivas, falta de propósito"
     Tweet 3: "La solución SIEMPRE fue la misma: entender su código numérico personal"
     Tweet 4: "Tu también puedes transformar tu vida"
     Tweet 5: CTA: "Empieza tu transformación. Pide tu carta: [LINK]"`
  ];

  const variaciones = [
    "", 
    "\n\nENFÓCATE EN: Contar una historia personal tuya o de un cliente real. Usa datos específicos y emociones.",
    "\n\nENFÓCATE EN: Hacer preguntas interactivas. Involucra a la audiencia pidiendo su opinión o experiencia.",
    "\n\nENFÓCATE EN: Dar consejos prácticos y accionables. Que la gente pueda aplicar algo inmediatamente."
  ];

  const promptBase = promptsBase[dia];
  const variacion = variaciones[numeroPublicacion] || variaciones[0];
  
  return promptBase + variacion;
}

// === PROMPT BASE MEJORADO ===
const PROMPT_BASE = `Eres El Oráculo Diario, experto en numerología práctica. 

OBJETIVO PRINCIPAL: Generar engagement y conversaciones, NO solo ventas directas.

REGLAS ESTRICTAS:
1. Tono: Cercano, personal, como amigo que cuenta su experiencia
2. Siempre incluir storytelling o casos reales
3. CTAs suaves: "te ayudo", "comenta", "DM" - NO "compra"
4. Máximo 260 caracteres por tweet
5. No uses negritas, asteriscos ni markdown
6. Incluir [LINK] SOLO en el último tweet
7. Generar CURIOSIDAD, no desesperación

INSTRUCCIONES ESPECÍFICAS:
`;

// === LLAMADA A GEMINI ===
async function generarContenido(promptEspecifico) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  
  const body = {
    contents: [
      {
        role: "user",
        parts: [{ text: PROMPT_BASE + promptEspecifico }]
      }
    ]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (data.error) throw new Error(`Gemini API error: ${data.error.message}`);
  
  return data.candidates[0].content.parts[0].text;
}

// === PUBLICAR HILO ===
async function publicarHilo(texto) {
  const tweets = texto
    .split(/\n(?=\d+|•|👉|¡|¿|[-—])/)
    .map(t => t.trim())
    .filter(t => t.length > 20 && !t.includes('Hilo') && !t.includes('Tweet'));

  if (tweets.length === 0) throw new Error('No se pudieron extraer tweets');

  let firstTweet;
  for (let i = 0; i < tweets.length; i++) {
    let tweet = tweets[i];
    if (tweet.length > 270) tweet = tweet.substring(0, 267) + '...';
    
    const tweetFinal = i === tweets.length - 1 ? 
      tweet.replace('[LINK]', 'eloraculodiario.novaproflow.com') : 
      tweet.replace('[LINK]', '');

    try {
      if (i === 0) {
        firstTweet = await twitterRW.v2.tweet(tweetFinal);
        console.log('Tweet 1 publicado');
      } else {
        await twitterRW.v2.reply(tweetFinal, firstTweet.data.id);
        console.log(`Tweet ${i + 1} publicado`);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error('Error publicando:', err.message);
      throw err;
    }
  }

  // CTA FINAL
  try {
    const cta = `¿Te resuena algo de esto? 

Si sientes que hay patrones que se repiten en tu vida, puedo ayudarte a entender el POR QUÉ y el CÓMO cambiarlo.

Tu carta numerológica es el mapa para tu transformación.

Hablamos? eloraculodiario.novaproflow.com

#Numerologia #Transformación`;
    await twitterRW.v2.reply(cta, firstTweet.data.id);
  } catch (err) {
    console.error('Error CTA final:', err.message);
  }

  return firstTweet.data.id;
}

// === INTERACCIÓN ESTRATÉGICA ===
async function interaccionSegura() {
  const queries = [
    'bloqueos económicos OR "dinero se escapa" -filter:retweets',
    'propósito de vida OR "qué hago con mi vida" -filter:retweets', 
    'patrones repetitivos OR "siempre lo mismo" -filter:retweets',
    'numerología OR carta numerológica -filter:retweets'
  ];
  
  const query = queries[Math.floor(Math.random() * queries.length)];
  
  try {
    const searchResult = await twitterRW.v2.search(query, {
      max_results: 8,
      'tweet.fields': 'public_metrics,author_id'
    });
    
    if (!searchResult.data) return;

    let interacciones = 0;
    for (const tweet of searchResult.data) {
      if (interacciones >= config.interaccionesDiarias) break;
      if (tweet.public_metrics.like_count > 2 && tweet.author_id !== MI_USER_ID) {
        try {
          await twitterRW.v2.like(MI_USER_ID, tweet.id);
          const respuestas = [
            `Justo estaba pensando en esto! En numerología, esto suele relacionarse con el número ${Math.floor(Math.random()*9)+1}. ¿Te suena?`,
            `Interesante reflexión. Desde la perspectiva numerológica, esto tiene mucho que ver con nuestros patrones kármicos.`,
            `Completamente de acuerdo. He visto este patrón muchas veces en las cartas numerológicas que hago.`,
            `¿Has observado si esto sigue algún ciclo en tu vida? En numerología podemos identificar esos patrones.`
          ];
          const respuesta = respuestas[Math.floor(Math.random()*respuestas.length)];
          await twitterRW.v2.reply(respuesta, tweet.id);
          interacciones++;
          await new Promise(resolve => setTimeout(resolve, 120000));
        } catch (err) {}
      }
    }
  } catch (err) {}
}

// === NUEVO: RT DEL POST FIJO (1 vez al día) ===
async function retuitearPostFijo() {
  const hoy = new Date().toISOString().split('T')[0];
  const clave = `rt_${hoy}`;
  if (localStorage.getItem(clave)) return;

  try {
    await twitterRW.v2.retweet(MI_USER_ID, POST_FIJO_ID);
    localStorage.setItem(clave, 'true');
    console.log('RT del post fijo hecho hoy');
  } catch (err) {
    if (err.code !== 327) console.error('Error RT:', err.message);
  }
}

// === NUEVO: PROCESAR REPLIES TIRADA GRATIS ===
async function procesarReplies() {
  console.log('Buscando replies al post fijo...');
  try {
    const replies = await twitterRW.v2.searchAll({
      query: `in_reply_to_tweet_id:${POST_FIJO_ID} -from:${MI_USER_ID}`,
      max_results: 20,
      'tweet.fields': 'author_id'
    });

    if (!replies.data) return;

    for (const reply of replies.data) {
      const texto = reply.text.toLowerCase();
      const match = texto.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s*[\+\-\:]\s*([a-zA-Záéíóúñ]+)/);
      if (!match) continue;

      const fecha = match[1].replace(/-/g, '/');
      const temaRaw = match[2];
      const temaMap = {
        dinero: 'dinero', amor: 'amor', proposito: 'proposito', propósito: 'proposito',
        tarot: 'tarot', oráculo: 'oraculo', oraculo: 'oraculo',
        numerologia: 'numerologia', numerología: 'numerologia',
        astrologia: 'astrologica', astrología: 'astrologica',
        cabala: 'cabala', cábala: 'cabala'
      };
      const tema = temaMap[temaRaw] || 'oraculo';

      let nombre = 'Amigo/a';
      try {
        const user = await twitterRW.v2.user(reply.author_id);
        nombre = user.data.name.split(' ')[0];
      } catch {}

      const link = `${TIRADA_URL}?nombre=${encodeURIComponent(nombre)}&fecha=${fecha}&tema=${tema}`;
      const respuesta = `¡Hola ${nombre}! Tu tirada GRATIS está lista\n\n${link}\n\n+ ritual exprés en <10 seg\n\n#TiradaGratis`;

      try {
        await twitterRW.v2.reply(respuesta, reply.id);
        console.log(`Respondido: ${fecha} + ${tema}`);
        await new Promise(r => setTimeout(r, 3000));
      } catch (err) {
        console.error('Error reply:', err.message);
      }
    }
  } catch (err) {
    console.error('Error replies:', err);
  }
}

// === MAIN: 4 HILOS DIARIOS (solo 1 vez al día) ===
async function main() {
  const hoy = new Date().toISOString().split('T')[0];
  if (localStorage.getItem(`hilos_${hoy}`)) return;

  for (let i = 0; i < config.publicacionesPorDia; i++) {
    const prompt = obtenerPrompt(i);
    const contenido = await generarContenido(prompt);
    await publicarHilo(contenido);
    if (i < 3) await new Promise(r => setTimeout(r, 3 * 60 * 60 * 1000)); // 3h entre hilos
  }
  localStorage.setItem(`hilos_${hoy}`, 'true');
}

// === BUCLE PRINCIPAL (ejecuta cada hora) ===
async function cicloCompleto() {
  const hora = new Date().getHours();
  console.log(`\nCICLO - ${new Date().toLocaleString('es-ES')} - Hora: ${hora}`);

  // 1. RT del post fijo (1 vez al día)
  await retuitearPostFijo();

  // 2. Procesar replies (cada hora)
  await procesarReplies();

  // 3. Hilos diarios (solo a las 9:00)
  if (hora === 9) await main();

  // 4. Interacciones (solo a las 12:00)
  if (hora === 12) await interaccionSegura();

  setTimeout(cicloCompleto, 60 * 60 * 1000);
}

// === INICIAR ===
cicloCompleto();
