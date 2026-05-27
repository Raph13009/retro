import { PRODUCT_NAME } from "@/lib/brand";

export const SEO_TAGS = [
  "Free retrospective tool",
  "Scrum retrospectives",
  "Agile sprint retros",
  "Remote retrospectives",
  "Online retro board"
] as const;

export const WHY_TEAMS_LOVE = [
  {
    title: "Fast setup",
    description: "Create a retro board in less than 10 seconds. Share one link and your whole squad is in."
  },
  {
    title: "Honest feedback",
    description: "Private reflection cards stay hidden until discuss so teams speak openly without groupthink."
  },
  {
    title: "Remote-friendly",
    description: "Live cursors, realtime updates, and a board built for distributed Scrum and hybrid ceremonies."
  },
  {
    title: "Action tracking",
    description: "Drag insights into action items during discuss so every retro ends with owners and next steps."
  },
  {
    title: "Engaging by design",
    description: "Votes, emoji reactions, and grouping turn a dry meeting into a focused, collaborative session."
  },
  {
    title: "Start Stop Continue",
    description: "Ships with the most popular agile retro format out of the box—no configuration required."
  }
] as const;

export const RETRO_STEPS = [
  { title: "Gather feedback", body: "Teammates add cards to Start, Stop, and Continue while the timer keeps writing focused." },
  { title: "Group ideas", body: "Drag related cards into themes so patterns emerge before anyone debates priorities." },
  { title: "Vote", body: "Each person spends a limited vote budget on the groups that matter most to the team." },
  { title: "Discuss", body: "Facilitate conversation on top-voted themes with cards revealed and context on screen." },
  { title: "Create action items", body: "Capture commitments in the board so improvements survive after the meeting ends." }
] as const;

export const TEMPLATES = [
  { slug: "start-stop-continue", name: "Start Stop Continue", emoji: "🚦", description: "What to start, stop, and keep doing next sprint.", builtIn: true },
  { slug: "mad-sad-glad", name: "Mad Sad Glad", emoji: "😤", description: "Surface emotions and morale alongside delivery topics.", builtIn: false },
  { slug: "sailboat", name: "Sailboat Retro", emoji: "⛵", description: "Wind, anchors, rocks, and island—forces helping or blocking the team.", builtIn: false },
  { slug: "4ls", name: "4Ls Retro", emoji: "💡", description: "Liked, learned, lacked, and longed for—a balanced reflection format.", builtIn: false },
  { slug: "rose-thorn-bud", name: "Rose Thorn Bud", emoji: "🌹", description: "Celebrate wins, name pain points, and spot emerging opportunities.", builtIn: false },
  { slug: "daki", name: "DAKI", emoji: "🎯", description: "Drop, add, keep, improve—prioritize change with four clear buckets.", builtIn: false },
  { slug: "lean-coffee", name: "Lean Coffee", emoji: "☕", description: "Vote on topics, timebox discussion, and keep facilitation lightweight.", builtIn: false },
  { slug: "team-health", name: "Team Health Check", emoji: "💚", description: "Rate collaboration, delivery, and support to track team wellbeing.", builtIn: false }
] as const;

export const FREE_FOREVER = [
  "Unlimited retrospectives",
  "Unlimited participants",
  "No signup required",
  "No credit card",
  "Free forever"
] as const;

export const RETRO_FAILURES = [
  {
    problem: "Same boring format every sprint",
    solution: "Switch structures with proven templates and a board that feels modern—not another slide deck."
  },
  {
    problem: "No action items captured",
    solution: "Create and move action items on the same canvas where the team already agreed priorities."
  },
  {
    problem: "Low engagement",
    solution: "Votes and reactions make participation visible; timers keep energy high without rushing safety."
  },
  {
    problem: "Meetings run too long",
    solution: "Phases, vote limits, and grouping focus discussion on what the team already ranked as important."
  },
  {
    problem: "People do not feel safe speaking",
    solution: "Hidden reflection cards during the write phase reduce performative answers before group reveal."
  }
] as const;

