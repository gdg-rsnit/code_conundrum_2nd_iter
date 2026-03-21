import StarfieldBackground from '@/components/StarfieldBackground';
import PixelButton from '@/components/PixelButton';
import PixelCard from '@/components/PixelCard';

import MarqueeStrip from '@/components/MarqueeStrip';
import GdgLogo from '@/components/GdgLogo';
import { ClockIcon, TeamIcon, TrophyIcon, RoundsIcon, PixelRocket, PixelSatellite, StarPixel } from '@/components/PixelIcons';
import { Link } from 'react-router-dom';

const eventMeta = [
  { icon: <ClockIcon size={20} />, label: '1 HR 30 MINS' },
  { icon: <TeamIcon size={20} />, label: '2 PER TEAM' },
  { icon: <TrophyIcon size={20} />, label: 'RS. 5000 PRIZE' },
  { icon: <RoundsIcon size={20} />, label: '3 ROUNDS' },
];

const rounds = [
  {
    num: '01',
    title: 'DECRYPTION',
    questions: '8 Questions',
    decoys: '1 Decoy snippet',
    time: '30 Minutes',
    qualify: 'Top 60% advance',
  },
  {
    num: '02',
    title: 'COMPILATION',
    questions: '6 Questions',
    decoys: '2 Decoy snippets',
    time: '25 Minutes',
    qualify: 'Top 40% advance',
  },
  {
    num: '03',
    title: 'EXECUTION',
    questions: '5 Questions',
    decoys: '3 Decoy snippets',
    time: '35 Minutes',
    qualify: 'Winners decided',
  },
];

const Index = () => {
  const hasRegistration = Boolean(
    localStorage.getItem('cc_user') || localStorage.getItem('cc_team')
  );
  const joinContestPath = hasRegistration ? '/waiting-room' : '/register';

  return (
    <div className="relative min-h-screen scanline-overlay">
      <StarfieldBackground showClouds showPlanets />


      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-16">
        {/* Floating pixel rocket */}
        <div className="absolute left-[5%] top-[40%] animate-rocket">
          <PixelRocket size={32} />
        </div>
        {/* Floating satellite */}
        <div className="absolute right-[8%] top-[30%] animate-satellite">
          <PixelSatellite size={48} />
        </div>

        <h1 className="font-pixel text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground neon-text-cyan text-center leading-relaxed mb-4">
          <span className="title-glitch-wrap">
            <span className="title-ghost">CODE CONUNDRUM</span>
            <span className="title-main">CODE CONUNDRUM</span>
          </span>
        </h1>

        {/* GDG badge */}
        <div className="flex items-center gap-2 mb-6 px-[14px] py-[6px] bg-space-navy border border-muted-foreground/20">
          <GdgLogo height={22} />
          <span className="font-pixel text-[8px] text-muted-foreground tracking-[2px]" style={{ marginLeft: '8px' }}>
            Presented by GDGoC RNSIT
          </span>
        </div>

        <p className="font-pixel text-[10px] sm:text-xs md:text-sm text-secondary neon-text-magenta text-center mb-8">
          MATCH THE CODE. BEAT THE CLOCK.
        </p>

        {/* Event meta cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-10 max-w-3xl w-full">
          {eventMeta.map((item) => (
            <div
              key={item.label}
              className="bg-space-navy pixel-border neon-glow-cyan p-3 text-center"
            >
              <div className="flex justify-center mb-2">{item.icon}</div>
              <div className="font-pixel text-[7px] md:text-[8px] text-foreground leading-relaxed">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link to={joinContestPath}>
            <PixelButton variant="primary" pixelSize="lg">
              JOIN CONTEST
            </PixelButton>
          </Link>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 font-pixel text-[8px] text-muted-foreground animate-float">
          SCROLL FOR MISSION BRIEFING
        </div>
      </section>

      {/* Mission Briefing Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-pixel text-lg md:text-2xl text-primary neon-text-cyan text-center mb-12">
            MISSION BRIEFING<span className="animate-blink-cursor">_</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            <PixelCard variant="violet" header="OBJECTIVE">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Code Conundrum is a competitive coding puzzle event where teams
                race to match code snippets to their corresponding problem
                statements. Speed and accuracy determine your rank in the
                galactic leaderboard.
              </p>
            </PixelCard>

            <PixelCard variant="violet" header="HOW IT WORKS">
              <ol className="text-sm text-muted-foreground space-y-3">
                <li className="flex gap-2">
                  <span className="text-primary font-pixel text-[8px]">01.</span>
                  Read the problem statements on the left panel
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-pixel text-[8px]">02.</span>
                  Drag matching code snippets from the right panel
                </li>
                <li className="flex gap-2">
                  <span className="text-primary font-pixel text-[8px]">03.</span>
                  Drop them into the correct slots before time runs out
                </li>
              </ol>
            </PixelCard>

            <PixelCard variant="violet" header="RULES">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex gap-2">
                  <span className="text-secondary font-pixel text-[8px]">&gt;</span> 2 members per team
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary font-pixel text-[8px]">&gt;</span> No AI tools allowed
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary font-pixel text-[8px]">&gt;</span> Accuracy + Speed = Score
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary font-pixel text-[8px]">&gt;</span> Decoy snippets included
                </li>
                <li className="flex gap-2">
                  <span className="text-secondary font-pixel text-[8px]">&gt;</span> Answers can be swapped
                </li>
              </ul>
            </PixelCard>
          </div>
        </div>
      </section>

      {/* Rounds Section */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-pixel text-lg md:text-2xl text-primary neon-text-cyan text-center mb-12">
            MISSION STAGES
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {rounds.map((round) => (
              <PixelCard key={round.num} variant="cyan" glow>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 pixel-border-magenta neon-glow-magenta flex items-center justify-center">
                    <span className="font-pixel text-xs text-secondary">{round.num}</span>
                  </div>
                  <span className="font-pixel text-[10px] text-foreground">{round.title}</span>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Questions:</span>
                    <span className="text-foreground">{round.questions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Decoys:</span>
                    <span className="text-foreground">{round.decoys}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time:</span>
                    <span className="text-foreground">{round.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Advance:</span>
                    <span className="text-primary">{round.qualify}</span>
                  </div>
                </div>
              </PixelCard>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="relative z-10">
        <MarqueeStrip text="NO AI TOOLS ALLOWED * ACCURACY + SPEED = VICTORY * GOOD LUCK CADET * GDGoC RNSIT x LUMINUS 2026 *" />
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-10 px-4 bg-space-navy/80 border-t-4 border-primary/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <GdgLogo height={30} />
            <div>
              <div className="font-pixel text-[8px] text-foreground">GDGoC RNSIT</div>
              <div className="font-mono-tech text-[10px] text-muted-foreground">Google Developer Groups on Campus</div>
            </div>
          </div>
          <div className="font-pixel text-[8px] text-muted-foreground text-center">
            <span className="text-primary">Pranava G Rao</span> | <span className="text-primary">D Kartikeya</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
