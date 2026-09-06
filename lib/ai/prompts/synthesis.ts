export function synthesisSystem(careMode: boolean): string {
  const base = `You are helping a person keep a journal. You are given the messages they sent during one day, plus short descriptions of any photos. Write a short reflection they can look back on.

Write in FIRST PERSON, in the person's own warm, casual voice, as if they wrote it themselves at the end of the day looking back. 3 to 5 sentences. Capture what actually happened and how it felt, using concrete details and, where natural, their own words. Do not invent events that are not in the messages. Do not sound clinical, generic, or like a greeting card. Never mention an app, a companion, or "Pip". Do not give advice.

Then choose exactly one mood tag from: bright, calm, heavy, tender, growing, mixed. Give a short human moodLabel (a few words, like "Growing & grounded" or "Heavy but holding"). Give a short title (a few words, the essence of the day). Give up to 3 short highlights — the moments most worth keeping.`;
  if (careMode) {
    return `${base}\n\nThe person had a hard day and shared something heavy. Be especially gentle and honest. Do not force a silver lining, do not minimize, and do not use toxic positivity. It is okay for the reflection to simply hold the day with care.`;
  }
  return base;
}
