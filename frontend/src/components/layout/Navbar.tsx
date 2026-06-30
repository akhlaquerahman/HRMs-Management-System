"use client";

import { useAuthStore } from '@/store/authStore';
import { useRouter, usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import {
  Bell,
  Search,
  Menu,
  Maximize,
  HelpCircle,
  Sun,
  Moon,
  Globe,
  User,
  Settings,
  LogOut,
  Activity
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { t, i18n } = useTranslation();
  const { setTheme, theme } = useTheme();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '));

  return (
    <header className="flex h-16 items-center justify-between px-6 bg-card border-b shadow-sm shrink-0">
      {/* Left */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
        <div className="hidden md:flex items-center text-base text-muted-foreground gap-2">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className={index === breadcrumbs.length - 1 ? 'text-primary font-medium' : ''}>
                {t(crumb)}
              </span>
              {index < breadcrumbs.length - 1 && <span>/</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => toggleLanguage('en')}>English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleLanguage('hi')}>हिंदी</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toggleLanguage('ar')}>العربية</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Button variant="ghost" size="icon" className="rounded-full hidden md:inline-flex" onClick={toggleFullscreen}>
          <Maximize className="h-5 w-5" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>

          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>{t('Notifications')}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="p-4 text-sm text-center text-muted-foreground flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 opacity-20" />
              No new notifications
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="h-6 w-px bg-border mx-1"></div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full ml-1">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src={user?.profilePic || undefined} alt={user?.firstName || user?.email || 'User'} className="object-cover" />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {user?.firstName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.role}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push('/dashboard/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>{t('Profile')}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t('Logout')}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
