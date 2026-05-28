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
    { feature: "Jul song", paraboll: true, easyRetro: false, teamRetro: false, parabol: false },
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

export const BLOG_ARTICLES = [
  {
    slug: "sprint-retrospective",
    title: "What Is a Sprint Retrospective? A Complete Guide",
    description:
      "Learn what a sprint retrospective is, why it matters for Scrum teams, and how to run one that leads to real improvements every sprint.",
    datePublished: "2024-11-01",
    readingMinutes: 4,
    content: SPRINT_RETRO_ARTICLE
  },
  {
    slug: "how-to-run-effective-retrospective",
    title: "How to Run an Effective Retrospective: 5-Step Facilitation Guide",
    description:
      "A proven five-step guide to running sprint retrospectives that are focused, honest, and end with real action items your team actually follows through on.",
    datePublished: "2024-11-08",
    readingMinutes: 4,
    content: EFFECTIVE_RETRO_ARTICLE
  },
  {
    slug: "remote-retrospective-tools",
    title: "Remote Retrospective Tools for Distributed Agile Teams",
    description:
      "Compare the best remote retrospective tools and discover how to run engaging, inclusive online retros for hybrid and distributed Scrum teams.",
    datePublished: "2024-11-15",
    readingMinutes: 3,
    content: REMOTE_TEAMS_ARTICLE
  }
] as const;

export type BlogArticle = (typeof BLOG_ARTICLES)[number];

export const TEMPLATE_DETAILS: Record<
  string,
  {
    fullName: string;
    tagline: string;
    intro: string;
    columns: Array<{ name: string; description: string }>;
    whenToUse: string;
    howToRun: string;
    tips: string[];
  }
