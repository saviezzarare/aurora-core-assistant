import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function Auth() {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) navigate("/", { replace: true });
  }, [session, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Conta criada. Você já pode entrar.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate("/", { replace: true });
      }
    } catch (e: any) {
      toast.error(e.message || "Erro de autenticação");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
    if (result.error) {
      toast.error("Falha no Google: " + (result.error as any).message);
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-card/40 backdrop-blur-xl border border-primary/20 rounded-2xl p-7"
      >
        <h1 className="text-2xl font-light text-primary tracking-wide text-center">LUXIUM</h1>
        <p className="text-xs text-muted-foreground text-center mt-1 mb-6 tracking-wider uppercase">
          {mode === "signin" ? "Acesso autorizado" : "Criar conta"}
        </p>

        <form onSubmit={submit} className="space-y-3">
          <input
            type="email" required placeholder="email@empresa.com"
            value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-background/50 border border-border/40 rounded-md px-3 py-2 text-sm focus:border-primary/60 outline-none"
          />
          <input
            type="password" required minLength={6} placeholder="senha"
            value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-background/50 border border-border/40 rounded-md px-3 py-2 text-sm focus:border-primary/60 outline-none"
          />
          <button
            type="submit" disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-primary/15 hover:bg-primary/25 border border-primary/30 text-primary rounded-md py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === "signin" ? "Entrar" : "Cadastrar"}
          </button>
        </form>

        <div className="my-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-border/40" />
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ou</span>
          <div className="flex-1 h-px bg-border/40" />
        </div>

        <button
          onClick={google} disabled={busy}
          className="w-full border border-border/40 rounded-md py-2.5 text-sm hover:border-primary/40 transition-colors disabled:opacity-50"
        >
          Continuar com Google
        </button>

        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-[11px] text-muted-foreground hover:text-primary mt-4 transition-colors"
        >
          {mode === "signin" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
        </button>
      </motion.div>
    </div>
  );
}