export const COMPARISON = {
  headers: ["Feature", PRODUCT_NAME, "EasyRetro", "TeamRetro", "Parabol"],
  rows: [
    { feature: "Free plan", paraboll: true, easyRetro: true, teamRetro: "limited", parabol: "limited" },
    { feature: "No signup to start", paraboll: true, easyRetro: false, teamRetro: false, parabol: false },
    { feature: "Realtime retro board", paraboll: true, easyRetro: true, teamRetro: true, parabol: true },
    { feature: "Vote limits per person", paraboll: true, easyRetro: true, teamRetro: true, parabol: true },
    { feature: "Emoji reactions", paraboll: true, easyRetro: true, teamRetro: true, parabol: true },
    { feature: "Action items on board", paraboll: true, easyRetro: true, teamRetro: true, parabol: true },
    { feature: "Private reflection phase", paraboll: true, easyRetro: true, teamRetro: true, parabol: false }
  ]
} as const;

export const FAQ_ITEMS = [
  {
    question: "What is a retrospective meeting?",
    answer:
      "A retrospective meeting is a structured team conversation—usually at the end of a sprint—where the group reflects on how they worked together, what went well, what did not, and what to improve next time."
  },
  {
    question: "What is the purpose of a sprint retrospective?",
    answer:
      "The purpose of a sprint retrospective is continuous improvement. Scrum teams use retros to inspect their process, adapt practices, and agree on concrete actions before the next iteration."
  },
  {
    question: "What are the best retrospective formats?",
    answer:
      "Popular formats include Start Stop Continue, Mad Sad Glad, Sailboat, 4Ls, and Rose Thorn Bud. The best format depends on team mood, sprint outcome, and whether you need psychological safety or prioritization."
  },
  {
    question: "How long should a retro last?",
    answer: `Most sprint retrospectives run 45–75 minutes for a two-week sprint. Shorten the timer for small teams or lengthen discussion when many themes surface—${PRODUCT_NAME}’s phases help you stay on track.`
  },
  {
    question: "Are retrospectives only for Scrum teams?",
    answer:
      "No. Any agile or product team can benefit—Kanban squads, platform teams, and leadership groups all use retros to learn faster. The ceremony is about reflection, not a specific framework badge."
  },
  {
    question: "Can remote teams run retrospectives?",
    answer: `Yes. Remote and hybrid teams need an online retro board with realtime updates, voting, and clear facilitation. ${PRODUCT_NAME} is built for distributed participants joining from a single shared link.`
  },
  {
    question: "Is this retrospective tool free?",
    answer: `Yes. ${PRODUCT_NAME} is free to use with unlimited rooms and participants. There is no credit card and no paid tier required to run a full ceremony.`
  },
  {
    question: "Do participants need an account?",
    answer:
      "No account is required. The facilitator creates a room, shares the URL, and teammates join with a display name—ready to add cards in seconds."
  },
  {
    question: "What is a sprint retrospective in agile?",
    answer:
      "In agile, a sprint retrospective is the final ceremony of the iteration where the team discusses collaboration, quality, and flow. It complements sprint review (product) with process improvement (team)."
  },
  {
    question: "How do you run a Start Stop Continue retrospective?",
    answer:
      "Ask what the team should start doing, stop doing, and continue doing. Collect cards per column, group themes, vote, then discuss top items and assign action owners."
  },
  {
    question: "What is an online retro board?",
    answer:
      "An online retro board is a digital canvas where teammates post sticky-note-style cards, group ideas, vote, and track actions—replacing physical walls for remote agile teams."
  },
  {
    question: "How do you encourage honest feedback in retros?",
    answer: `Use private writing phases, neutral facilitation, and clear voting rules so loudest voices do not dominate. ${PRODUCT_NAME} hides other people’s cards during reflect to reduce anchoring.`
  },
  {
    question: "What makes a retrospective actionable?",
    answer:
      "Actionable retros end with specific owners, due dates, and a small number of commitments the team believes they can finish. Capture items on the board before people leave the call."
  },
  {
    question: "Can I run a retro without a facilitator?",
    answer: `Yes, though a facilitator helps with timing and neutrality. ${PRODUCT_NAME}’s timer and phased flow give self-facilitated teams enough structure to run without a dedicated Scrum Master.`
  },
  {
    question: "What is the difference between a retro and a postmortem?",
    answer:
      "Postmortems often follow incidents and focus on root cause. Retrospectives are regular, forward-looking team habits aimed at sustainable improvement—not blame."
  },
  {
    question: "How many votes should each person get?",
    answer: `A common rule is three votes per participant—enough to express priority without diluting signal. ${PRODUCT_NAME} lets facilitators configure vote limits per room.`
  },
  {
    question: `Does ${PRODUCT_NAME} work for large teams?`,
    answer: `${PRODUCT_NAME} supports unlimited participants per room. For very large groups, consider breakout boards or timeboxed brainstorming so everyone can contribute.`
  },
  {
    question: "Can I export retro outcomes?",
    answer:
      "Facilitators can summarize the room when closing a session. Export and summary features continue to evolve—start your retro to capture cards, votes, and actions in one place."
  },
  {
    question: "What is a fun retrospective for remote teams?",
    answer:
      "Add a check-in question, use a fresh template like Sailboat or 4Ls, and keep voting playful with reactions. Remote fun comes from pace and inclusion—not gimmicks alone."
  },
  {
    question: `Is ${PRODUCT_NAME} an EasyRetro or Parabol alternative?`,
    answer: `If you want a fast, free, no-signup board with voting, reactions, grouping, and action items, ${PRODUCT_NAME} is a strong alternative focused on speed and a calm modern UX.`
  }
] as const;

