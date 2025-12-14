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
import { Scale, ArrowRight, AlertCircle, Shield, Clock } from 'lucide-react';

export default function WelcomePage() {
  const { caseState, resetCase } = useApp();
  const navigate = useNavigate();
  const hasProgress = caseState.currentIntakeStep > 0 || caseState.intakeCompleted;
  
  const handleStartNew = () => {
    // Reset all case state to default (new user)
    resetCase();
    // Clear chat messages for a fresh start
    clearChatMessages();
    // Navigate to intake
    navigate('/intake');
  };

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Animated Dot Grid Background - fills entire screen */}
      <div className="fixed inset-0 z-0 w-screen h-screen">
        <DotGrid
          dotSize={108}
          gap={12}
          baseColor="#D4C4A8"
          activeColor="#B8763A"
          proximity={160}
          shockRadius={300}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        />
      </div>
      
      {/* Content overlay */}
      <div className="relative z-10 min-h-screen flex flex-col bg-transparent">
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        {t('app.skipToMain')}
      </a>

      <Header />

      <main id="main-content" className="flex-1 pb-24">
        <div className="container mx-auto px-3 py-6">
          {/* Hero Section */}
          <div className="text-center max-w-lg mx-auto animate-fade-in bg-background rounded-2xl p-6 shadow-md">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-primary-light mb-6">
              <Scale className="h-10 w-10 text-primary" />
            </div>
            
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              {t('welcome.title')}
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              {t('welcome.subtitle')}
            </p>
            
            <p className="text-muted-foreground mb-8">
              {t('welcome.description')}
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-4 sm:grid-cols-3 max-w-2xl mx-auto my-8">
            <div className="bg-card rounded-lg p-4 border border-border shadow-md">
              <Clock className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium text-sm">Deadline tracking</h3>
              <p className="text-xs text-muted-foreground mt-1">Know your time limits</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border shadow-md">
              <Shield className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium text-sm">Step by step guide</h3>
              <p className="text-xs text-muted-foreground mt-1">See what comes next</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border shadow-md">
              <AlertCircle className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium text-sm">Plain language</h3>
              <p className="text-xs text-muted-foreground mt-1">Easy to understand</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-status-warning-bg border-2 border-status-warning-border rounded-lg p-4 max-w-lg mx-auto mb-8 shadow-md">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-status-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                {t('welcome.disclaimer')}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 max-w-sm mx-auto">
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
      </main>

      <BottomNav />
      <ChatWidget />
      </div>
    </div>
  );
}
