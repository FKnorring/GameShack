import { Button } from '@/components/ui/button';
import { useKindeAuth } from '@kinde-oss/kinde-auth-react';
import { Zap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const location = useLocation();
  const { isAuthenticated, logout } = useKindeAuth();
  const [showHeader, setShowHeader] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (location.pathname.endsWith('/lobby')) {
        if (e.clientY < 100) {
          // Clear any existing timeout
          if (timeoutId) clearTimeout(timeoutId);
          // Set a new timeout
          const id = window.setTimeout(() => {
            setShowHeader(true);
          }, 300); // 300ms delay
          setTimeoutId(id);
        } else {
          // Clear timeout if mouse moves away
          if (timeoutId) clearTimeout(timeoutId);
          setShowHeader(false);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [location.pathname, timeoutId]);

  const inLobby = location.pathname.endsWith('/lobby');
  const inGame = location.pathname.startsWith('/play');

  if (inLobby && !showHeader) {
    return null;
  }

  return (
    <header
      className={cn(
        'bg-black/40 md:block transition-opacity duration-200 border-b-2 border-b-primary shadow shadow-black/20 z-50',
        inLobby && 'absolute top-0 left-0 right-0',
        inGame && 'hidden'
      )}
    >
      <div className="container flex h-16 items-center px-1">
        <div className={cn('mr-0 md:flex w-full', inGame && 'hidden')}>
          <nav className="flex items-center space-x-6 font-medium w-full justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-2xl font-display"
            >
              <Zap className="text-yellow-400" size={32} />
              <span className="fancy-wrap">Zap!</span>
            </Link>
            <div className="flex items-center font-display gap-1">
              <Link to="/play">
                <Button
                  variant={location.pathname === '/play' ? 'default' : 'ghost'}
                  className="text-lg"
                >
                  {t('general:play')}
                </Button>
              </Link>
              <Link to="/">
                <Button
                  variant={location.pathname === '/' ? 'default' : 'ghost'}
                  className="text-lg"
                >
                  {t('general:home')}
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  variant={location.pathname === '/about' ? 'default' : 'ghost'}
                  className="text-lg"
                >
                  {t('general:about')}
                </Button>
              </Link>
              {isAuthenticated && (
                <>
                  <Link to="/profile">
                    <Button
                      variant={
                        location.pathname === '/profile' ? 'default' : 'ghost'
                      }
                      className="text-lg"
                    >
                      {t('general:profile')}
                    </Button>
                  </Link>
                  <Button variant="ghost" className="text-lg" onClick={logout}>
                    {t('general:logout')}
                  </Button>
                </>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-lg">
                    {t('general:language')}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>
                    {t('general:chooseLanguage')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleLanguageChange('en')}>
                    {t('general:english')}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleLanguageChange('sv')}>
                    {t('general:swedish')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
