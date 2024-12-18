import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export function Participant({
  answerTempQuestion,
}: {
  answerTempQuestion: (answer: string) => void;
}) {
  const { t } = useTranslation(['participants']);

  const [time, setTime] = useState(10);

  useEffect(() => {
    if (time <= 0) return;
    const timer = setInterval(() => {
      setTime((prevTime) => prevTime - 1);
    }, 970);

    return () => clearInterval(timer);
  }, [time]);

  if (time > 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center font-display">
        <h1>{t('dontPress')}</h1>
      </div>
    );
  } else {
    return (
      <div className="flex flex-1 flex-col items-center justify-center font-display">
        <Button
          className="w-80 h-80 rounded-full text-4xl bg-red-600 text-white"
          isInteractive
          onClick={() => {
            answerTempQuestion('');
            console.log('click');
          }}
        >
          {t('answer')}
        </Button>
      </div>
    );
  }
}
