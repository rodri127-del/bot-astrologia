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

// === PROMPTS MEJORADOS - MÁS VIRALES ===
function obtenerPrompt() {
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
     Tweet 5: CTA: "Transforma tu realidad. Tu carta personalizada: [LINK]"`,

    // SÁBADO - Testimonio espiritual
    `Hilo testimonial espiritual:
     Tweet 1: "Ana sentía vacío existencial a pesar de tenerlo todo..."
     Tweet 2: "Su carta numerológica mostró: alma vieja con misión de servicio"
     Tweet 3: "Al seguir su camino numérico específico..."
     Tweet 4: "¡Encontró paz interior y propósito real! 🙏"
     Tweet 5: CTA: "Encuentra tu paz interior. Tu carta personalizada: [LINK]"`,

    // DOMINGO - Resumen semanal
    `Hilo resumen:
     Tweet 1: "Esta semana ayudé a 7 personas a descubrir sus patrones kármicos ✨"
     Tweet 2: "Problemas comunes: bloqueos económicos, relaciones repetitivas, falta de propósito"
     Tweet 3: "La solución SIEMPRE fue la misma: entender su código numérico personal"
     Tweet 4: "Tu también puedes transformar tu vida"
     Tweet 5: CTA: "Empieza tu transformación. Pide tu carta: [LINK]"`
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
          { 
            text: `Eres El Oráculo Diario, experto en numerología práctica. Crea contenido VIRAL que convierta seguidores en clientes. 
Resuelve problemas reales y al final menciona la carta numerológica. Tono natural, cercano, práctico. 
Máximo 260 caracteres por tweet. No uses asteriscos, negritas ni markdown.
Siempre incluye [LINK] donde indico para el CTA final.

INSTRUCCIONES:
${prompt}`
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
  
  // Divide por líneas que parecen tweets (números, guiones, o texto sustancial)
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
    // Limpiar y asegurar que no pase de 280 caracteres
    const tweet = t.length > 270 ? t.substring(0, 267) + '...' : t;
    
    // Reemplazar [LINK] con enlace real en el último tweet
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
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2s entre tweets para mayor seguridad
    } catch (err) {
      console.error('❌ Error publicando tweet:', err.message);
      throw err;
    }
  }

  // AÑADIR TWEET FINAL CON CTA MEJORADO (solo si el hilo no incluyó uno)
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

  return firstTweet.data.id;
}

// === INTERACCIÓN SEGURA (OPCIONAL - EJECUTAR POR SEPARADO) ===
async function interaccionSegura() {
  console.log('🔍 Iniciando interacción segura...');
  
  // NECESITAS REEMPLAZAR 'TU_USER_ID' con tu ID numérico de Twitter
  const MI_USER_ID = '1964715530348306432'; // Obtén esto de https://tweeterid.com/
  
  const query = 'numerología OR "propósito de vida" OR "bloqueos" -filter:retweets';
  
  try {
    const searchResult = await twitterRW.v2.search(query, {
      max_results: 5, // Reducido para seguridad
      'tweet.fields': 'public_metrics,author_id'
    });
    
    if (!searchResult.data) {
      console.log('No se encontraron tweets para interactuar');
      return;
    }

    let interacciones = 0;
    
    for (const tweet of searchResult.data) {
      if (interacciones >= config.interaccionesDiarias) break;
      
      if (tweet.public_metrics.like_count > 3 && tweet.author_id !== MI_USER_ID) {
        try {
          // Like al tweet
          await twitterRW.v2.like(MI_USER_ID, tweet.id);
          console.log(`✅ Like dado al tweet: ${tweet.id}`);
          
          // Comentario de valor
          const respuestasValiosas = [
            `Interesante perspectiva sobre numerología. El número ${Math.floor(Math.random()*9)+1} influye mucho en esto.`,
            `Como experto en numerología, añadiría que la fecha nacimiento determina patrones únicos.`,
            `¡Buen punto! En mis cartas numerológicas personalizadas, analizo esto en profundidad.`
          ];
          const respuesta = respuestasValiosas[Math.floor(Math.random()*respuestasValiosas.length)];
          
          await twitterRW.v2.reply(respuesta, tweet.id);
          console.log(`✅ Respuesta añadida al tweet: ${tweet.id}`);
          
          interacciones++;
          await new Promise(resolve => setTimeout(resolve, 180000)); // 3 minutos entre acciones
          
        } catch (err) {
          console.error('❌ Error en interacción:', err.message);
        }
      }
    }
    
    console.log(`✅ Interacción completada: ${interacciones} interacciones`);
  } catch (err) {
    console.error('❌ Error en búsqueda:', err);
  }
}

// === EJECUCIÓN PRINCIPAL ===
async function main() {
  console.log(`📅 Hoy es ${hoy}. Generando contenido...`);
  
  try {
    // 1. Generar y publicar contenido principal
    const respuesta = await generarContenido();
    console.log('🧠 Gemini respondió correctamente');
    
    const tweetId = await publicarHilo(respuesta);
    console.log('✅ Hilo principal publicado');
    
    // 2. Interacción segura (OPCIONAL - descomenta si quieres usarlo)
    // console.log('🔄 Iniciando interacciones seguras...');
    // await interaccionSegura();
    
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
