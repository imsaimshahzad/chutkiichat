import { MessageCircle, Zap, Info, HelpCircle, Mail, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <Zap className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-sparkle" />
          </div>
          <span className="text-xl font-bold">
            <span className="text-gradient-chutki">Chutki</span>
            <span className="text-foreground">Chat</span>
          </span>
        </a>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Info className="w-4 h-4 mr-1" />
                About
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-gradient-chutki text-xl">About ChutkiChat</DialogTitle>
                <DialogDescription className="pt-4 text-foreground/80">
                  <p className="mb-3">
                    ChutkiChat is a temporary, anonymous chat application. No accounts, no history, no traces.
                  </p>
                  <p className="mb-3">
                    Create a room with a simple 4-digit code, share it with friends, and start chatting instantly. 
                    When everyone leaves, the room vanishes forever.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    "Chutki" means "in an instant" — that's how fast and temporary your chats are!
                  </p>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <HelpCircle className="w-4 h-4 mr-1" />
                How to Use
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-gradient-chutki text-xl">How to Use</DialogTitle>
                <DialogDescription className="pt-4 text-foreground/80 space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">1</div>
                    <div>
                      <p className="font-medium text-foreground">Create a Chutki Room</p>
                      <p className="text-sm text-muted-foreground">Click "Start Chutki" to generate a unique 4-digit room code.</p>
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
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Mail className="w-4 h-4 mr-1" />
                Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
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
                        <a href="mailto:imshahzad2244@gmail.com" className="font-medium text-primary hover:underline">
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
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Report Bug
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-gradient-chutki text-xl">Report a Bug</DialogTitle>
                <DialogDescription className="pt-4 text-foreground/80">
                  <p className="mb-4">
                    Found something that's not working right? Let us know!
                  </p>
                  <div className="bg-secondary/50 rounded-xl p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Please include:</p>
                    <ul className="text-sm space-y-1 list-disc list-inside">
                      <li>What you were trying to do</li>
                      <li>What went wrong</li>
                      <li>Your device and browser</li>
                    </ul>
                    <p className="text-sm text-muted-foreground mt-3">Send reports to:</p>
                    <p className="font-medium text-primary">bugs@chutkichat.com</p>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </nav>

        {/* Mobile menu */}
        <div className="md:hidden flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon">
                <Info className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>About ChutkiChat</DialogTitle>
                <DialogDescription>
                  Temporary, anonymous chat. No accounts, no traces.
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
};

export default Header;