export const SPRINT_RETRO_ARTICLE = `A sprint retrospective is the agile ceremony where your team pauses to inspect how they worked—not just what they shipped. In Scrum, it happens after the sprint review and before planning the next iteration. The whole point is learning: celebrate wins, name friction, and agree on a short list of improvements you will actually try.

Unlike a status meeting, a sprint retrospective is safe, honest, and forward-looking. Facilitators use a retro board to collect ideas in parallel, group similar cards, vote on priorities, and discuss the themes with the most energy. That structure keeps introverts heard and stops the loudest voice from picking every topic.

Strong sprint retrospectives share a few habits. They have a clear timebox, a visible agenda, and psychological safety. Teams that skip retros accumulate process debt—the same blockers return sprint after sprint. Teams that run them well compound small fixes into faster delivery and healthier collaboration.

${PRODUCT_NAME} is a free online retrospective tool built for this exact flow. You get Start, Stop, and Continue columns out of the box, realtime collaboration for remote Scrum teams, vote limits so prioritization stays fair, and action items you can track on the same board. No signup, no credit card—create a room, share the link, and run your next agile retrospective in seconds.`;

export const EFFECTIVE_RETRO_ARTICLE = `Running an effective retrospective means respecting both the people in the room and the clock on the wall. Start by setting intent: this is a retro meeting for learning, not blame. Choose a format—Start Stop Continue is a reliable default—and give everyone private time to write before cards are revealed.

Gather feedback first. Ask what helped delivery, what hurt it, and what surprised the team. Use parallel writing on a retro board so notes appear together instead of sequentially. Group ideas next; clustering cards surfaces patterns you would miss in a round-robin conversation.

Voting is where agile teams decide what deserves airtime. Limited votes per person force trade-offs and prevent endless lists. Discuss top themes with curiosity: what system conditions produced this outcome? Close by creating action items—small, owned, and reviewable next sprint.

${PRODUCT_NAME} supports each step in one collaborative canvas: reflect with timers, drag cards into groups, vote on themes, react with emoji, and move outcomes into action items during discuss. Whether you facilitate in person or run a remote retrospective tool session, the goal is the same—leave with clarity, commitment, and a team that trusts the process.`;

export const REMOTE_TEAMS_ARTICLE = `Remote retrospective tools exist because distributed agile teams cannot gather around a physical whiteboard. The best online retro board feels instant: cards appear live, votes update for everyone, and facilitators can see when the room is ready to move on. Hybrid teams benefit too—one shared link for office and remote participants alike.

Distributed Scrum teams face unique challenges: time zones, video fatigue, and uneven participation. A remote-friendly retro reduces those risks with clear phases, visible prioritization, and lightweight engagement like reactions. Facilitators should call out silence, rotate speaking order, and keep cameras optional when trust is still building.

${PRODUCT_NAME} is built for remote and hybrid ceremonies from day one. Realtime sync, vote budgets, grouped themes, and action tracking mean your retrospective is not a slideshow—it is a living board. Launch a free retro in seconds, invite your squad, and run a structured sprint retrospective wherever your team works.`;
