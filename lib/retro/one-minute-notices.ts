export type OneMinuteMessenger = {
  name: string;
  avatarSrc: string;
  message: string;
  weight: number;
};

export const ONE_MINUTE_MESSENGERS: OneMinuteMessenger[] = [
  { name: "Patrick", avatarSrc: "/Patrick.png", message: "Patrick says: one minute. Wrap it up, team.", weight: 5 },
  { name: "Charles", avatarSrc: "/Charles.png", message: "Charles is watching the clock. Sixty seconds left.", weight: 5 },
  { name: "Alexandre", avatarSrc: "/Alexandre.png", message: "Alexandre: one minute. Finish strong.", weight: 5 },
  { name: "Khalid", avatarSrc: "/Khalid.png", message: "Warm it up — one minute left!", weight: 1 },
  { name: "Raph", avatarSrc: "/Raph.png", message: "Raph here. One minute, make it count.", weight: 1 },
  { name: "Guillaume", avatarSrc: "/Guillaume.png", message: "Guillaume says stay calm. One minute.", weight: 1 },
  { name: "Simon", avatarSrc: "/Simon.png", message: "Simon: sixty seconds. Go go go.", weight: 1 },
  { name: "Thierry", avatarSrc: "/Thierry.png", message: "Thierry reminds you — time's almost up.", weight: 1 },
  { name: "Anthony", avatarSrc: "/Anthony.png", message: "Anthony: one minute. No new epics please.", weight: 1 },
  { name: "Mehdi", avatarSrc: "/Mehdi.png", message: "Mehdi says one minute on the board.", weight: 1 },
  { name: "Hamza", avatarSrc: "/Hamza.png", message: "Hamza: hurry up, one minute left.", weight: 1 },
  { name: "Mohamed", avatarSrc: "/Mohamed.png", message: "Mohamed: last stretch — one minute.", weight: 1 },
  { name: "Damien", avatarSrc: "/Damien.png", message: "Damien says almost there. One minute.", weight: 1 },
  { name: "Jonathan", avatarSrc: "/Jonathan.png", message: "Jonathan: finish your cards. Sixty seconds.", weight: 1 },
  { name: "Steven", avatarSrc: "/Steven.png", message: "Steven says wrap it up. Clock's ticking.", weight: 1 },
  { name: "Ilias", avatarSrc: "/Ilias.png", message: "Ilias: one minute. Speed run mode.", weight: 1 },
  { name: "Paul", avatarSrc: "/Paul.png", message: "Paul says one minute — pens down soon.", weight: 1 },
  { name: "Laura", avatarSrc: "/Laura.png", message: "Laura: one minute left, you've got this.", weight: 1 },
  { name: "Heloise", avatarSrc: "/Heloise.png", message: "Heloise says final push. One minute.", weight: 1 },
  { name: "Ailed", avatarSrc: "/Ailed.png", message: "Ailed: sixty seconds on the timer.", weight: 1 },
  { name: "Anter", avatarSrc: "/Anter.png", message: "Anter says wrap it up — one minute.", weight: 1 },
];

export function pickOneMinuteMessenger(): OneMinuteMessenger {
  const totalWeight = ONE_MINUTE_MESSENGERS.reduce((sum, messenger) => sum + messenger.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const messenger of ONE_MINUTE_MESSENGERS) {
    roll -= messenger.weight;
    if (roll <= 0) {
      return messenger;
    }
  }

  return ONE_MINUTE_MESSENGERS[ONE_MINUTE_MESSENGERS.length - 1];
}

export function getMessengerInitials(name: string) {
  return name
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
}
