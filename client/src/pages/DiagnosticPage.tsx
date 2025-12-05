import { useTranslations } from '@/lib/i18n';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

export default function DiagnosticPage() {
  const t = useTranslations();
  const [copied, setCopied] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL;
  const siteUrl = import.meta.env.VITE_SITE_URL;
  const mode = import.meta.env.MODE;
  const isDev = import.meta.env.DEV;

  const diagnostics = {
    'VITE_API_URL': apiUrl || '(NON DÉFINI)',
    'VITE_SITE_URL': siteUrl || '(NON DÉFINI)',
    'MODE': mode,
    'DEV': isDev ? 'true' : 'false',
    'User Agent': navigator.userAgent,
    'Window Origin': window.location.origin,
  };

  const hasApiUrl = !!apiUrl;
  const isApiUrlCorrect = apiUrl === 'https://api.solventisgroup.org';

  const copyToClipboard = () => {
    const text = Object.entries(diagnostics)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Diagnostic de Production</h1>
          <p className="text-muted-foreground">
            Vérification de la configuration des variables d'environnement
          </p>
        </div>

        {/* Status principal */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            {isApiUrlCorrect ? (
              <CheckCircle2 className="w-8 h-8 text-green-500 flex-shrink-0" />
            ) : hasApiUrl ? (
              <AlertCircle className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            ) : (
              <XCircle className="w-8 h-8 text-destructive flex-shrink-0" />
            )}
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">
                {isApiUrlCorrect ? '✅ Configuration correcte' : 
                 hasApiUrl ? '⚠️ Configuration incorrecte' : 
                 '❌ Variable manquante'}
              </h2>
              
              <p className="text-muted-foreground mb-4">
                {isApiUrlCorrect ? 
                  'VITE_API_URL est correctement configurée. Si vous avez toujours des erreurs, vérifiez que votre backend est accessible.' :
                 hasApiUrl ?
                  `VITE_API_URL est définie mais incorrecte. Valeur actuelle: ${apiUrl}` :
                  'VITE_API_URL n\'est pas définie dans le build. Le frontend ne peut pas communiquer avec le backend.'}
              </p>

              {!isApiUrlCorrect && (
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-sm">Valeur attendue:</p>
                  <code className="block bg-background px-3 py-2 rounded text-sm">
                    https://api.solventisgroup.org
                  </code>
                  
                  {!hasApiUrl && (
                    <div className="mt-4 space-y-2 text-sm">
                      <p className="font-medium">Actions requises:</p>
                      <ol className="list-decimal list-inside space-y-1 ml-2">
                        <li>Vérifiez que VITE_API_URL est définie dans Vercel</li>
                        <li>Assurez-vous que les 3 cases sont cochées (Production, Preview, Development)</li>
                        <li>Forcez un nouveau déploiement propre</li>
                        <li>Revenez sur cette page pour vérifier</li>
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Détails complets */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Variables d'environnement</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              data-testid="button-copy-diagnostics"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Copié !
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier tout
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {Object.entries(diagnostics).map(([key, value]) => (
              <div key={key} className="flex items-start gap-3 pb-3 border-b last:border-0">
                <Badge variant="outline" className="mt-0.5 font-mono text-xs">
                  {key}
                </Badge>
                <code className="flex-1 text-sm break-all">
                  {value}
                </code>
              </div>
            ))}
          </div>
        </Card>

        {/* Test de connexion */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Test de connexion API</h3>
          
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Ouvrez la console du navigateur (F12) et exécutez:
              </p>
              <code className="block bg-muted px-3 py-2 rounded text-sm overflow-x-auto">
                fetch('{apiUrl || window.location.origin}/api/health').then(r =&gt; r.json()).then(console.log)
              </code>
            </div>
            
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-sm font-medium mb-2">Résultat attendu:</p>
              <code className="block text-sm text-green-600">
                {`{ "status": "ok" }`}
              </code>
              
              <p className="text-sm font-medium mt-3 mb-2">Si vous voyez une erreur:</p>
              <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>CORS error → Vérifier FRONTEND_URL et COOKIE_DOMAIN dans le backend</li>
                <li>Failed to fetch → Vérifier que api.solventisgroup.org est accessible</li>
                <li>HTML au lieu de JSON → VITE_API_URL n'est pas injectée (cette page)</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Instructions */}
        {!isApiUrlCorrect && (
          <Card className="p-6 bg-destructive/5 border-destructive/20">
            <h3 className="text-lg font-semibold mb-4 text-destructive">
              Comment forcer un rebuild propre dans Vercel
            </h3>
            
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="font-bold text-destructive flex-shrink-0">1.</span>
                <div>
                  <p className="font-medium">Vérifiez les variables d'environnement</p>
                  <p className="text-muted-foreground">
                    Vercel → Votre projet → Settings → Environment Variables
                  </p>
                  <code className="block mt-1 bg-background px-2 py-1 rounded text-xs">
                    VITE_API_URL = https://api.solventisgroup.org
                  </code>
                </div>
              </li>
              
              <li className="flex gap-3">
                <span className="font-bold text-destructive flex-shrink-0">2.</span>
                <div>
                  <p className="font-medium">Forcez un nouveau déploiement</p>
                  <p className="text-muted-foreground">
                    Vercel → Deployments → Dernier déploiement → ⋮ (menu) → Redeploy
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    ⚠️ NE PAS utiliser "Use existing Build Cache" - faites un build complet
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <span className="font-bold text-destructive flex-shrink-0">3.</span>
                <div>
                  <p className="font-medium">Vérifiez les logs de build</p>
                  <p className="text-muted-foreground">
                    Cherchez "VITE_API_URL" dans les logs pour confirmer qu'elle est présente
                  </p>
                </div>
              </li>
              
              <li className="flex gap-3">
                <span className="font-bold text-destructive flex-shrink-0">4.</span>
                <div>
                  <p className="font-medium">Revenez sur cette page</p>
                  <p className="text-muted-foreground">
                    Rafraîchissez (Ctrl+Shift+R) et vérifiez que VITE_API_URL est maintenant définie
                  </p>
                </div>
              </li>
            </ol>
          </Card>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            data-testid="button-refresh-diagnostic"
          >
            Rafraîchir la page
          </Button>
          <Button
            onClick={() => window.location.href = '/dashboard'}
            data-testid="button-go-dashboard"
          >
            Retour au tableau de bord
          </Button>
        </div>
      </div>
    </div>
  );
}
