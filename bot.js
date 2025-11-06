// bot.js - VERSIÓN CORREGIDA Y MEJORADA
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
const POST_FIJO_ID = '1986511491785461979';
const TIRADA_URL = 'https://eloraculodiario.novaproflow.com/tirada/';
const MI_USER_ID = '1964715530348306432';

// === SISTEMA DE ESTADO EN MEMORIA (REEMPLAZA localStorage) ===
class EstadoDiario {
  constructor() {
    this.estado = {
      rtHecho: false,
      hilosHechos: false,
      fechaActual: this.getHoy()
    };
  }

  getHoy() {
    return new Date().toISOString().split('T')[0];
  }

  verificarYCrearNuevoDia() {
    const hoy = this.getHoy();
    if (hoy !== this.estado.fechaActual) {
      console.log('🔄 NUEVO DÍA - Reiniciando estado...');
      this.estado = {
        rtHecho: false,
        hilosHechos: false,
        fechaActual: hoy
      };
    }
  }

  getEstado() {
    this.verificarYCrearNuevoDia();
    return this.estado;
  }
}

const estadoDiario = new EstadoDiario();

// === DÍA DE LA SEMANA ===
const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const hoy = dias[new Date().getDay()];

// === CONFIGURACIÓN ===
const config = {
  hashtags: ['#Numerologia', '#CartasNumerológicas', '#CrecimientoPersonal', '#Alma'],
  publicacionesPorDia: 4,
  interaccionesDiarias: 15,
  maxSeguimientosDia: 45,
  horarios: ['09:00', '12:00', '15:00', '18:00']
};

// === PROMPTS MEJORADOS ===
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

  const promptBase = promptsBase[dia] || promptsBase[0];
  const variacion = variaciones[numeroPublicacion] || variaciones[0];
  
  return promptBase + variacion;
}

// === PROMPT BASE ===
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
  try {
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

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    if (data.error) {
      throw new Error(`Gemini API error: ${data.error.message}`);
    }
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Respuesta de Gemini incompleta');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error en generarContenido:', error.message);
    // Contenido de respaldo en caso de error
    return `Hilo de numerología del día ${hoy}. Descubre tus patrones kármicos y cómo transformarlos. Tu carta numerológica personalizada te espera: [LINK]`;
  }
}

// === PUBLICAR HILO ===
async function publicarHilo(texto) {
  try {
    const tweets = texto
      .split(/\n(?=\d+|•|👉|¡|¿|[-—])/)
      .map(t => t.trim())
      .filter(t => t.length > 20 && !t.includes('Hilo') && !t.includes('Tweet'));

    if (tweets.length === 0) {
      throw new Error('No se pudieron extraer tweets del contenido generado');
    }

    let firstTweet;
    for (let i = 0; i < tweets.length; i++) {
      let tweet = tweets[i];
      if (tweet.length > 270) {
        tweet = tweet.substring(0, 267) + '...';
      }
      
      const tweetFinal = i === tweets.length - 1 ? 
        tweet.replace('[LINK]', 'eloraculodiario.novaproflow.com') : 
        tweet.replace('[LINK]', '');

      try {
        if (i === 0) {
          firstTweet = await twitterRW.v2.tweet(tweetFinal);
          console.log('✅ Tweet 1 publicado:', tweetFinal.substring(0, 50) + '...');
        } else {
          await twitterRW.v2.reply(tweetFinal, firstTweet.data.id);
          console.log(`✅ Tweet ${i + 1} publicado`);
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        console.error('❌ Error publicando tweet:', err.message);
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
      console.log('✅ CTA final publicado');
    } catch (err) {
      console.error('❌ Error CTA final:', err.message);
    }

    return firstTweet.data.id;
  } catch (error) {
    console.error('❌ Error en publicarHilo:', error.message);
    throw error;
  }
}

// === INTERACCIÓN ESTRATÉGICA ===
async function interaccionSegura() {
  const estado = estadoDiario.getEstado();
  if (estado.interaccionesHechas) {
    console.log('🔄 Interacciones ya realizadas hoy');
    return;
  }

  console.log('🔍 Iniciando interacciones estratégicas...');
  
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
      'tweet.fields': 'public_metrics,author_id,created_at'
    });
    
    if (!searchResult.data) {
      console.log('🔍 No se encontraron tweets para interactuar');
      return;
    }

    let interacciones = 0;
    for (const tweet of searchResult.data) {
      if (interacciones >= config.interaccionesDiarias) break;
      
      // Verificar que el tweet no sea muy viejo (menos de 48 horas)
      const tweetDate = new Date(tweet.created_at);
      const now = new Date();
      const hoursDiff = (now - tweetDate) / (1000 * 60 * 60);
      
      if (hoursDiff < 48 && tweet.public_metrics.like_count > 2 && tweet.author_id !== MI_USER_ID) {
        try {
          await twitterRW.v2.like(MI_USER_ID, tweet.id);
          console.log(`❤️ Like dado al tweet ${tweet.id}`);
          
          const respuestas = [
            `Justo estaba pensando en esto! En numerología, esto suele relacionarse con el número ${Math.floor(Math.random()*9)+1}. ¿Te suena?`,
            `Interesante reflexión. Desde la perspectiva numerológica, esto tiene mucho que ver con nuestros patrones kármicos.`,
            `Completamente de acuerdo. He visto este patrón muchas veces en las cartas numerológicas que hago.`,
            `¿Has observado si esto sigue algún ciclo en tu vida? En numerología podemos identificar esos patrones.`
          ];
          const respuesta = respuestas[Math.floor(Math.random()*respuestas.length)];
          await twitterRW.v2.reply(respuesta, tweet.id);
          console.log(`💬 Respuesta enviada al tweet ${tweet.id}`);
          
          interacciones++;
          await new Promise(resolve => setTimeout(resolve, 120000)); // 2 minutos entre interacciones
        } catch (err) {
          console.error('❌ Error en interacción:', err.message);
        }
      }
    }
    
    estado.interaccionesHechas = true;
    console.log(`✅ ${interacciones} interacciones completadas`);
  } catch (err) {
    console.error('❌ Error en búsqueda:', err.message);
  }
}

