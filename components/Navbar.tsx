'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LogOut, ShieldCheck, Menu, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import ThemeToggle from './ThemeToggle';

const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="border-b sticky top-0 z-40 bg-gradient-to-r from-primary/5 via-background/95 to-status-doing/5 backdrop-blur">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          href="/"
          className="font-heading text-lg font-semibold bg-gradient-to-r from-primary to-status-doing bg-clip-text text-transparent"
        >
          Task Board
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="text-xs">{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">{user.name}</span>
                  <Badge variant={user.role === 'ADMIN' ? 'default' : 'secondary'}>{user.role}</Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" /> Profile
                  </Link>
                </DropdownMenuItem>
                {user.role === 'ADMIN' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Admin dashboard
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" /> Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="font-heading">Task Board</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 mt-6 text-sm">
                {NAV_LINKS.map((link) => (
                  <SheetClose asChild key={link.href}>
                    <Link href={link.href} className="text-foreground">
                      {link.label}
                    </Link>
                  </SheetClose>
                ))}
                {!user && (
                  <>
                    <SheetClose asChild>
                      <Link href="/login" className="text-foreground">Log in</Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/register" className="text-foreground">Register</Link>
                    </SheetClose>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
