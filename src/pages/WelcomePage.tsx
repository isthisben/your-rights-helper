import React from 'react';
import { Link } from 'react-router-dom';
import { t } from '@/lib/i18n';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ChatWidget } from '@/components/ChatWidget';
import { Scale, ArrowRight, AlertCircle, Shield, Clock } from 'lucide-react';

export default function WelcomePage() {
  const { caseState } = useApp();
  const hasProgress = caseState.currentIntakeStep > 0 || caseState.intakeCompleted;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip link */}
      <a href="#main-content" className="skip-link">
        {t('app.skipToMain')}
      </a>

      <Header />

      <main id="main-content" className="flex-1 pb-24">
        <div className="container mx-auto px-3 py-6">
          {/* Hero Section */}
          <div className="text-center max-w-lg mx-auto animate-fade-in">
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
            <div className="bg-card rounded-lg p-4 border border-border">
              <Clock className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium text-sm">Deadline tracking</h3>
              <p className="text-xs text-muted-foreground mt-1">Know your time limits</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <Shield className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium text-sm">Step by step guide</h3>
              <p className="text-xs text-muted-foreground mt-1">See what comes next</p>
            </div>
            <div className="bg-card rounded-lg p-4 border border-border">
              <AlertCircle className="h-6 w-6 text-primary mb-2" />
              <h3 className="font-medium text-sm">Plain language</h3>
              <p className="text-xs text-muted-foreground mt-1">Easy to understand</p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-status-warning-bg border-2 border-status-warning-border rounded-lg p-4 max-w-lg mx-auto mb-8">
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
                <Button asChild variant="outline" size="lg" className="w-full min-h-tap">
                  <Link to="/intake">
                    {t('welcome.startButton')}
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="w-full min-h-tap text-lg">
                <Link to="/intake">
                  {t('welcome.startButton')}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
      <ChatWidget />
    </div>
  );
}
