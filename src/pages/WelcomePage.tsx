import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ChatWidget } from '@/components/ChatWidget';
import { clearChatMessages } from '@/lib/chatStorage';
import DotGrid from '@/components/DotGrid';
import ScrollReveal from '@/components/ScrollReveal';
import { Scale, ArrowRight, AlertCircle, Heart, Clock, Shield } from 'lucide-react';

export default function WelcomePage() {
  const { caseState, resetCase } = useApp();
  const navigate = useNavigate();
  const hasProgress = caseState.currentIntakeStep > 0 || caseState.intakeCompleted;
  const sectionRefs = useRef<(HTMLElement | null)[]>([]);
  
  const handleStartNew = () => {
    resetCase();
    clearChatMessages();
    navigate('/intake');
  };

  // Intersection Observer to add visible class when sections come into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% of section is visible
        rootMargin: '0px',
      }
    );

    sectionRefs.current.forEach((section) => {
      if (section) {
        observer.observe(section);
      }
    });

    return () => {
      sectionRefs.current.forEach((section) => {
        if (section) {
          observer.unobserve(section);
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated Dot Grid Background */}
      <div className="fixed inset-0 z-0 w-screen h-screen">
        <DotGrid
          dotSize={108}
          gap={12}
          baseColor="#D4C4A8"
          activeColor="#B8763A"
          proximity={360}
          shockRadius={675}
          shockStrength={11.25}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col bg-transparent">
        <a href="#main-content" className="skip-link">
          {t('app.skipToMain')}
        </a>

        <Header />

        <main id="main-content" className="flex-1">
          {/* Hero Section - Welcome */}
          <section 
            ref={(el) => { sectionRefs.current[0] = el; }}
            className="welcome-section visible min-h-screen flex items-center justify-center snap-start"
          >
            <div className="w-full h-full flex items-center justify-center bg-background/95 backdrop-blur-sm">
              <div className="text-center max-w-4xl mx-auto px-6">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-primary-light mb-6">
                  <Scale className="h-10 w-10 text-primary" />
                </div>
                
                <ScrollReveal
                  baseOpacity={0}
                  enableBlur={true}
                  baseRotation={5}
                  blurStrength={10}
                  containerClassName="mb-6"
                >
                  {t('welcome.title')}
                </ScrollReveal>
                
                <ScrollReveal
                  baseOpacity={0.3}
                  enableBlur={true}
                  baseRotation={2}
                  blurStrength={6}
                  containerClassName="mb-6"
                  textClassName="text-lg text-muted-foreground"
                >
                  {t('welcome.subtitle')}
                </ScrollReveal>
                
                <ScrollReveal
                  baseOpacity={0.3}
                  enableBlur={true}
                  baseRotation={2}
                  blurStrength={6}
                  containerClassName="mb-4"
                  textClassName="text-muted-foreground"
                >
                  {t('welcome.description')}
                </ScrollReveal>

                <p className="text-sm text-muted-foreground animate-pulse">
                  Scroll down to learn more
                </p>
              </div>
            </div>
          </section>

          {/* Empathy Section */}
          <section 
            ref={(el) => { sectionRefs.current[1] = el; }}
            className="welcome-section min-h-screen flex items-center justify-center snap-start"
          >
            <div className="w-full h-full flex items-center justify-center bg-background/95 backdrop-blur-sm">
              <div className="max-w-4xl mx-auto px-6 text-center">
                <Heart className="h-12 w-12 text-primary mx-auto mb-6" />
                <ScrollReveal
                  baseOpacity={0}
                  enableBlur={true}
                  baseRotation={5}
                  blurStrength={10}
                  containerClassName="mb-6"
                >
                  We understand what you are going through
                </ScrollReveal>
                <ScrollReveal
                  baseOpacity={0.3}
                  enableBlur={true}
                  baseRotation={2}
                  blurStrength={6}
                  containerClassName="max-w-2xl mx-auto"
                  textClassName="text-base text-muted-foreground leading-relaxed"
                >
                  Facing workplace issues can feel overwhelming and isolating. You may feel confused about your rights, worried about deadlines, or unsure where to turn. We are here to help guide you through this difficult time, one step at a time.
                </ScrollReveal>
              </div>
            </div>
          </section>

          {/* Combined Section: Features, Disclaimer, and Action Buttons */}
          <section 
            ref={(el) => { sectionRefs.current[2] = el; }}
            className="welcome-section min-h-screen flex items-center justify-center snap-start"
          >
            <div className="max-w-5xl mx-auto px-6 w-full py-12 space-y-12">
              {/* Features Section - Three cards side by side */}
              <div className="grid gap-6 sm:grid-cols-3">
                
                {/* Deadline Tracking Card */}
                <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-border">
                  <Clock className="h-8 w-8 text-primary mb-4" />
                  <ScrollReveal
                    baseOpacity={0}
                    enableBlur={true}
                    baseRotation={5}
                    blurStrength={10}
                    textClassName="!text-base !font-semibold"
                    wordAnimationEnd="center center"
                  >
                    Deadline tracking to know your time limits
                  </ScrollReveal>
                </div>

                {/* Step by Step Card */}
                <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-border">
                  <Shield className="h-8 w-8 text-primary mb-4" />
                  <ScrollReveal
                    baseOpacity={0}
                    enableBlur={true}
                    baseRotation={5}
                    blurStrength={10}
                    textClassName="!text-base !font-semibold"
                    wordAnimationEnd="center+=50 center"
                  >
                    Step by step guidance so you know what comes next
                  </ScrollReveal>
                </div>

                {/* Plain Language Card */}
                <div className="bg-card/90 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-border">
                  <AlertCircle className="h-8 w-8 text-primary mb-4" />
                  <ScrollReveal
                    baseOpacity={0}
                    enableBlur={true}
                    baseRotation={5}
                    blurStrength={10}
                    textClassName="!text-base !font-semibold"
                    wordAnimationEnd="center+=100 center"
                  >
                    Plain language explanations without legal jargon
                  </ScrollReveal>
                </div>

              </div>

              {/* Disclaimer */}
              <div className="max-w-3xl mx-auto">
                <div className="bg-status-warning-bg/90 backdrop-blur-sm border-2 border-status-warning-border rounded-xl p-8 shadow-lg">
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-status-warning flex-shrink-0 mt-1" />
                    <div>
                      <ScrollReveal
                        baseOpacity={0}
                        enableBlur={true}
                        baseRotation={3}
                        blurStrength={8}
                        containerClassName="mb-2"
                        textClassName="font-semibold text-foreground text-lg"
                      >
                        Important Notice
                      </ScrollReveal>
                      <ScrollReveal
                        baseOpacity={0.3}
                        enableBlur={true}
                        baseRotation={2}
                        blurStrength={6}
                        textClassName="text-sm text-foreground leading-relaxed"
                      >
                        {t('welcome.disclaimer')}
                      </ScrollReveal>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="max-w-md mx-auto w-full">
                <div className="bg-background/90 backdrop-blur-sm rounded-xl p-8 shadow-lg border border-border">
                  <ScrollReveal
                    baseOpacity={0}
                    enableBlur={true}
                    baseRotation={3}
                    blurStrength={8}
                    containerClassName="text-center mb-6"
                    textClassName="text-xl font-semibold text-foreground"
                  >
                    Ready to get started?
                  </ScrollReveal>
                  <div className="flex flex-col gap-3">
                    {hasProgress ? (
                      <>
                        <Button asChild size="lg" className="w-full min-h-tap">
                          <Link to={caseState.intakeCompleted ? '/dashboard' : '/intake'}>
                            {t('welcome.continueButton')}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="w-full min-h-tap"
                          onClick={handleStartNew}
                        >
                          {t('welcome.startButton')}
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="lg" 
                        className="w-full min-h-tap"
                        onClick={handleStartNew}
                      >
                        {t('welcome.startButton')}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

        </main>

        <BottomNav />
        <ChatWidget />
      </div>
    </div>
  );
}
