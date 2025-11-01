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

// === CONFIGURACIÓN MEJORADA ===
const config = {
  hashtags: ['#Numerologia', '#CartasNumerológicas', '#CrecimientoPersonal', '#Alma'],
  horarios: ['09:00', '12:00', '18:00', '21:00'],
  interaccionesDiarias: 15,
  maxSeguimientosDia: 45
};

// === PROMPTS MEJORADOS - CONVERSIÓN REAL ===
function obtenerPrompt() {
  const prompts = [
    // LUNES - Storytelling con transformación
    `Hilo VIRAL con storytelling:
     Tweet 1: "¿Sientes que el dinero se te escapa como el agua? Yo estaba igual hasta que descubrí esto..."
     Tweet 2: "Mi número kármico 8 estaba bloqueado. Ganaba 1.200€ y vivía con ansiedad constante"
     Tweet 3: "Al aplicar la técnica específica para mi número, en 3 meses mis ingresos se triplicaron"
     Tweet 4: "La clave estaba en identificar MI patrón exacto y reprogramarlo"
     Tweet 5: CTA: "¿Quieres saber QUÉ número te bloquea a TI? Te ayudo gratis ↓ [LINK]"`,

    // MARTES - Caso real con datos específicos
    `Hilo caso REAL con datos:
     Tweet 1: "Mi cliente Javier pasó de 0 entrevistas a 3 ofertas en 1 mes ¿Cómo?"
     Tweet 2: "Su carta reveló número 4 bloqueado = patrón de auto-sabotaje laboral"
     Tweet 3: "Aplicamos la técnica de alineación numérica específica para su caso"
     Tweet 4: "Resultado: 2ª entrevista → contrato indefinido + 30% más sueldo"
     Tweet 5: CTA: "Comenta 'SÍ' y te digo qué número revisar primero + [LINK]"`,

    // MIÉRCOLES - Pregunta que genera comunidad
    `Hilo comunitario:
     Tweet 1: "¿En qué área sientes más bloqueos? 👇"
     Tweet 2: "1️⃣ Dinero - 2️⃣ Amor - 3️⃣ Trabajo - 4️⃣ Propósito"
     Tweet 3: "Cada área tiene un número específico que la rige. Ejemplo: área dinero = número 8"
     Tweet 4: "Cuando identificas TU número bloqueado, puedes liberar esa área"
     Tweet 5: CTA: "Los primeros 5 en comentar su área reciben mini-análisis gratis + [LINK]"`,

    // JUEVES - Contenido de valor + lead magnet
    `Hilo de VALOR + regalo:
     Tweet 1: "Te regalo los 3 pasos para identificar tus números clave (sin carta)"
     Tweet 2: "Paso 1: Calcula tu número de destino (día+mes+año nacimiento)"
     Tweet 3: "Paso 2: Identifica tu número de personalidad (solo día nacimiento)"
     Tweet 4: "Paso 3: Busca patrones repetitivos en tu vida"
     Tweet 5: CTA: "¿Quieres el análisis COMPLETO de tus números? ↓ [LINK]"`,

    // VIERNES - Testimonio conversacional
    `Hilo testimonio conversación:
     Tweet 1: "María me escribió: 'Siempre atraigo personas que me hacen daño'"
     Tweet 2: "Su carta mostró: número 6 kármico = tendencia a cuidar demás descuidándose"
     Tweet 3: "Le enseñé la técnica de protección numérica para su caso específico"
     Tweet 4: "2 meses después: 'Por primera vez siento que merezco amor sano' 💖"
     Tweet 5: CTA: "Si sientes lo mismo, te ayudo ↓ [LINK]"`,

    // SÁBADO - Urgencia real (no artificial)
    `Hilo urgencia REAL:
     Tweet 1: "Esta semana solo tengo 3 espacios para cartas personalizadas"
     Tweet 2: "Normalmente cobro 120€, pero para estos 3 espacios: 25€"
     Tweet 3: "Porque necesito testimonios reales de transformación"
     Tweet 4: "Incluye: análisis completo + técnicas personalizadas + seguimiento 1 semana"
     Tweet 5: CTA: "Solo 3 disponibles ↓ [LINK]"`,

    // DOMINGO - Resumen con oferta irresistible
    `Hilo resumen irresistible:
     Tweet 1: "Esta semana 5 personas transformaron su vida con su carta"
     Tweet 2: "De estancadas a: nueva carrera, relación sana, paz interior..."
     Tweet 3: "¿Qué te impide ser la próxima historia de éxito?"
     Tweet 4: "Hoy ofrezco 2 cartas COMPLETAS gratis a cambio de testimonio honesto"
     Tweet 5: CTA: "Primeros 2 en DM con fecha nacimiento ↓ [LINK]"`
  ];
  
  return prompts[new Date().getDay()];
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
async function generarContenido() {
  const promptDia = obtenerPrompt();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
  
  const body = {
    contents: [
      {
        role: "user",
        parts: [
          { 
            text: PROMPT_BASE + promptDia
          }
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
  console.log('📝 Texto generado por Gemini:', texto);
  
  // Divide por líneas que parecen tweets
  const tweets = texto
    .split(/\n(?=\d+|•|👉|¡|¿|[-—])/)
    .map(t => t.trim())
    .filter(t => t.length > 20 && !t.includes('Hilo') && !t.includes('Tweet'));

  console.log(`🔢 Se generaron ${tweets.length} tweets del hilo`);

  if (tweets.length === 0) {
    throw new Error('No se pudieron extraer tweets del texto generado');
  }

  let firstTweet;
  for (let i = 0; i < tweets.length; i++) {
    const t = tweets[i];
    const tweet = t.length > 270 ? t.substring(0, 267) + '...' : t;
    
    // Reemplazar [LINK] con enlace real SOLO en el último tweet
    const tweetFinal = i === tweets.length - 1 ? 
      tweet.replace('[LINK]', 'eloraculodiario.novaproflow.com') : 
      tweet.replace('[LINK]', '');

    try {
      if (i === 0) {
        firstTweet = await twitterRW.v2.tweet(tweetFinal);
        console.log('✅ Tweet 1 publicado:', tweetFinal.substring(0, 50) + '...');
      } else {
        await twitterRW.v2.reply(tweetFinal, firstTweet.data.id);
        console.log(`✅ Tweet ${i + 1} publicado:`, tweetFinal.substring(0, 50) + '...');
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (err) {
      console.error('❌ Error publicando tweet:', err.message);
      throw err;
    }
  }

  // AÑADIR TWEET FINAL MEJORADO - MÁS PERSONAL
  try {
    const tweetFinal = `💫 ¿Te resuena algo de esto? 

Si sientes que hay patrones que se repiten en tu vida, puedo ayudarte a entender el POR QUÉ y el CÓMO cambiarlo.

Tu carta numerológica es el mapa para tu transformación.

👇 Hablamos? eloraculodiario.novaproflow.com

#Numerologia #Transformación`;

    await twitterRW.v2.reply(tweetFinal, firstTweet.data.id);
    console.log('✅ CTA final mejorado añadido');
  } catch (err) {
    console.error('❌ Error CTA final:', err.message);
  }

  return firstTweet.data.id;
}

// === INTERACCIÓN MEJORADA ===
async function interaccionSegura() {
  console.log('🔍 Iniciando interacción estratégica...');
  
  const MI_USER_ID = '1964715530348306432';
  
  // Búsquedas más específicas para tu nicho
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
      'tweet.fields': 'public_metrics,author_id,context_annotations'
    });
    
    if (!searchResult.data) {
      console.log('No se encontraron tweets para interactuar');
      return;
    }

    let interacciones = 0;
    
    for (const tweet of searchResult.data) {
      if (interacciones >= config.interaccionesDiarias) break;
      
      // Solo interactuar con tweets que tengan engagement real
      if (tweet.public_metrics.like_count > 2 && tweet.author_id !== MI_USER_ID) {
        try {
          // Like al tweet
          await twitterRW.v2.like(MI_USER_ID, tweet.id);
          console.log(`✅ Like dado al tweet: ${tweet.id}`);
          
          // Respuestas más naturales y valiosas
          const respuestasValiosas = [
            `Justo estaba pensando en esto! En numerología, esto suele relacionarse con el número ${Math.floor(Math.random()*9)+1}. ¿Te suena?`,
            `Interesante reflexión. Desde la perspectiva numerológica, esto tiene mucho que ver con nuestros patrones kármicos.`,
            `Completamente de acuerdo. He visto este patrón muchas veces en las cartas numerológicas que hago.`,
            `¿Has observado si esto sigue algún ciclo en tu vida? En numerología podemos identificar esos patrones.`
          ];
          
          const respuesta = respuestasValiosas[Math.floor(Math.random()*respuestasValiosas.length)];
          await twitterRW.v2.reply(respuesta, tweet.id);
          console.log(`✅ Respuesta añadida al tweet: ${tweet.id}`);
          
          interacciones++;
          await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minutos entre acciones
          
        } catch (err) {
          console.error('❌ Error en interacción:', err.message);
        }
      }
    }
    
    console.log(`✅ Interacción estratégica completada: ${interacciones} interacciones`);
  } catch (err) {
    console.error('❌ Error en búsqueda:', err);
  }
}

// === EJECUCIÓN PRINCIPAL ===
async function main() {
  console.log(`📅 Hoy es ${hoy}. Generando contenido conversacional...`);
  
  try {
    // 1. Generar y publicar contenido principal
    const respuesta = await generarContenido();
    console.log('🧠 Gemini respondió con contenido conversacional');
    
    const tweetId = await publicarHilo(respuesta);
    console.log('✅ Hilo conversacional publicado');
    
    // 2. Interacción estratégica (DESCOMENTAR SI QUIERES)
    console.log('🔄 Iniciando interacciones estratégicas...');
    await interaccionSegura();
    
    console.log('🎯 Publicación e interacción completadas');
    
  } catch (err) {
    console.error('❌ Error en ejecución principal:', err);
    process.exit(1);
  }
}

// Ejecutar solo si es el archivo principal
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main, interaccionSegura };
