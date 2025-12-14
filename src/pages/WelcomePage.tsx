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
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scale, ArrowRight, AlertCircle, Heart, Clock, Shield, Sparkles } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function WelcomePage() {
  const { caseState, resetCase } = useApp();
  const navigate = useNavigate();
  const hasProgress = caseState.currentIntakeStep > 0 || caseState.intakeCompleted;
  
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

        <main id="main-content" className="flex-1 pb-24">
          <div className="container mx-auto px-4 py-8">
            
            {/* Hero Section - Welcome */}
            <div className="min-h-[85vh] flex items-center justify-center">
              <div 
                ref={heroRef}
                className="text-center max-w-2xl w-full mx-auto bg-background rounded-3xl p-10 md:p-14 shadow-lg border border-border"
              >
                <div className="inline-flex items-center justify-center h-24 w-24 rounded-3xl bg-primary-light mb-8">
                  <Scale className="h-12 w-12 text-primary" />
                </div>
                
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                  {t('welcome.title')}
                </h2>
                
                <p className="text-xl text-muted-foreground mb-6">
                  {t('welcome.subtitle')}
                </p>
                
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {t('welcome.description')}
                </p>

                <p className="text-muted-foreground mb-4">
                  You deserve clarity, support, and a path forward. We are here to walk alongside you every step of the way.
                </p>

                <p className="text-sm text-muted-foreground animate-pulse mt-8">
                  Scroll down to learn more
                </p>
              </div>
            </div>

            {/* Empathy Section */}
            <div className="min-h-[80vh] flex items-center justify-center py-16">
              <div 
                ref={empathyRef}
                className="max-w-2xl w-full mx-auto"
              >
                <div className="bg-background rounded-3xl p-10 md:p-14 shadow-lg border border-border">
                  <Heart className="h-12 w-12 text-primary mx-auto mb-6" />
                  <h3 className="text-2xl md:text-3xl font-semibold text-foreground mb-6 text-center">
                    We understand what you are going through
                  </h3>
                  <div className="space-y-4 text-muted-foreground text-center">
                    <p className="text-lg leading-relaxed">
                      Facing workplace issues can feel overwhelming and isolating. You may feel confused about your rights, worried about deadlines, or unsure where to turn.
                    </p>
                    <p className="text-lg leading-relaxed">
                      It is completely normal to feel anxious, frustrated, or even scared. Many people in your situation feel the same way.
                    </p>
                    <p className="text-lg leading-relaxed font-medium text-foreground">
                      We are here to help guide you through this difficult time, one step at a time. You are not alone in this journey.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Section - Three cards side by side */}
            <div className="min-h-[70vh] flex items-center justify-center py-16">
              <div 
                ref={featuresRef}
                className="w-full max-w-4xl mx-auto"
              >
                <div className="grid gap-6 md:grid-cols-3">
                  
                  {/* Deadline Tracking Card */}
                  <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
                    <Clock className="h-10 w-10 text-primary mb-4" />
                    <h4 className="text-lg font-semibold text-foreground mb-3">Deadline Tracking</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      Never miss an important date. We help you understand your time limits so you can take action when it matters most.
                    </p>
                  </div>

                  {/* Step by Step Card */}
                  <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
                    <Shield className="h-10 w-10 text-primary mb-4" />
                    <h4 className="text-lg font-semibold text-foreground mb-3">Step by Step Guidance</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      The process can feel confusing. We break it down into clear, manageable steps so you always know what comes next.
                    </p>
                  </div>

                  {/* Plain Language Card */}
                  <div className="bg-card rounded-3xl p-8 shadow-lg border border-border">
                    <Sparkles className="h-10 w-10 text-primary mb-4" />
                    <h4 className="text-lg font-semibold text-foreground mb-3">Plain Language</h4>
                    <p className="text-muted-foreground leading-relaxed">
                      No confusing legal jargon. We explain everything in simple, easy-to-understand language that makes sense.
                    </p>
                  </div>

                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="min-h-[50vh] flex items-center justify-center py-16">
              <div 
                ref={disclaimerRef}
                className="max-w-2xl w-full mx-auto"
              >
                <div className="bg-status-warning-bg border-2 border-status-warning-border rounded-3xl p-8 md:p-10 shadow-lg">
                  <div className="flex flex-col items-center text-center gap-4">
                    <AlertCircle className="h-10 w-10 text-status-warning" />
                    <div>
                      <h4 className="font-semibold text-foreground mb-3 text-xl">Important Notice</h4>
                      <p className="text-foreground leading-relaxed">
                        {t('welcome.disclaimer')}
                      </p>
                      <p className="text-muted-foreground mt-4 text-sm">
                        We provide information and guidance, but for specific legal advice, please consult with a qualified professional.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="min-h-[60vh] flex items-center justify-center py-16">
              <div 
                ref={actionsRef}
                className="max-w-xl w-full mx-auto"
              >
                <div className="bg-background rounded-3xl p-10 md:p-14 shadow-lg border border-border">
                  <h3 className="text-2xl md:text-3xl font-semibold text-foreground text-center mb-4">
                    Ready to get started?
                  </h3>
                  <p className="text-muted-foreground text-center mb-8 text-lg">
                    Take the first step towards understanding your situation and your options. We will be with you every step of the way.
                  </p>
                  <div className="flex flex-col gap-4">
                    {hasProgress ? (
                      <>
                        <Button asChild size="lg" className="w-full min-h-tap text-lg py-6">
                          <Link to={caseState.intakeCompleted ? '/dashboard' : '/intake'}>
                            {t('welcome.continueButton')}
                            <ArrowRight className="ml-2 h-5 w-5" />
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="lg" 
                          className="w-full min-h-tap text-lg py-6"
                          onClick={handleStartNew}
                        >
                          {t('welcome.startButton')}
                        </Button>
                      </>
                    ) : (
                      <Button 
                        size="lg" 
                        className="w-full min-h-tap text-lg py-6"
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

          </div>
        </main>

        <BottomNav />
        <ChatWidget />
      </div>
    </div>
  );
}
