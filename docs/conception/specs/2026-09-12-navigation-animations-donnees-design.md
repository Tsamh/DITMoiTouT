# Navigation fluide, animations premium et retrait des données sensibles

Date : 2026-09-12
Projet : DITMoiTouT (Vue 3 + Vite, déployé sur GitHub Pages)
Statut : validé

## 1. Problème

Trois défauts distincts, confirmés avec l'utilisateur après exploration du dépôt.

**Le défilement ne repart pas du haut.** `src/router/index.js:23` crée le routeur sans `scrollBehavior`. Vue Router conserve donc la position de défilement d'une vue à l'autre : on arrive au milieu de la nouvelle page.

**La navigation n'est pas fluide.** Aucune `<transition>` n'entoure le `<router-view>` dans `src/App.vue:7`, et aucune vue ne révèle ses blocs au défilement. Les seules animations existantes sont locales et isolées : un `popin` sur la carte de connexion, un `scale` au survol des cartes Ressources. Référence visuelle demandée : https://www.samsung.com/africa_fr/

**Des données personnelles réelles sont publiées.** Le dépôt ne contient ni secret, ni clé d'API, ni fichier `.env`, dans l'arbre de travail comme dans l'historique. En revanche :

- `src/views/loginPage.vue:46` enregistre `connectedUser` et redirige vers l'accueil avant de vérifier les identifiants. N'importe qui se connecte avec n'importe quel email.
- `src/views/registerPage.vue:38` stocke les mots de passe en clair dans `localStorage`. Sur GitHub Pages, tous les projets de l'utilisateur partagent l'origine `tsamh.github.io`, donc ce stockage n'est pas isolé.
- `src/views/Professeurs.vue` publie 14 fiches avec noms réels, photos réelles et vrais identifiants de membres Slack (`ditdakar.slack.com/team/U…`).
- `src/components/Footer.vue:36-38` publie trois numéros de téléphone réels, et les lignes 18 et 19 des comptes personnels (Snapchat, QR WhatsApp).

## 2. Périmètre

Inclus : retour en haut de page, transition entre pages, révélation au défilement sur toutes les vues, correction de la faille de connexion, fin du stockage de mots de passe en clair, anonymisation complète de la page Professeurs, nettoyage du footer, réécriture de l'historique git.

Exclu : toute authentification réelle. Le site est statique sur GitHub Pages, sans backend. Le système de comptes reste une simulation côté navigateur, et le design ne prétend pas le contraire.

## 3. Architecture

### Fichiers créés

| Fichier | Rôle |
|---|---|
| `src/directives/reveal.js` | Directive `v-reveal` et `IntersectionObserver` unique partagé |
| `src/assets/css/motion.css` | Variables de mouvement, classes de révélation et de transition de page |
| `src/router/transition-gate.js` | Synchronise le retour en haut avec la fin de la transition de sortie |
| `src/data/professeurs.js` | Les 14 fiches enseignants sous forme de données |
| `src/utils/password.js` | Empreinte de mot de passe et purge de l'ancien stockage |
| `scripts/audit-donnees.mjs` | Vérifie qu'aucune donnée sensible ne réapparaît |

### Fichiers modifiés

`src/main.js`, `src/router/index.js`, `src/App.vue`, les huit vues de `src/views/`, `src/components/Footer.vue`, `.gitignore`, `package.json`, `.github/workflows/pages.yml`.

### Principe de découpe

Chaque unité a une seule raison d'exister et une frontière explicite. La directive ne connaît pas le routeur. Le routeur ne connaît pas le CSS, il interroge uniquement le portail de transition. Les données enseignants deviennent une donnée et non plus du balisage : `Professeurs.vue` passe de 211 lignes à une trentaine, et remplacer noms, photos et liens devient une modification unique au lieu de quatorze. `motion.css` centralise les valeurs de mouvement, donc régler l'ensemble du site revient à changer quatre variables à un seul endroit.

