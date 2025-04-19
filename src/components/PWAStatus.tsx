import { usePWA } from "@/hooks/usePWA";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RefreshCw } from "lucide-react";

export function PWAStatus() {
  const { isOnline, needsRefresh, updateServiceWorker } = usePWA();

  if (!needsRefresh && isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {!isOnline && (
        <Alert variant="destructive" className="w-80">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Offline Mode</AlertTitle>
          <AlertDescription>
            You are currently offline. Some features may be limited.
          </AlertDescription>
        </Alert>
      )}
      
      {needsRefresh && (
        <Alert className="w-80 bg-blue-50 border-blue-200">
          <RefreshCw className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Update Available</AlertTitle>
          <AlertDescription className="text-blue-700">
            <div className="flex flex-col gap-2">
              <p>A new version is available.</p>
              <Button
                variant="outline"
                className="bg-blue-100 hover:bg-blue-200 border-blue-300"
                onClick={() => updateServiceWorker()}
              >
                Refresh to Update
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {isOnline && (
        <Alert className="w-80 bg-green-50 border-green-200">
          <Wifi className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Online</AlertTitle>
          <AlertDescription className="text-green-700">
            Connected to the network
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
} 