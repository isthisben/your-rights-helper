import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { BottomNav } from '@/components/BottomNav';
import { ChatWidget } from '@/components/ChatWidget';
import { clearChatMessages } from '@/lib/chatStorage';
import DotGrid from '@/components/DotGrid';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scale, ArrowRight, AlertCircle, Heart, Clock, Shield, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function WelcomePage() {
  const { caseState, resetCase } = useApp();
  const navigate = useNavigate();
  
  // Check if there's any meaningful progress to continue from
  const hasExistingSession = caseState.currentIntakeStep > 0 || 
    caseState.intakeCompleted || 
    caseState.scenario !== null ||
    Object.keys(caseState.journeyProgress).length > 1; // More than just 'incident'
  
  const heroRef = useRef<HTMLDivElement>(null);
  const empathyRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const disclaimerRef = useRef<HTMLDivElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  
  const handleStartNew = () => {
    resetCase();
    clearChatMessages();
    navigate('/intake');
  };

  const handleContinue = () => {
    if (caseState.intakeCompleted) {
      navigate('/dashboard');
    } else {
      navigate('/intake');
    }
  };

  useEffect(() => {
    const sections = [heroRef, empathyRef, featuresRef, disclaimerRef, actionsRef];
    
    sections.forEach((ref) => {
      if (!ref.current) return;
      
      gsap.set(ref.current, { opacity: 0, y: 40, filter: 'blur(8px)' });
      
      gsap.to(ref.current, {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          end: 'top 20%',
          toggleActions: 'play reverse play reverse',
          scrub: 0.5,
        }
      });
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
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
        />
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col bg-transparent">
        <a href="#main-content" className="skip-link">
          {t('app.skipToMain')}
        </a>

        <main id="main-content" className="flex-1 pb-24">
          <div className="container mx-auto px-4 py-8 max-w-6xl">
            
            {/* Hero Section - Welcome */}
            <div className="min-h-[90vh] flex items-center justify-center">
              <div 
                ref={heroRef}
                className="text-center w-full mx-auto bg-background rounded-[2rem] p-12 md:p-20 shadow-xl border border-border"
              >
                <div className="inline-flex items-center justify-center h-28 w-28 rounded-[2rem] bg-primary-light mb-10">
                  <Scale className="h-14 w-14 text-primary animate-float" />
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-8">
                  {t('welcome.title')}
                </h2>
                
                <p className="text-2xl md:text-3xl text-muted-foreground mb-8">
                  {t('welcome.subtitle')}
                </p>
                
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                  {t('welcome.description')}
                </p>

                <p className="text-lg text-muted-foreground animate-pulse mt-12">
                  Scroll down to learn more
                </p>
              </div>
            </div>

            {/* Empathy Section */}
            <div className="min-h-[85vh] flex items-center justify-center py-20">
              <div 
                ref={empathyRef}
                className="w-full mx-auto"
              >
                <div className="bg-background rounded-[2rem] p-12 md:p-20 shadow-xl border border-border">
                  <Heart className="h-16 w-16 text-primary mx-auto mb-8 animate-float" />
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground mb-10 text-center">
                    We understand what you are going through
                  </h3>
                  <div className="space-y-6 text-muted-foreground text-center max-w-4xl mx-auto">
                    <p className="text-xl md:text-2xl leading-relaxed">
                      Facing workplace issues can feel overwhelming and isolating.
                    </p>
                    <p className="text-xl md:text-2xl leading-relaxed">
                      It is completely normal to feel anxious or unsure.
                    </p>
                    <p className="text-xl md:text-2xl leading-relaxed font-medium text-foreground">
                      You are not alone in this journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section - Three cards side by side */}
            <div className="min-h-[75vh] flex items-center justify-center py-20">
              <div 
                ref={featuresRef}
                className="w-full mx-auto"
              >
                <div className="grid gap-8 md:grid-cols-3">
                  
                  {/* Deadline Tracking Card */}
                  <div className="bg-card rounded-[2rem] p-10 md:p-12 shadow-xl border border-border flex flex-col items-center text-center">
                    <Clock className="h-14 w-14 text-primary mb-6 animate-float" style={{ animationDelay: '0s' }} />
                    <h4 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">Deadline Tracking</h4>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                      Never miss an important date.
                    </p>
                  </div>

                  {/* Step by Step Card */}
                  <div className="bg-card rounded-[2rem] p-10 md:p-12 shadow-xl border border-border flex flex-col items-center text-center">
                    <Shield className="h-14 w-14 text-primary mb-6 animate-float" style={{ animationDelay: '0.5s' }} />
                    <h4 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">Step by Step</h4>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                      Always know what comes next.
                    </p>
                  </div>

                  {/* Plain Language Card */}
                  <div className="bg-card rounded-[2rem] p-10 md:p-12 shadow-xl border border-border flex flex-col items-center text-center">
                    <Sparkles className="h-14 w-14 text-primary mb-6 animate-float" style={{ animationDelay: '1s' }} />
                    <h4 className="text-2xl md:text-3xl font-semibold text-foreground mb-4">Plain Language</h4>
                    <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                      No confusing legal jargon.
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="min-h-[55vh] flex items-center justify-center py-20">
              <div 
                ref={disclaimerRef}
                className="w-full mx-auto"
              >
                <div className="bg-status-warning-bg border-2 border-status-warning-border rounded-[2rem] p-12 md:p-16 shadow-xl">
                  <div className="flex flex-col items-center text-center gap-6">
                    <AlertCircle className="h-14 w-14 text-status-warning animate-float" />
                    <div className="max-w-3xl">
                      <h4 className="font-semibold text-foreground mb-4 text-2xl md:text-3xl">Important Notice</h4>
                      <p className="text-lg md:text-xl text-foreground leading-relaxed">
                        {t('welcome.disclaimer')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="min-h-[65vh] flex items-center justify-center py-20">
              <div 
                ref={actionsRef}
                className="w-full mx-auto"
              >
                <div className="bg-background rounded-[2rem] p-12 md:p-20 shadow-xl border border-border">
                  <h3 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-foreground text-center mb-6">
                    Ready to get started?
                  </h3>
                  <p className="text-muted-foreground text-center mb-12 text-xl md:text-2xl max-w-2xl mx-auto">
                    Take the first step towards clarity.
                  </p>
                  <div className="flex flex-col gap-5 max-w-md mx-auto">
                    {hasExistingSession && (
                      <Button 
                        size="lg" 
                        className="w-full min-h-tap text-xl py-7"
                        onClick={handleContinue}
                      >
                        {t('welcome.continueButton')}
                        <ArrowRight className="ml-2 h-6 w-6" />
                      </Button>
                    )}
                    <Button 
                      variant={hasExistingSession ? "outline" : "default"}
                      size="lg" 
                      className="w-full min-h-tap text-xl py-7"
                      onClick={handleStartNew}
                    >
                      {hasExistingSession ? t('welcome.startButton') : t('welcome.startButton')}
                      {!hasExistingSession && <ArrowRight className="ml-2 h-6 w-6" />}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </main>

        <BottomNav />
        <ChatWidget />
      </div>
    </div>
  );
}
