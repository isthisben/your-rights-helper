import React, { useState } from 'react';
import { t } from '@/lib/i18n';
import { Header } from '@/components/Header';
import { BottomNav } from '@/components/BottomNav';
import { ChatWidget } from '@/components/ChatWidget';
import { ContactHumanButton } from '@/components/ContactHumanButton';
import { useApp } from '@/context/AppContext';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { 
  AlertTriangle, 
  HelpCircle, 
  MessageSquare, 
  Phone,
  Search,
  FileText,
  Clock,
  Users,
  Gavel,
  Scale
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'what-is-acas',
    question: 'What is ACAS?',
    answer: 'ACAS stands for Advisory, Conciliation and Arbitration Service. Before you can go to an employment tribunal, you must contact ACAS first. This is called Early Conciliation. ACAS will try to help you and your employer reach an agreement without going to tribunal. It is free.',
    category: 'acas',
  },
  {
    id: 'acas-mandatory',
    question: 'Do I have to contact ACAS?',
    answer: 'Yes. In most cases, you must contact ACAS before making a tribunal claim. If you skip ACAS, the tribunal may not accept your claim. There are very few exceptions.',
    category: 'acas',
  },
  {
    id: 'what-is-et1',
    question: 'What is an ET1 form?',
    answer: 'The ET1 is the form you fill in to start your tribunal claim. It asks for your details, your employer\'s details, and what happened. You submit it online at the government website.',
    category: 'tribunal',
  },
  {
    id: 'time-limit',
    question: 'How long do I have to make a claim?',
    answer: 'For most claims, you have 3 months minus 1 day from the date the problem happened. Time spent in ACAS Early Conciliation does not count toward this limit. Act quickly – time limits are strict.',
    category: 'deadlines',
  },
  {
    id: 'miss-deadline',
    question: 'What if I miss the deadline?',
    answer: 'Missing the deadline usually means you cannot make a claim. In rare cases, the tribunal may extend the time if it was not reasonably practicable to claim in time. Talk to an advisor urgently if you are close to or past the deadline.',
    category: 'deadlines',
  },
  {
    id: 'what-is-witness-statement',
    question: 'What is a witness statement?',
    answer: 'A witness statement is your story written in your own words. It explains who you are, what happened, and how it affected you. The tribunal will read it before the hearing. You must sign it and say it is true.',
    category: 'documents',
  },
  {
    id: 'schedule-of-loss',
    question: 'What is a schedule of loss?',
    answer: 'A schedule of loss lists the money you have lost because of what happened. This includes past wages, future wages, lost benefits, and injury to feelings. The tribunal uses this to decide how much compensation you should get.',
    category: 'documents',
  },
  {
    id: 'what-is-bundle',
    question: 'What is a bundle?',
    answer: 'A bundle is a folder of all the important documents in your case. It includes contracts, emails, letters, and other evidence. You and your employer both have copies. The tribunal reads the bundle before and during the hearing.',
    category: 'documents',
  },
  {
    id: 'need-lawyer',
    question: 'Do I need a lawyer?',
    answer: 'You do not have to have a lawyer. Many people represent themselves. But employment law can be complex. If you can afford a lawyer or qualify for free help, it may make things easier.',
    category: 'help',
  },
  {
    id: 'free-help',
    question: 'Where can I get free help?',
    answer: 'ACAS has a free helpline. Citizens Advice offers free guidance. LawWorks and other charities may offer free legal help in some cases. Use the "Talk to someone" button in this app to see contact details.',
    category: 'help',
  },
  {
    id: 'what-is-hearing',
    question: 'What happens at a hearing?',
    answer: 'At a hearing, you and your employer tell your sides of the story. A judge (and sometimes panel members) asks questions. Witnesses may be called. At the end, the tribunal makes a decision.',
    category: 'tribunal',
  },
  {
    id: 'how-long-hearing',
    question: 'How long does a hearing take?',
    answer: 'Simple cases may be heard in one day. Complex cases can take several days or weeks. The tribunal will tell you how many days are scheduled.',
    category: 'tribunal',
  },
];

const CATEGORIES = [
  { id: 'all', label: 'All', icon: HelpCircle },
  { id: 'acas', label: 'ACAS', icon: Users },
  { id: 'deadlines', label: 'Deadlines', icon: Clock },
  { id: 'tribunal', label: 'Tribunal', icon: Gavel },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'help', label: 'Getting Help', icon: Scale },
];

export default function FAQPage() {
  const { caseState } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredFAQs = FAQ_ITEMS.filter(item => {
    const matchesSearch = searchTerm === '' || 
      item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <a href="#main-content" className="skip-link">
        {t('app.skipToMain')}
      </a>

      <Header />

      <main id="main-content" className="flex-1 pb-24">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Page title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <HelpCircle className="h-6 w-6 text-primary" />
                {t('faq.title')}
              </h1>
              <p className="text-muted-foreground">{t('faq.subtitle')}</p>
            </div>

            {/* Legal disclaimer card */}
            <Card className="bg-status-warning-bg border-status-warning-border colorblind-pattern-warning">
              <CardContent className="flex items-start gap-3 p-4">
                <AlertTriangle className="h-5 w-5 text-status-warning flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="font-medium text-foreground">{t('faq.disclaimerTitle')}</p>
                  <p className="text-sm text-muted-foreground mt-1">{t('faq.disclaimer')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick actions */}
            <div className="flex flex-wrap gap-3">
              <ContactHumanButton />
              <Button 
                variant="outline" 
                className="min-h-tap gap-2"
                onClick={() => {
                  const chatButton = document.querySelector('[data-chat-toggle]') as HTMLButtonElement;
                  if (chatButton) chatButton.click();
                }}
              >
                <MessageSquare className="h-4 w-4" />
                {t('faq.askChatbot')}
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('faq.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 min-h-tap"
                aria-label={t('faq.searchPlaceholder')}
              />
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(category => {
                const Icon = category.icon;
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    size="sm"
                    className="min-h-tap gap-1"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {category.label}
                  </Button>
                );
              })}
            </div>

            {/* FAQ Accordion */}
            <Accordion type="single" collapsible className="space-y-2">
              {filteredFAQs.map(item => (
                <AccordionItem 
                  key={item.id} 
                  value={item.id}
                  className="border border-border rounded-lg px-4 bg-card"
                >
                  <AccordionTrigger className="text-left py-4 hover:no-underline">
                    <span className="font-medium">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-muted-foreground leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
              
              {filteredFAQs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{t('faq.noResults')}</p>
                </div>
              )}
            </Accordion>

            {/* Footer help */}
            <Card className="bg-primary-light border-primary/20">
              <CardContent className="p-4 space-y-3">
                <h3 className="font-medium text-foreground">{t('faq.stillNeedHelp')}</h3>
                <p className="text-sm text-muted-foreground">{t('faq.stillNeedHelpDesc')}</p>
                <div className="flex flex-wrap gap-3">
                  <ContactHumanButton />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <BottomNav />
      <ChatWidget />
    </div>
  );
}
