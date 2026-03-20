import { useEffect, useMemo, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Ticket, Loader2, PartyPopper, AlertCircle } from "lucide-react";
import { RAFFLE_CONFIG } from "@shared/raffle";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function Success() {
  const [, navigate] = useLocation();
  const [isConfirming, setIsConfirming] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useMemo(() => {
    if (typeof window === "undefined") return new URLSearchParams();
    return new URLSearchParams(window.location.search);
  }, []);

  const sessionId = searchParams.get("session_id");
  const orderId = useMemo(() => {
    const raw = searchParams.get("order_id");
    return raw ? parseInt(raw) : null;
  }, [searchParams]);

  const confirmPayment = trpc.checkout.confirmPayment.useMutation({
    onSuccess: () => {
      setIsConfirming(false);
      toast.success("Pago confirmado y boletos registrados correctamente");
    },
    onError: (err) => {
      console.error("[Confirm Payment Error]", err);
      setIsConfirming(false);
      setError(err.message);
    }
  });

  useEffect(() => {
    if (sessionId && orderId) {
      confirmPayment.mutate({ sessionId, orderId });
    } else {
      setIsConfirming(false);
    }
  }, [sessionId, orderId]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-white/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardContent className="p-8 text-center space-y-6">
          {isConfirming ? (
            <div className="space-y-4">
              <Loader2 className="size-12 text-primary animate-spin mx-auto" />
              <h1 className="text-xl font-bold">Confirmando tu pago...</h1>
              <p className="text-muted-foreground text-sm">
                Estamos verificando tu transacción y registrando tus boletos. Por favor, no cierres esta ventana.
              </p>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 mx-auto">
                <AlertCircle className="size-10 text-amber-600" />
              </div>
              <h1 className="text-xl font-bold text-amber-700">Aviso sobre tu registro</h1>
              <p className="text-muted-foreground text-sm">
                El pago se realizó, pero hubo un detalle al registrar tus boletos: {error}. 
                No te preocupes, nuestro equipo lo verificará manualmente.
              </p>
            </div>
          ) : (
            <>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto">
                <CheckCircle2 className="size-10 text-green-600" />
              </div>

              <div>
                <h1 className="text-2xl font-extrabold mb-2">
                  ¡Pago exitoso!
                </h1>
                <p className="text-muted-foreground text-sm">
                  Tu compra ha sido procesada correctamente. Tus boletos han sido registrados a tu nombre.
                </p>
              </div>

              <div className="bg-muted/50 rounded-xl p-4 space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rifa</span>
                  <span className="font-medium">{RAFFLE_CONFIG.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sorteo</span>
                  <span className="font-medium">{RAFFLE_CONFIG.drawDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <PartyPopper className="size-4" />
                <span>¡Mucha suerte en el sorteo!</span>
              </div>
            </>
          )}

          <Button
            onClick={() => navigate("/")}
            disabled={isConfirming}
            className="w-full h-11 bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600 shadow-xl"
          >
            Volver al inicio
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
