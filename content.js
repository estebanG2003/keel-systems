// ⚠️ These three language blocks must say the SAME THINGS, not merely have the same shape.
// The test suite checks keys and array lengths. It CANNOT see meaning, and on 2026-08-02 it
// passed green while the Spanish silently kept superseded copy — a human reading it was the
// only thing that caught it. Editing any string here means re-reading the other two. Every time.
//
// ⚠️ The word "AI/IA" is governed by decision #8b: never in the hero or the triggers, exactly
// once in the build step, phrased as what the agent DOES rather than what it is. A capability
// a referrer can repeat, not a category label. Two tests in test/content.test.js enforce both
// halves — the ban everywhere else, and the single permitted mention.

export const LANGS = ['en', 'fr', 'es'];

export const content = {
  en: {
    label: 'EN',
    htmlLang: 'en',
    title: 'Keel Systems',
    heroHeadline: 'Every business has that one thing somebody does by hand every week.',
    heroSub: 'I build the software that does it instead. Quotes, callbacks, forms, reports, the same answer typed for the hundredth time.',
    triggersHeading: 'Does any of this sound familiar?',
    triggersLead: 'Most of what a business loses, it already had.',
    triggers: [
      "The phone rings while I'm with a customer, and by the time I call back they've booked somewhere else.",
      'I send the quote and then I never hear back, and I never find out why.',
      "Somebody doesn't show up, the slot sits empty, and nobody fills it.",
      "Half my week is chasing people for paperwork they already said they'd send.",
      'There are customers who should have come back by now, and nobody noticed.',
      "If I'm away for a week, the whole thing stops.",
    ],
    triggersClose: "If one of these is yours, that's the conversation. If yours isn't on the list, it probably belongs on it.",
    howHeading: 'How it works',
    steps: [
      { title: 'A conversation', body: 'Thirty minutes, in person or on a call. I watch how one thing actually gets done today. Free.' },
      { title: 'One thing, built', body: 'I build the piece that removes the most expensive manual step we found. Sometimes that\'s plain automation. Sometimes it\'s an AI agent that reads what comes in, works out what it is, and decides what to do. I show you a few ways to scope it, starting at two weeks. Fixed price, paid on delivery, and only if it does what I said it would.' },
      { title: 'I keep it alive', body: 'A monthly fee so it stays maintained, gets fixed the day it breaks, and never becomes one more thing you own and nobody understands.' },
    ],
    aboutHeading: 'Who I am',
    aboutParas: [
      "I'm Esteban. I build software in English, French and Spanish. I'm based in Gatineau and I work both sides of the river.",
      "I'm building my first case studies right now, so I'm taking on a small number of projects at a price that reflects that. What I want back is a result I can point to.",
    ],
    ctaLabel: 'Start with a conversation',
  },

  fr: {
    label: 'FR',
    htmlLang: 'fr',
    title: 'Keel Systems',
    heroHeadline: "Chaque entreprise a cette affaire-là que quelqu'un fait à la main chaque semaine.",
    heroSub: "Moi, je bâtis le logiciel qui la fait à sa place. Les soumissions, les appels à retourner, les formulaires, les rapports, la même réponse tapée pour la centième fois.",
    triggersHeading: 'Est-ce que ça vous parle?',
    triggersLead: "La plupart de ce qu'une entreprise perd, elle l'avait déjà.",
    triggers: [
      'Le téléphone sonne pendant que je suis avec un client, et quand je rappelle, la personne a déjà réservé ailleurs.',
      "J'envoie la soumission et je n'ai plus jamais de nouvelles, et je ne sais jamais pourquoi.",
      "Quelqu'un ne se présente pas, la case reste vide, et personne ne la remplit.",
      "La moitié de ma semaine, je cours après le monde pour des papiers qu'ils avaient promis de m'envoyer.",
      "Il y a des clients qui auraient dû revenir depuis longtemps, et personne ne l'a remarqué.",
      "Si je pars une semaine, tout s'arrête.",
    ],
    triggersClose: "Si une de ces phrases est la vôtre, c'est de ça qu'on devrait parler. Si la vôtre n'est pas dans la liste, elle y a probablement sa place.",
    howHeading: 'Comment ça marche',
    steps: [
      { title: 'Une conversation', body: "Trente minutes, en personne ou au téléphone. Je regarde comment une affaire se fait vraiment aujourd'hui. Gratuit." },
      { title: 'Une affaire, bâtie', body: "Je bâtis le morceau qui enlève l'étape manuelle la plus coûteuse qu'on a trouvée. Des fois c'est de l'automatisation simple. Des fois c'est un agent IA qui lit ce qui rentre, comprend ce que c'est, et décide quoi faire. Je vous montre quelques façons de cadrer le projet, à partir de deux semaines. Prix fixe, payable à la livraison, et seulement si ça fait ce que j'ai dit." },
      { title: 'Je la garde en vie', body: "Un montant mensuel pour qu'elle reste entretenue, que je la répare le jour où elle plante, et qu'elle ne devienne jamais une autre affaire que vous possédez et que personne ne comprend." },
    ],
    aboutHeading: 'Qui je suis',
    aboutParas: [
      "Je m'appelle Esteban. Je développe des logiciels en français, en anglais et en espagnol. Je suis basé à Gatineau et je travaille des deux côtés de la rivière.",
      "Je monte mes premiers cas concrets en ce moment, alors je prends un petit nombre de projets à un prix qui reflète ça. Ce que je veux en retour, c'est un résultat que je peux montrer.",
    ],
    ctaLabel: 'Commencer par une conversation',
  },

  es: {
    label: 'ES',
    htmlLang: 'es',
    title: 'Keel Systems',
    heroHeadline: 'Toda empresa tiene esa cosa que alguien hace a mano todas las semanas.',
    heroSub: 'Yo construyo el software que la hace en su lugar. Las cotizaciones, las llamadas por devolver, los formularios, los reportes, la misma respuesta escrita por centésima vez.',
    triggersHeading: '¿Le suena conocido?',
    triggersLead: 'La mayor parte de lo que un negocio pierde, ya lo tenía.',
    triggers: [
      'El teléfono suena mientras estoy con un cliente, y cuando devuelvo la llamada ya reservaron en otro lado.',
      'Mando la cotización y nunca me vuelven a contestar, y nunca sé por qué.',
      'Alguien no llega, el espacio queda vacío, y nadie lo vuelve a llenar.',
      'La mitad de mi semana es persiguiendo gente por papeles que ya habían dicho que me mandaban.',
      'Hay clientes que ya deberían haber vuelto, y nadie se dio cuenta.',
      'Si me voy una semana, todo se detiene.',
    ],
    triggersClose: 'Si alguna de estas es la suya, de eso deberíamos hablar. Si la suya no está en la lista, seguramente también cabe aquí.',
    howHeading: 'Cómo funciona',
    steps: [
      { title: 'Una conversación', body: 'Treinta minutos, en persona o por llamada. Miro cómo se hace de verdad una sola cosa hoy. Gratis.' },
      { title: 'Una cosa, construida', body: 'Construyo la pieza que quita el paso manual más caro que encontramos. A veces es automatización simple. A veces es un agente de IA que lee lo que llega, entiende qué es y decide qué hacer. Le muestro algunas formas de definir el alcance, a partir de dos semanas. Precio fijo, se paga en la entrega, y solo si hace lo que dije.' },
      { title: 'Yo la mantengo viva', body: 'Una cuota mensual para que siga funcionando. Le hago el mantenimiento, la arreglo el día que se daña, y así nunca se convierte en una cosa más que usted tiene y nadie entiende.' },
    ],
    aboutHeading: 'Quién soy',
    aboutParas: [
      'Me llamo Esteban. Desarrollo software en español, inglés y francés, desde Gatineau, en la región de Ottawa, Canadá, y trabajo de los dos lados del río.',
      'Estoy construyendo mis primeros casos concretos ahora mismo, así que estoy tomando un número pequeño de proyectos a un precio que lo refleja. Lo que quiero a cambio es un resultado que pueda mostrar.',
    ],
    ctaLabel: 'Empezar con una conversación',
  },
};