> = {
  "start-stop-continue": {
    fullName: "Start Stop Continue Retrospective",
    tagline: "The go-to agile format for balanced, actionable sprint retros.",
    intro:
      "Start Stop Continue is the most widely used sprint retrospective format in agile and Scrum teams. Its simplicity makes it accessible to new teams while its structure keeps experienced teams honest about habits, process debt, and wins worth protecting.",
    columns: [
      {
        name: "Start",
        description:
          "What should the team introduce? New practices, tools, ceremonies, or behaviours that teammates believe would improve the next sprint."
      },
      {
        name: "Stop",
        description:
          "What is costing the team energy or slowing delivery? Habits, processes, or meetings that no longer serve the team and should be dropped."
      },
      {
        name: "Continue",
        description:
          "What is working well and should be explicitly protected? Wins and strengths the team risks losing if left unacknowledged."
      }
    ],
    whenToUse:
      "Use this template every sprint as a reliable default. It works equally well for co-located and remote teams, and scales from two-person pairs to large cross-functional squads. Especially effective when you want a balanced look at what to change versus what to protect.",
    howToRun:
      "1. Set a timer and give everyone 8–10 minutes to write cards privately in each column. 2. Reveal cards together and read each one. 3. Drag related cards into themes—patterns emerge quickly. 4. Vote: each person has a limited vote budget. 5. Discuss top-voted themes and ask what it would take to improve them. 6. Assign one owner and a next-sprint deadline per action item before closing.",
    tips: [
      "Keep the private writing phase before revealing cards to prevent anchoring bias.",
      "Limit actions to two or three per retro—too many dilutes ownership.",
      "Return to the previous sprint's Continue column at the start of each retro to check that wins held."
    ]
  },
  "mad-sad-glad": {
    fullName: "Mad Sad Glad Retrospective",
    tagline: "Surface team emotions and morale alongside delivery topics.",
    intro:
      "Mad Sad Glad is a retrospective format that invites the team to reflect through an emotional lens. Instead of process categories, it uses three feelings—frustration, disappointment, and joy—to surface what actually mattered during the sprint.",
    columns: [
      {
        name: "Mad",
        description:
          "Frustrations, blockers, and things that made work harder than it needed to be. Process friction, repeated problems, or unclear expectations belong here."
      },
      {
        name: "Sad",
        description:
          "Disappointments and missed expectations—goals that slipped, quality that fell short, or opportunities the team wishes they had acted on."
      },
      {
        name: "Glad",
        description:
          "Wins, moments of pride, and things that energised the team. Celebrations of delivery, collaboration, or personal growth that keep morale healthy."
      }
    ],
    whenToUse:
      "Use Mad Sad Glad after a stressful sprint, a difficult release, or a significant org change where you need to surface emotions before diving into process. It creates psychological safety by naming feelings as legitimate data.",
    howToRun:
      "1. Frame the retro as a space for honesty, not blame. 2. Give the team 8 minutes to write cards across the three columns privately. 3. Reveal and read cards together. 4. Group recurring Mads and Sads by theme. 5. Vote on the most impactful themes to discuss. 6. Focus discussion on underlying conditions—what system produced this feeling? 7. Close with one or two agreed process changes and a clear owner for each.",
    tips: [
      "Normalise the Mad column—frustrated feelings often point to real systemic problems.",
      "Use Glad cards to open the discussion on a positive note before diving into Mads.",
      "Watch for patterns across multiple sprints—recurring Mads signal persistent blockers."
    ]
  },
  sailboat: {
    fullName: "Sailboat Retrospective",
    tagline: "A visual metaphor that makes agile reflection feel less routine.",
    intro:
      "The Sailboat retrospective uses a nautical metaphor to help teams think about the forces shaping their sprint: what pushed them forward, what slowed them down, what risks lie ahead, and what goal they are sailing toward.",
    columns: [
      {
        name: "Wind",
        description:
          "What helped the team move faster? Practices, tools, teammates, or external factors that accelerated progress and should be amplified."
      },
      {
        name: "Anchors",
        description:
          "What slowed the team down? Blockers, slow processes, unclear decisions, or dependencies that acted as drag on velocity."
      },
      {
        name: "Rocks",
        description:
          "What risks or obstacles are ahead? Known threats to the next sprint—tech debt, upcoming dependencies, or external pressures."
      },
      {
        name: "Island",
        description:
          "What is the team's goal? The destination everyone is sailing toward—sprint goal, OKR, or quarterly milestone."
      }
    ],
    whenToUse:
      "Sailboat works best for quarterly reviews, cross-functional teams, or when the standard Start/Stop/Continue format feels stale. The metaphor makes abstract concepts tangible and encourages creative thinking.",
    howToRun:
      "1. Draw or display the metaphor: a boat, sails, anchor, rocks beneath the surface, and an island in the distance. 2. Brief the team on each element. 3. Give 8 minutes to write cards privately. 4. Reveal and cluster Anchors by theme—these become your action candidates. 5. Vote on which anchors to address next sprint. 6. Confirm the Island is still the right goal before closing.",
    tips: [
      "Spend extra time on Rocks—surfacing risks early is the most underrated part of retros.",
      "Keep the Island visible throughout the discussion to anchor action items to the goal.",
      "If the team cannot agree on the Island, that misalignment is itself the most important retro outcome."
    ]
  },
  "4ls": {
    fullName: "4Ls Retrospective (Liked, Learned, Lacked, Longed For)",
    tagline: "A balanced reflection format covering both process and emotion.",
    intro:
      "4Ls stands for Liked, Learned, Lacked, and Longed For. It gives teams four distinct lenses to reflect on the sprint—covering appreciation, growth, gaps, and aspirations in one structured exercise.",
    columns: [
      {
        name: "Liked",
        description:
          "What did the team appreciate about this sprint? Positive experiences, helpful practices, and moments of good collaboration."
      },
      {
        name: "Learned",
        description:
          "What new knowledge, skills, or insights did the team gain? Technical learnings, process discoveries, or customer understanding."
      },
      {
        name: "Lacked",
        description:
          "What was missing that the team needed? Resources, clarity, tooling, skills, or support that would have made the sprint smoother."
      },
      {
        name: "Longed For",
        description:
          "What did the team wish existed? Aspirational tools, processes, or conditions that would significantly improve how the team works."
      }
    ],
    whenToUse:
      "4Ls works especially well for teams new to retrospectives, or when a simple Start/Stop/Continue has become repetitive. It surfaces both emotional and process dimensions in a single format.",
    howToRun:
      "1. Explain each of the four Ls clearly before writing begins. 2. Give the team 8–10 minutes to write privately. 3. Reveal and read cards together. 4. Group Lacked and Longed For cards—these become your action pool. 5. Vote on the highest-priority gaps to address. 6. Convert top Lacked items into concrete asks with an owner and a deadline.",
    tips: [
      "The Longed For column often reveals strategic investments worth raising with leadership.",
      "Treat Learned as a celebration—acknowledge growth even in difficult sprints.",
      "Compare Lacked items across retros to track whether gaps are being closed."
    ]
  },
  "rose-thorn-bud": {
    fullName: "Rose Thorn Bud Retrospective",
    tagline: "Celebrate wins, name pain points, and spot emerging opportunities.",
    intro:
      "Rose Thorn Bud is a retrospective format that balances celebration with honest problem-naming—and uniquely asks the team to look forward at opportunities that could bloom into improvements.",
    columns: [
      {
        name: "Rose",
        description:
          "Positives worth celebrating. Wins from the sprint, smooth collaborations, successful deliveries, or moments of team growth."
      },
      {
        name: "Thorn",
        description:
          "Pain points and friction. Blockers, frustrations, process failures, or repeated problems that need addressing."
      },
      {
        name: "Bud",
        description:
          "Emerging opportunities. Ideas, experiments, or small signals that—if nurtured—could grow into significant improvements."
      }
    ],
    whenToUse:
      "Use Rose Thorn Bud when you want to balance celebration with honest problem-naming and forward-looking thinking. Effective after sprints where the team has mixed feelings—some wins, some frustrations, and nascent ideas worth exploring.",
    howToRun:
      "1. Set a positive, curious tone. 2. Give 8 minutes to write privately across all three columns. 3. Reveal Roses first to set a positive opening. 4. Group Thorns by theme and vote on the most impactful. 5. Read Buds together and discuss which opportunities are worth experimenting on next sprint. 6. Close with one Thorn to address and one Bud to pursue, each with an owner.",
    tips: [
      "Buds are the most valuable column—they represent innovation the team generates itself.",
      "Avoid letting Thorns dominate the discussion; timebox each theme.",
      "Track Buds across retros to see which experiments were tried and what the team learned."
    ]
  },
  daki: {
    fullName: "DAKI Retrospective (Drop, Add, Keep, Improve)",
    tagline: "Make deliberate process changes with four clear decision buckets.",
    intro:
      "DAKI stands for Drop, Add, Keep, Improve. It is a process-focused retrospective format that moves beyond identifying problems and asks the team to make concrete decisions about what to change, introduce, protect, and refine.",
    columns: [
      {
        name: "Drop",
        description:
          "What should the team stop doing entirely? Practices, meetings, or processes that cost more than they deliver and should be removed."
      },
      {
        name: "Add",
        description:
          "What new practices should the team introduce? Tools, ceremonies, or behaviours the team has not tried yet but believes would help."
      },
      {
        name: "Keep",
        description:
          "What is working well and should be explicitly continued? Protecting wins is as important as fixing problems."
      },
      {
        name: "Improve",
        description:
          "What works but could work better? Practices worth refining rather than replacing—small changes with compounding returns."
      }
    ],
    whenToUse:
      "DAKI works best when a team is ready to make deliberate process decisions—not just identify problems. Use it after a few regular retros, when the team has a clear sense of what is and is not working.",
    howToRun:
      "1. Brief the team on the four buckets—emphasise Drop and Improve as the action-rich columns. 2. Give 8–10 minutes to write privately. 3. Reveal and cluster by theme. 4. Vote on Drop and Improve themes with the highest impact. 5. Discuss root causes for top-voted items. 6. Close with one or two concrete changes, each with a named owner and a next-sprint check-in date.",
    tips: [
      "Drop is the hardest column—teams resist removing things even when they have stopped adding value.",
      "Distinguish Improve from Add: Improve refines something existing; Add introduces something new.",
      "Revisit DAKI decisions after two sprints to confirm changes actually happened."
    ]
  },
  "lean-coffee": {
    fullName: "Lean Coffee Retrospective",
    tagline: "Democratic, agenda-free discussion driven by the team's own priorities.",
    intro:
      "Lean Coffee is a structured but agenda-free meeting format. Instead of preset columns, the team generates their own discussion topics, votes to prioritise, and timeboxes each conversation—making it one of the most democratic retrospective formats available.",
    columns: [
      {
        name: "To Discuss",
        description:
          "Topics anyone on the team wants to talk about. No filtering—everything gets added and the group decides what rises to the top."
      },
      {
        name: "Discussing",
        description: "The current topic being discussed within its timebox. Visible to the whole group."
      },
      {
        name: "Discussed",
        description:
          "Completed topics. Cards move here when the timebox ends or the group votes to move on, keeping momentum high."
      }
    ],
    whenToUse:
      "Lean Coffee suits Kanban teams, product teams, or any group that prefers a bottom-up, self-directed format over a facilitator-prescribed structure. Excellent when the team has diverse, unpredictable topics that do not fit a standard template.",
    howToRun:
      "1. Give everyone 3–5 minutes to write topics they want to discuss—one per card. 2. Briefly read each card aloud. 3. Vote: each person has two or three dot-votes to allocate. 4. Sort cards by votes. 5. Discuss the top card with a 5–8 minute timebox. At the end of each timebox, the group votes thumbs up or down to continue for another timebox or move to the next topic. 6. Capture actions and learnings per completed topic.",
    tips: [
      "Keep timeboxes short—5 minutes is often enough to surface the action without debating the solution.",
      "Encourage quiet members to add cards before the vote so all voices shape the agenda.",
      "Capture the Discussed column as a retro summary so outcomes are not lost."
    ]
  },
  "team-health": {
    fullName: "Team Health Check Retrospective",
    tagline: "Track team wellbeing, collaboration, and delivery quality over time.",
    intro:
      "The Team Health Check is a retrospective format focused on the long-term health of the team rather than the details of a single sprint. Teams rate themselves across key dimensions and compare scores over time to spot trends and intervene before problems compound.",
    columns: [
      {
        name: "Collaboration",
        description:
          "How well is the team working together? Psychological safety, knowledge sharing, and cross-functional support."
      },
      {
        name: "Delivery",
        description:
          "How confident is the team in the quality and pace of what they ship? Predictability, technical debt awareness, and release confidence."
      },
      {
        name: "Support",
        description:
          "Does each person feel supported by teammates, leadership, and the wider organisation? Mentoring, tooling, and resource availability."
      },
      {
        name: "Wellbeing",
        description:
          "How is the team's energy and morale? Sustainable pace, recognition, and a sense of purpose in the work."
      }
    ],
    whenToUse:
      "Use the Team Health Check quarterly alongside regular retros—when you want to track team dynamics over time rather than sprint-level process issues. Especially useful after significant team changes, org restructures, or sustained high-pressure periods.",
    howToRun:
      "1. Ask each person to rate each dimension red (struggling), amber (OK but could improve), or green (healthy). 2. Aggregate scores and display the distribution—not individual answers. 3. Discuss one or two red or amber areas with curiosity, not blame. Ask: what would it take to move this to green? 4. Agree on one action per low-rated area. 5. Record scores in a shared log so trends become visible over time.",
    tips: [
      "Anonymous scoring reduces social pressure and produces more honest signals.",
      "Track scores over time—a single red is a signal; a persistent red is an emergency.",
      "Celebrate improvements—moving a dimension from amber to green is worth acknowledging explicitly."
    ]
  }
};
