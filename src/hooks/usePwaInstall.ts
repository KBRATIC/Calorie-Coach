import { useState, useEffect } from "react";

export function usePwaInstall() {
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setInstallPrompt(e);
      // We also store it globally in case components remount
      (window as any).deferredPrompt = e;
    };

    // If it was already caught before this hook mounted, restore it
    if ((window as any).deferredPrompt) {
      setInstallPrompt((window as any).deferredPrompt);
    }

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const triggerInstall = async () => {
    if (!installPrompt) return;

    // Show the install prompt
    installPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setInstallPrompt(null);
      (window as any).deferredPrompt = null;
    } else {
      console.log('User dismissed the install prompt');
    }
  };

  return { installPrompt, triggerInstall };
}
