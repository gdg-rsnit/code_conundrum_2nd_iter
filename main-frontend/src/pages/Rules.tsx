import StarfieldBackground from '@/components/StarfieldBackground';


const rules = [
  { num: '01', title: 'NO AI TOOLS ALLOWED', desc: 'Any use of AI assistants, chatbots, or code generation tools is strictly prohibited during all rounds.' },
  { num: '02', title: 'ACCURACY + SPEED = VICTORY', desc: 'Teams are ranked by correct matches first, then by time taken. Faster accurate submissions rank higher.' },
  { num: '03', title: 'NO SWITCHING AFTER SUBMIT', desc: 'Once the timer ends or you submit, all answers are locked. No changes permitted after submission.' },
  { num: '04', title: 'TEAM SIZE: 2 MEMBERS', desc: 'Each team must have exactly 2 members. Solo entries or teams larger than 2 will not be permitted to participate.' },
  { num: '05', title: 'FOLLOW ORGANIZER INSTRUCTIONS', desc: 'All decisions made by event organizers are final. Disputes will be resolved by the coordinators.' },
  { num: '06', title: 'NO INTER-TEAM COMMUNICATION', desc: 'Discussing answers or signaling other teams during a round is grounds for immediate disqualification.' },
];

const Rules = () => {
  return (
    <div className="relative min-h-screen scanline-overlay">
      <StarfieldBackground showClouds={false} showPlanets opacity={0.5} />


      <div className="relative z-10 pt-24 pb-16 px-4 flex flex-col items-center">
        <h1
          className="font-pixel text-lg md:text-2xl text-primary text-center mb-12"
          style={{ filter: 'drop-shadow(0 0 8px #00F5FF)' }}
        >
          MISSION RULES
        </h1>

        <div className="w-full max-w-[800px] space-y-4">
          {rules.map(rule => (
            <div
              key={rule.num}
              className="bg-space-navy border-l-4 border-l-primary px-6 py-5 flex items-start gap-4 transition-all hover:bg-muted hover:border-l-primary"
              style={{ borderRadius: 0 }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.filter = 'drop-shadow(0 0 8px #00F5FF)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.filter = 'none';
              }}
            >
              <div className="w-7 h-7 flex-shrink-0 border-2 border-primary bg-space-navy flex items-center justify-center">
                <span className="font-pixel text-[10px] text-primary">{rule.num}</span>
              </div>
              <div>
                <h3 className="font-pixel text-[10px] text-foreground mb-2">{rule.title}</h3>
                <p className="font-mono-tech text-xs text-muted-foreground leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="font-mono-tech text-[11px] text-muted-foreground/60">All rules subject to organizer discretion.</p>
          <p className="font-mono-tech text-[11px] text-muted-foreground/60 mt-1">
          </p>
        </div>
      </div>
    </div>
  );
};

export default Rules;
