import { useState } from "react";
import { MessageCircle, Zap, Info, HelpCircle, Mail, AlertTriangle, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ThemeToggle } from "./ThemeToggle";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const NavItems = () => (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 w-full md:w-auto justify-start md:justify-center transition-colors">
            <Info className="w-4 h-4 mr-2 md:mr-1" />
            About
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[90vw] sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-gradient-chutki text-xl">About ChutkiiChat</DialogTitle>
            <DialogDescription className="pt-4 text-foreground/80">
              <p className="mb-3">
                ChutkiiChat is a temporary, anonymous chat application. No accounts, no history, no traces.
              </p>
              <p className="mb-3">
                Create a room with a simple 4-digit code, share it with friends, and start chatting instantly. 
                When everyone leaves, the room vanishes forever.
              </p>
              <p className="text-muted-foreground text-sm">
                "Chutkii" means "in an instant" — that's how fast and temporary your chats are!
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 w-full md:w-auto justify-start md:justify-center transition-colors">
            <HelpCircle className="w-4 h-4 mr-2 md:mr-1" />
            How to Use
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[90vw] sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-gradient-chutki text-xl">How to Use</DialogTitle>
            <DialogDescription className="pt-4 text-foreground/80 space-y-4">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                <div>
                  <p className="font-medium text-foreground">Create a Chutkii Room</p>
                  <p className="text-sm text-muted-foreground">Click "Start Chutkii" to generate a unique 4-digit room code.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">2</div>
                <div>
                  <p className="font-medium text-foreground">Share the Code</p>
                  <p className="text-sm text-muted-foreground">Send the 4-digit code to friends you want to chat with.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">3</div>
                <div>
                  <p className="font-medium text-foreground">Chat Instantly</p>
                  <p className="text-sm text-muted-foreground">Start messaging in real-time. No sign-up needed!</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">4</div>
                <div>
                  <p className="font-medium text-foreground">Leave & Forget</p>
                  <p className="text-sm text-muted-foreground">Rooms auto-delete after 24 hours of inactivity.</p>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 w-full md:w-auto justify-start md:justify-center transition-colors">
            <Mail className="w-4 h-4 mr-2 md:mr-1" />
            Contact
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[90vw] sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-gradient-chutki text-xl">Contact Us</DialogTitle>
            <DialogDescription className="pt-4 text-foreground/80">
              <p className="mb-4">
                Have a question, or facing an issue? Reach us directly:
              </p>
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📩</span>
                  <div>
                    <p className="text-sm text-muted-foreground">Email:</p>
                    <a href="mailto:imshahzad2244@gmail.com" className="font-medium text-primary hover:underline break-all">
                      imshahzad2244@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📱</span>
                  <div>
                    <p className="text-sm text-muted-foreground">WhatsApp:</p>
                    <a 
                      href="https://wa.me/923478018040" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-primary hover:underline"
                    >
                      0347 8018040
                    </a>
                  </div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                We usually reply within 24 hours!
              </p>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary hover:bg-primary/10 w-full md:w-auto justify-start md:justify-center transition-colors">
            <AlertTriangle className="w-4 h-4 mr-2 md:mr-1" />
            Report Bug
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[90vw] sm:max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-gradient-chutki text-xl">Report a Bug</DialogTitle>
            <DialogDescription className="pt-4 text-foreground/80">
              <p className="mb-4">
                Found something that's not working right? Let us know!
              </p>
              <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
                <p className="text-sm text-muted-foreground">Please include:</p>
                <ul className="text-sm space-y-1 list-disc list-inside">
                  <li>What you were trying to do</li>
                  <li>What went wrong</li>
                  <li>Your device and browser</li>
                </ul>
                <div className="border-t border-border pt-3 mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📩</span>
                    <div>
                      <p className="text-sm text-muted-foreground">Email:</p>
                      <a href="mailto:imshahzad2244@gmail.com" className="font-medium text-primary hover:underline break-all">
                        imshahzad2244@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📱</span>
                    <div>
                      <p className="text-sm text-muted-foreground">WhatsApp:</p>
                      <a 
                        href="https://wa.me/923478018040" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-medium text-primary hover:underline"
                      >
                        0347 8018040
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-b border-primary/20 shadow-sm shadow-primary/5">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2 group">
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-md shadow-primary/30 group-hover:shadow-lg group-hover:shadow-primary/40 transition-shadow">
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-accent absolute -top-1 -right-1 animate-sparkle" />
          </div>
          <span className="text-lg sm:text-xl font-bold">
            <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Chutkii</span>
            <span className="text-foreground">Chat</span>
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavItems />
          <ThemeToggle />
        </nav>

        {/* Mobile menu */}
        <div className="md:hidden flex items-center gap-1">
          <ThemeToggle />
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="text-gradient-chutki">Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 mt-6">
                <NavItems />
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