## 4. Retour en haut de page

`scrollBehavior(to, from, savedPosition)` traite trois cas dans cet ordre :

1. `savedPosition` non nul : l'utilisateur a utilisé précédent ou suivant, on restaure exactement sa position.
2. `to.hash` présent : on défile jusqu'à l'élément visé.
3. Sinon : `{ top: 0 }`.

**Correctif requis.** `Professeurs.vue` utilise `<a name="l1">` pour ses ancres de niveau. L'attribut `name` est obsolète et `document.querySelector('#l1')` ne le trouve pas, donc le cas 2 serait inopérant. Les `name` deviennent des `id` sur les trois ancres L1, L2 et L3 ; les liens `href="#l1"` restent inchangés.

## 5. Transition entre les pages

### Le problème de synchronisation

Vue Router déclenche le défilement dès la navigation confirmée, c'est à dire pendant que l'ancienne page est encore visible en train de disparaître. Sans précaution, la page sortante saute vers le haut avant de s'effacer. C'est précisément la saccade à corriger.

### Le portail de transition

`src/router/transition-gate.js` expose deux fonctions :

- `signalerSortieTerminee()` : appelée par `App.vue` dans le hook `@after-leave` du `<Transition>`.
- `attendreSortie()` : renvoie une promesse résolue par l'appel précédent.

Le `scrollBehavior` renvoie une promesse qui attend `attendreSortie()` avant de résoudre la cible de défilement. Le défilement se produit donc dans l'intervalle où le DOM est vide, et reste invisible. La promesse est bornée par une sécurité de 600 ms : une transition avortée, interrompue ou jamais déclenchée ne doit jamais empêcher le défilement.

### La transition

`mode="out-in"`, pour éviter que deux pages se superposent.

| Phase | Durée | Opacité | Translation |
|---|---|---|---|
| Sortie | 220 ms | 1 vers 0 | 0 vers -12px |
| Entrée | 420 ms | 0 vers 1 | 24px vers 0 |

Courbe unique : `cubic-bezier(0.22, 0.61, 0.36, 1)`. L'asymétrie entre une sortie brève et une entrée posée est ce qui produit la sensation de qualité : l'ancien contenu libère la place sans se faire attendre, le nouveau s'installe.

**Exception sur l'accueil.** `Home.vue` ouvre sur une vidéo plein écran de 100vh. Une translation d'entrée sur un bloc de cette taille laisse apparaître une bande de fond en bas. La section hero reçoit donc un fondu seul, sans translation.

## 6. Révélation au défilement

### Mécanisme

Un seul `IntersectionObserver` pour toute l'application, créé paresseusement à la première utilisation. Chaque élément portant `v-reveal` s'y abonne au montage et s'en désabonne dès qu'il a été révélé. La révélation est à sens unique : un bloc déjà apparu ne redisparaît pas si l'utilisateur remonte. C'est le comportement de la référence Samsung, et cela évite l'effet clignotant des sites qui rejouent l'animation à chaque passage.

### Réglages

- Déclenchement : `threshold: 0`, `rootMargin: '0px 0px -12% 0px'`. Un bloc s'anime quand il a franchi le bas de l'écran d'environ un huitième de la hauteur de fenêtre, retard que produit la marge négative du bas et elle seule. Le seuil reste à zéro délibérément : un seuil exprimé en proportion de la surface de l'élément n'est jamais atteint par un conteneur plus haut qu'environ six écrans, la fonction de rappel ne partirait alors jamais, et les enfants déjà masqués par la directive le resteraient définitivement.
- Mouvement : opacité 0 vers 1, translation 28px vers le haut, durée 700 ms, même courbe que la transition de page. Une seule courbe pour tout le site, pour que l'ensemble se ressente comme un objet unique.
- Cascade : le modificateur `.stagger` sur un conteneur décale ses enfants directs de 90 ms chacun, via une variable CSS `--reveal-delay` écrite sur chaque enfant. Le décalage est plafonné à six enfants puis repart à zéro : sans ce plafond, la quinzième carte attendrait une seconde et demie.

