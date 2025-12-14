import React from 'react';
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
  
  const handleStartNew = () => {
    resetCase();
    clearChatMessages();
    navigate('/intake');
  };

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
          <div className="container mx-auto px-3 py-6">
            
            {/* Hero Section - Welcome */}
            <div className="min-h-[70vh] flex items-center justify-center">
              <div className="text-center max-w-lg mx-auto animate-fade-in bg-background rounded-2xl p-8 shadow-md">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-primary-light mb-6">
                  <Scale className="h-10 w-10 text-primary" />
                </div>
                
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {t('welcome.title')}
                </h2>
                
                <p className="text-lg text-muted-foreground mb-6">
                  {t('welcome.subtitle')}
                </p>
                
                <p className="text-muted-foreground mb-4">
                  {t('welcome.description')}
                </p>

                <p className="text-sm text-muted-foreground animate-pulse">
                  Scroll down to learn more
                </p>
              </div>
            </div>

            {/* Empathy Section */}
            <div className="min-h-[60vh] flex items-center justify-center py-16">
              <div className="max-w-2xl mx-auto text-center">
                <div className="bg-background rounded-2xl p-8 shadow-md">
                  <Heart className="h-12 w-12 text-primary mx-auto mb-6" />
                  <h3 className="text-xl font-semibold text-foreground mb-4">
                    We understand what you are going through
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Facing workplace issues can feel overwhelming and isolating. You may feel confused about your rights, worried about deadlines, or unsure where to turn. We are here to help guide you through this difficult time, one step at a time.
                  </p>
                </div>
              </div>
            </div>

            {/* Features Section - Three cards side by side, each with ScrollReveal */}
            <div className="min-h-[60vh] flex items-center justify-center py-16">
              <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
                
                {/* Deadline Tracking Card */}
                <div className="bg-background rounded-2xl p-6 shadow-md">
                  <Clock className="h-10 w-10 text-primary mb-4" />
                  <ScrollReveal
                    baseOpacity={0}
                    enableBlur={true}
                    baseRotation={5}
                    blurStrength={10}
                  >
                    Deadline tracking to know your time limits
                  </ScrollReveal>
                </div>

                {/* Step by Step Card */}
                <div className="bg-background rounded-2xl p-6 shadow-md">
                  <Shield className="h-10 w-10 text-primary mb-4" />
                  <ScrollReveal
                    baseOpacity={0}
                    enableBlur={true}
                    baseRotation={5}
                    blurStrength={10}
                  >
                    Step by step guidance so you know what comes next
                  </ScrollReveal>
                </div>

                {/* Plain Language Card */}
                <div className="bg-background rounded-2xl p-6 shadow-md">
                  <AlertCircle className="h-10 w-10 text-primary mb-4" />
                  <ScrollReveal
                    baseOpacity={0}
                    enableBlur={true}
                    baseRotation={5}
                    blurStrength={10}
                  >
                    Plain language explanations without legal jargon
                  </ScrollReveal>
                </div>

              </div>
            </div>

            {/* Disclaimer */}
            <div className="py-16">
              <div className="bg-status-warning-bg border-2 border-status-warning-border rounded-lg p-6 max-w-lg mx-auto shadow-md">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-status-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Important Notice</h4>
                    <p className="text-sm text-foreground">
                      {t('welcome.disclaimer')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="py-16 min-h-[50vh] flex items-center justify-center">
              <div className="bg-background rounded-2xl p-8 shadow-md max-w-sm mx-auto w-full">
                <h3 className="text-xl font-semibold text-foreground text-center mb-6">
                  Ready to get started?
                </h3>
                <div className="flex flex-col gap-3">
                  {hasProgress ? (
                    <>
                      <Button asChild size="lg" className="w-full min-h-tap text-lg">
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
                      className="w-full min-h-tap text-lg"
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
        </main>

        <BottomNav />
        <ChatWidget />
      </div>
    </div>
  );
}
