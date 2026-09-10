// English only as of 2026-09-09. The FR and ES blocks were removed with the shift to a
// cold-traffic page: maintaining three copies by hand was the stated cost, and a stale
// translation is worse than no translation. On 2026-08-02 the suite passed green while
// the Spanish silently kept superseded copy, which is the failure this removal ends.
// Git history holds both blocks if they are ever wanted back.
//
// ⚠️ The word "AI" is governed by decision #8c (2026-09-09, replaces #8b): never in the hero
// or the triggers, exactly
// once in the audit step AND once in the build step, phrased as what it DOES. Two tests
// in test/content.test.js enforce both halves. ⚠️ #8b is REOPENED as of 2026-09-09 because
// the page went cold-traffic, which is gate 2 in BRIEF.md. Until it is re-ruled, it stands.
export const LANGS = ['en'];

export const content = {
  en: {
    label: 'EN',
    htmlLang: 'en',
    title: 'Keel Systems',
    heroHeadline: 'The customers you lose are the ones who called while you were busy working.',
    heroSub: "I build the small systems that catch the calls, quotes and messages while you're working, so you can focus on the work in front of you.",
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
      { title: 'An AI audit', body: 'Thirty minutes, in person or on a call. I look at how work comes in today, and where it goes missing between the first message and the booked job. Free.' },
      { title: 'One thing, built', body: 'I build the piece that removes the most expensive manual step we found. Sometimes that\'s plain automation. Sometimes it\'s an AI agent that reads what comes in, works out what it is, and decides what to do. I show you a few ways to scope it, starting at two weeks. Fixed price, paid on delivery, and only if it does what I said it would.' },
      { title: 'I keep it alive', body: 'A monthly fee so it stays maintained, gets fixed the day it breaks, and never becomes one more thing you own and nobody understands.' },
    ],
    aboutHeading: 'Who I am',
    aboutParas: [
      "I'm Esteban. I find the biggest thing slowing a business down and I build the system that takes it over, start to finish, so nobody has to touch it again. I'm based in Gatineau and I work both sides of the river. I speak English, French and Spanish, so we can work in whichever one is easiest for you.",
      "I take a small number of projects at a time, because that way each one gets enough of my attention to be built properly. What I want in return is a result you are glad to talk about, and a name you would pass to a friend.",
    ],
    ctaLabel: 'Start with a conversation',
  },
};