// === RT DEL POST FIJO ===
async function retuitearPostFijo() {
  const estado = estadoDiario.getEstado();
  if (estado.rtHecho) {
    console.log('🔄 RT ya realizado hoy');
    return;
  }

  try {
    await twitterRW.v2.retweet(MI_USER_ID, POST_FIJO_ID);
    estado.rtHecho = true;
    console.log('✅ RT del post fijo realizado');
  } catch (err) {
    if (err.code !== 327) { // 327 = ya retuiteado
      console.error('❌ Error en RT:', err.message);
    } else {
      console.log('🔄 Post ya retuiteado anteriormente');
      estado.rtHecho = true;
    }
  }
}

// === PROCESAR REPLIES TIRADA GRATIS ===
async function procesarReplies() {
  console.log('🔍 Buscando replies al post fijo...');
  try {
    const replies = await twitterRW.v2.search(`in_reply_to_tweet_id:${POST_FIJO_ID} -from:${MI_USER_ID}`, {
      max_results: 15,
      'tweet.fields': 'author_id,created_at,text'
    });

    if (!replies.data) {
      console.log('📭 No hay replies nuevos');
      return;
    }

    console.log(`📨 Encontrados ${replies.data.length} replies`);

    for (const reply of replies.data) {
      const texto = reply.text.toLowerCase();
      const match = texto.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})\s*[\+\-\:]\s*([a-zA-Záéíóúñ]+)/);
      
      if (!match) {
        console.log('❌ Reply no válido:', texto.substring(0, 50));
        continue;
      }

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
      } catch (err) {
        console.log('⚠️ No se pudo obtener nombre del usuario');
      }

      const link = `${TIRADA_URL}?nombre=${encodeURIComponent(nombre)}&fecha=${fecha}&tema=${tema}`;
      const respuesta = `¡Hola ${nombre}! Tu tirada GRATIS está lista\n\n${link}\n\n+ ritual exprés en <10 seg\n\n#TiradaGratis`;

      try {
        await twitterRW.v2.reply(respuesta, reply.id);
        console.log(`✅ Respondido: ${fecha} + ${tema} para ${nombre}`);
        await new Promise(r => setTimeout(r, 5000)); // 5 segundos entre respuestas
      } catch (err) {
        console.error('❌ Error respondiendo reply:', err.message);
      }
    }
  } catch (err) {
    console.error('❌ Error buscando replies:', err.message);
  }
}

// === HILOS DIARIOS ===
async function main() {
  const estado = estadoDiario.getEstado();
  if (estado.hilosHechos) {
    console.log('🔄 Hilos ya publicados hoy');
    return;
  }

  console.log('🚀 Iniciando publicación de hilos diarios...');
  
  try {
    for (let i = 0; i < config.publicacionesPorDia; i++) {
      console.log(`📝 Generando hilo ${i + 1} de ${config.publicacionesPorDia}`);
      
      const prompt = obtenerPrompt(i);
      const contenido = await generarContenido(prompt);
      await publicarHilo(contenido);
      
      if (i < config.publicacionesPorDia - 1) {
        console.log(`⏰ Esperando 3 horas para el próximo hilo...`);
        await new Promise(r => setTimeout(r, 3 * 60 * 60 * 1000));
      }
    }
    
    estado.hilosHechos = true;
    console.log('✅ Todos los hilos publicados exitosamente');
  } catch (error) {
    console.error('❌ Error en publicación de hilos:', error.message);
  }
}

// === BUCLE PRINCIPAL ===
async function cicloCompleto() {
  const hora = new Date().getHours();
  const minuto = new Date().getMinutes();
  
  console.log(`\n🔄 CICLO - ${new Date().toLocaleString('es-ES')} - Hora: ${hora}:${minuto}`);
  console.log(`📅 Día: ${hoy}`);

  try {
    // 1. RT del post fijo (1 vez al día)
    await retuitearPostFijo();

    // 2. Procesar replies (cada hora)
    await procesarReplies();

    // 3. Hilos diarios (solo a las 9:00)
    if (hora === 9) {
      await main();
    }

    // 4. Interacciones (solo a las 12:00 y 16:00)
    if (hora === 12 || hora === 16) {
      await interaccionSegura();
    }

    console.log('✅ Ciclo completado exitosamente');
  } catch (error) {
    console.error('❌ Error en ciclo completo:', error.message);
  }

  // Esperar 1 hora para el próximo ciclo
  console.log('⏰ Esperando 1 hora para el próximo ciclo...\n');
  setTimeout(cicloCompleto, 60 * 60 * 1000);
}

// === MANEJADOR DE ERRORES NO CAPTURADOS ===
process.on('unhandledRejection', (error) => {
  console.error('❌ Error no capturado:', error);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
});

// === INICIAR BOT ===
console.log('🤖 Iniciando Bot de Numerología...');
console.log('📍 User ID:', MI_USER_ID);
console.log('📍 Post Fijo:', POST_FIJO_ID);
console.log('🌐 Día actual:', hoy);

cicloCompleto().catch(error => {
  console.error('❌ Error fatal al iniciar bot:', error);
  process.exit(1);
});
