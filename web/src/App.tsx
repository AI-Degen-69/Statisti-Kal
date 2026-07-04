import { Suspense, lazy, useState, useCallback, useEffect, useMemo } from 'react';
import { Joyride, Step, CallBackProps } from 'react-joyride';
import LandingPage from './components/LandingPage';
import SiteFooter from './components/SiteFooter';
import SiteHeader, { type SitePage } from './components/SiteHeader';
import { PageLayout } from './components/ui/PageLayout';
import { PageTransition } from './components/PageTransition';
import type { CalcMode } from './components/calc-ui';

const JoyrideComponent = Joyride as any;

type ActivePage = 'landing' | 'hypothesis' | 'normal';
type TourType = 'global' | 'hypothesis' | 'normal' | 'table' | 'formula' | null;

const HypothesisTestingCalculator = lazy(() => import('./components/HypothesisTestingCalculator'));
const NormalDistributionCalculator = lazy(() => import('./components/NormalDistributionCalculator'));

export default function App() {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [normalMode, setNormalMode] = useState<CalcMode>('hypothesis');

  // Tour State
  const [activeTour, setActiveTour] = useState<TourType>(null);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  const handleNavigate = useCallback((page: SitePage) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (page === 'landing' || page === 'hypothesis') {
      setActivePage(page);
      return;
    }
    try {
      window.localStorage.setItem('ND_mode', JSON.stringify(page));
    } catch {}
    setNormalMode(page);
    setActivePage('normal');
  }, []);

  const handleStartGlobalTour = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTourStepIndex(0);
    setActiveTour('global');
  }, []);

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { action, index, status, type } = data;
    if (status === 'finished' || status === 'skipped') {
      setActiveTour(null);
      setTourStepIndex(0);
      return;
    }
    if (type === 'step:after') {
      if (action === 'next') setTourStepIndex(index + 1);
      else if (action === 'prev') setTourStepIndex(index - 1);
    }
  }, []);

  // Handle tour navigation side effects
  useEffect(() => {
    if (activeTour === 'global') {
      if (tourStepIndex === 1) handleNavigate('hypothesis');
      else if (tourStepIndex === 4) handleNavigate('table');
      else if (tourStepIndex === 5) handleNavigate('formula-sheet');
      else if (tourStepIndex === 6) handleNavigate('landing');
    } else if (activeTour === 'hypothesis') {
      if (tourStepIndex === 6) {
        // Open the confidence interval accordion programmatically
        const accordion = document.getElementById('confidence-panel');
        if (accordion && !accordion.hasAttribute('open')) {
            const btn = accordion.querySelector('button');
            if (btn) btn.click();
        }
      }
    }
  }, [tourStepIndex, activeTour, handleNavigate]);

  const globalSteps: Step[] = useMemo(() => [
    { target: 'body', content: 'ברוכים הבאים למערכת הסטטיסטיקה שלנו! הסיור הזה יעבור על המערכת כולה ויציג את הכלים השונים.', placement: 'center', disableBeacon: true },
    { target: '.tour-step-inputs', content: 'לדוגמה, במחשבון בדיקת ההשערות כאן מזינים את הנתונים...', placement: 'bottom' },
    { target: '.tour-step-toc-button', content: 'כפתור ניווט מהיר עוזר לכם לנווט בקלות לכל חלק בעמוד.', placement: 'top-start' },
    { target: '.tour-step-jump-to-top', content: 'תמיד תוכלו לחזור לראש העמוד בלחיצה אחת.', placement: 'top-start' },
    { target: '.tour-step-nav-table', content: 'יש לנו גם עמוד טבלאות נפרד עם כל טבלאות ההתפלגות תחת קורת גג אחת.', placement: 'bottom' },
    { target: '.tour-step-nav-formula-sheet', content: 'וכמובן עמוד נוסחאות שכולל את כל הנוסחאות הנלמדות בקורס.', placement: 'bottom' },
    { target: 'body', content: 'סיימנו את הסיור המהיר. תהנו מהשימוש במערכת!', placement: 'center' }
  ], []);

  const hypothesisSteps: Step[] = useMemo(() => [
        {
            target: '.tour-step-intro',
            content: 'ברוכים הבאים למחשבון בדיקת ההשערות! כאן תוכלו לבחון נתונים ולחשב עוצמה בקלות.',
            disableBeacon: true,
            placement: 'center',
        },
        {
            target: '.tour-step-inputs',
            content: 'כאן מזינים את הפרמטרים של אוכלוסיית הבסיס (השערת האפס) ושל המדגם שלכם.',
            placement: 'right',
        },
        {
            target: '.tour-step-test-type',
            content: 'בחרו את סוג המבחן והכיוון שלו (חד-צדדי או דו-צדדי).',
            placement: 'bottom',
        },
        {
            target: '.tour-step-graph',
            content: 'הגרף יתעדכן בזמן אמת ויציג לכם את התפלגות הדגימה, אזורי הדחייה והעוצמה (1-Beta).',
            placement: 'left',
        },
        {
            target: '.tour-step-h1-toggle',
            content: 'בלחיצה כאן תוכלו להציג או להסתיר את התפלגות H1 מהגרף ואת השטח המייצג את העוצמה.',
            placement: 'bottom',
        },
        {
            target: '.tour-step-decision',
            content: 'מטריצת ההחלטה מציגה בצורה ברורה את המסקנה הסטטיסטית של המבחן.',
            placement: 'top',
        },
        {
            target: '.tour-step-accordion-ci',
            content: 'במידת הצורך, כאן תוכלו למצוא חישוב מפורט של רווח סמך לתוחלת, וכן חישוב עוצמת המבחן.',
            placement: 'top',
        }
    ], []);

    const normalSteps: Step[] = useMemo(() => [
        { target: 'body', content: 'כאן תוכלו לחשב הסתברויות וערכים קריטיים של התפלגות נורמלית.', disableBeacon: true, placement: 'center' }
    ], []);

    const tableSteps: Step[] = useMemo(() => [
        { target: 'body', content: 'עמוד זה מרכז טבלאות Z, t וכו.', disableBeacon: true, placement: 'center' }
    ], []);

    const formulaSteps: Step[] = useMemo(() => [
        { target: 'body', content: 'כל הנוסחאות הסטטיסטיות שלכם מרוכזות כאן.', disableBeacon: true, placement: 'center' }
    ], []);

    const activeSteps = useMemo(() => {
        switch (activeTour) {
            case 'global': return globalSteps;
            case 'hypothesis': return hypothesisSteps;
            case 'normal': return normalSteps;
            case 'table': return tableSteps;
            case 'formula': return formulaSteps;
            default: return [];
        }
    }, [activeTour, globalSteps, hypothesisSteps, normalSteps, tableSteps, formulaSteps]);

  return (
    <>
      <JoyrideComponent
        steps={activeSteps}
        run={activeTour !== null}
        stepIndex={tourStepIndex}
        callback={handleJoyrideCallback}
        continuous
        showSkipButton
        disableOverlayClose
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: '#d4a843',
            backgroundColor: '#1e1e24',
            textColor: '#e0e0e0',
            arrowColor: '#1e1e24',
            overlayColor: 'rgba(0, 0, 0, 0.65)'
          },
          tooltip: {
            direction: 'rtl',
            fontFamily: 'Assistant, sans-serif',
            textAlign: 'right',
            borderRadius: '8px',
            border: '1px solid #3f3f46'
          },
          buttonNext: { backgroundColor: '#34529e', color: '#fff', borderRadius: '4px', fontWeight: 'bold' },
          buttonBack: { color: '#a1a1aa', fontWeight: 'bold' },
          buttonSkip: { color: '#ef4444', fontWeight: 'bold' }
        }}
        locale={{ back: 'חזור', close: 'סגור', last: 'סיום', next: 'הבא', skip: 'דלג' }}
      />
      <PageTransition pageKey={activePage === 'normal' ? `normal-${normalMode}` : activePage}>
        {activePage === 'hypothesis' ? (
          <PageLayout
            header={<SiteHeader activePage="hypothesis" onNavigate={handleNavigate} onStartTour={() => { setActiveTour('hypothesis'); setTourStepIndex(0); }} />}
            footer={<SiteFooter onNavigate={handleNavigate} />}
            forceScrollToTopVisible={activeTour !== null}
          >
            <Suspense fallback={<PageLoadingState />}>
              <HypothesisTestingCalculator />
            </Suspense>
          </PageLayout>
        ) : null}

        {activePage === 'normal' ? (
          <PageLayout
            header={<SiteHeader activePage={normalMode as SitePage} onNavigate={handleNavigate} onStartTour={() => { setActiveTour('normal'); setTourStepIndex(0); }} />}
            footer={<SiteFooter onNavigate={handleNavigate} />}
            forceScrollToTopVisible={activeTour !== null}
          >
            <Suspense fallback={<PageLoadingState />}>
              <NormalDistributionCalculator
                key={normalMode}
                initialMode={normalMode}
                onNavigate={handleNavigate}
              />
            </Suspense>
          </PageLayout>
        ) : null}

        {activePage === 'landing' ? (
          <LandingPage
            onNavigate={handleNavigate}
            onTryHypothesis={() => handleNavigate('hypothesis')}
            onStartGlobalTour={handleStartGlobalTour}
          />
        ) : null}
      </PageTransition>
    </>
  );
}

function PageLoadingState() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-10 text-center">
      <p className="text-body-base font-bold text-[var(--color-text-secondary)]">
        טוען מחשבון...
      </p>
    </div>
  );
}