### Garde fous

**Mouvement réduit.** `prefers-reduced-motion: reduce` supprime translations et transitions, le contenu s'affiche directement.

**Dégradation sûre.** L'état masqué n'est pas écrit dans le CSS de base. C'est la directive qui pose l'attribut `data-reveal` au montage, et le CSS ne masque que `[data-reveal]`. Si le JavaScript échoue ou si `IntersectionObserver` est absent, la page reste entièrement lisible. Le défaut dégradé est le contenu visible, jamais l'inverse.

### Emplacements

| Vue | Éléments révélés |
|---|---|
| `Home.vue` | Hero (fondu seul), grille des avantages (cascade), citation, section à propos et appel à l'action |
| `Revision.vue` | Bandeau de titre, barre d'actions, grille des matières (cascade) |
| `Ressources.vue` | Barre latérale, filtres, grille de cartes (cascade) |
| `Professeurs.vue` | Bloc de présentation, puis chaque groupe de niveau en cascade |
| `loginPage.vue` | Carte de connexion, en remplacement de l'animation `popin` actuelle |
| `registerPage.vue` | Carte d'inscription |
| `Play.vue` | Bloc lecteur |
| `RegisterLogin.vue` | Blocs principaux |

## 7. Sécurité et données personnelles

### Faille de connexion

Ordre corrigé dans `loginPage.vue` : chercher le compte, comparer l'empreinte, et seulement en cas de succès enregistrer la session puis rediriger. En cas d'échec, rien n'est écrit dans `localStorage`. Les `alert()` sont remplacés par un message d'erreur affiché sous le formulaire : un `alert()` bloque le navigateur et détonne avec le reste du travail sur le mouvement.

### Mots de passe

Nouveau format d'enregistrement : `{ nom, classe, email, sel, empreinte }`. L'empreinte est un SHA-256 de `sel + mot de passe` calculé via `crypto.subtle.digest`, le sel étant généré par `crypto.getRandomValues`.

**Ce que cela vaut, dit franchement.** SHA-256 n'est pas une fonction de dérivation de mot de passe, et tout le code s'exécute dans le navigateur, donc il est public. Cela n'apporte aucune protection contre un attaquant déterminé. Ce que cela règle réellement, et c'est l'objectif retenu, c'est qu'aucun mot de passe en clair ne subsiste dans un stockage que toute autre page de `tsamh.github.io` peut lire.

### Purge de l'existant

Les mots de passe en clair déjà écrits chez les visiteurs actuels resteraient indéfiniment. Le nouveau stockage utilise donc la clé `ditmt.users.v2`, et au démarrage l'application supprime activement l'ancienne clé `users`. Les comptes de test existants sont perdus, ce qui est sans conséquence et préférable à leur conservation.

### Page Professeurs

Les 14 fiches passent dans `src/data/professeurs.js`, chaque entrée portant : identifiant, nom fictif, matière, fichier photo, niveau. Le template devient une boucle `v-for` par niveau.

- Noms : remplacés par des noms fictifs.
- Photos : portraits libres de droits, téléchargés une fois et commités dans `src/assets/images/professeurs/`. Les anciens fichiers sont supprimés. Le site reste autonome, aucune requête ne part vers un service tiers.
- Liens de contact : les 14 liens `ditdakar.slack.com/team/U…` disparaissent. Le bouton Contacter est conservé visuellement mais sans destination active.
- La carte Nous recrutons est conservée telle quelle.

### Footer

- Les trois numéros de téléphone sont retirés.
- Comptes conservés : YouTube, Instagram, X, Facebook, TikTok et Discord de l'école, comptes institutionnels publics.
- Comptes retirés : Snapchat `sambaht20`, QR WhatsApp personnel.
- LinkedIn : pointe vers `https://www.linkedin.com/in/samba-hama-traore-925309351`.
- GitHub `Tsamh` : conservé, profil public du propriétaire du dépôt qui héberge déjà le site.

### Prévention

`.gitignore` reçoit `.env` et `.env.*`, qu'il ne couvre pas aujourd'hui.

## 8. Réécriture de l'historique git

Tout ce qui précède ne traite que l'état actuel du dépôt. Les anciennes photos et les liens Slack restent téléchargeables depuis l'historique public, au commit `1918d08`.

Procédure retenue : `git filter-repo`, vérifié présent sur la machine.

1. Sauvegarde complète du dépôt avant toute opération.
2. Suppression des anciens fichiers photo de tout l'historique via `--path` et `--invert-paths`.
3. Remplacement des chaînes `ditdakar.slack.com/team/U…` et des numéros `+221` dans l'historique via `--replace-text`.
4. Vérification que `git log --all -p` et la liste des objets ne contiennent plus rien de sensible, avant le push.
5. Reconfiguration du remote `origin`, que `filter-repo` retire par sécurité.
6. Push forcé vers `origin principal`.
7. Demande à GitHub de purger le cache des objets devenus inaccessibles.

Le push forcé redéclenche le workflow de déploiement, ce qui est le comportement attendu.

## 9. Vérification

Le projet n'a aucune infrastructure de test. Le design reste proportionné plutôt que de monter un harnais complet.

**Automatique.** `scripts/audit-donnees.mjs`, lancé via `npm run audit`, parcourt `src/`, `public/` et `index.html` et échoue si l'un de ces motifs réapparaît : `ditdakar.slack.com`, un numéro `+221`, `snapchat.com/add`, `wa.me/`, ou un nom de fichier de l'ancienne série de photos. C'est la seule régression vraiment probable, parce qu'elle surviendrait au détour d'un futur copier coller. Le script est branché dans `.github/workflows/pages.yml` avant l'étape de construction, pour qu'un déploiement ne puisse pas republier ces données.

**À la construction.** `npm run build` doit passer sans erreur ni avertissement nouveau. C'est ce qui attrape un import cassé après l'extraction des données enseignants.

**Dans le navigateur, avant livraison.** Parcours des huit routes sous `npm run dev`, en vérifiant : arrivée en haut à chaque changement de page, absence de saut de la page sortante, restauration de la position avec le bouton précédent, fonctionnement des ancres L1, L2 et L3, apparition en cascade des grilles, absence totale d'animation avec la préférence de mouvement réduit activée, refus d'une connexion avec un mot de passe faux, et absence de mot de passe en clair dans le stockage local.

**Après la réécriture d'historique.** Absence des anciennes photos et des liens Slack dans `git log --all` et dans la liste des objets, avant le push forcé, puis redéploiement correct du site.

**Vitest n'est pas ajouté.** Les deux unités réellement testables, l'empreinte de mot de passe et l'intégrité des données enseignants, sont couvertes par le script d'audit et par l'essai manuel. Installer un harnais de test complet coûterait ici plus que cela ne rapporterait.

## 10. Décisions et leur justification

| Décision | Retenu | Pourquoi |
|---|---|---|
| Portée des animations | Transition de route et révélation au défilement, sur toutes les vues | C'est la combinaison qui produit l'effet de la référence |
| Implémentation | Directive maison sans dépendance | L'effet repose sur trois paramètres seulement ; une bibliothèque ajoute du poids sans apporter de contrôle |
| Anonymisation | Complète, noms compris | Demande de l'utilisateur ; supprime la question au lieu de la déplacer |
| Photos de remplacement | Portraits libres de droits commités | Seule option préservant l'aspect équipe pédagogique tout en restant autonome |
| Historique git | Réécriture par `filter-repo` | Sans cela le nettoyage est cosmétique, les données restant accessibles |
| Tests | Script d'audit seul | Proportionné à la taille du projet et ciblé sur la seule régression probable |
