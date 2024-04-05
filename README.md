# CS2-4A

# Membres
1. [BELEGUIC Thibault - @Beleguic](https://github.com/Beleguic)
2. [HAILLOUY Matiss - @Matiss2702](https://github.com/Matiss2702)
3. [PHANG Willy - @PHANGWilly](https://github.com/PHANGWilly)
4. [YVARS Clément - @clement-Yvars](https://github.com/clement-Yvars)

<hr>

# Installation
**Prérequis :**
- [Git Bash](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/)

**Étapes d'installation:**
<br>**in Git Bash**
1. `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash`
2. `export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")" [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" # This loads nvm`
3. `nvm install 20.0.0`
4. supprimer `node_modules` et `package-lock.json` dans le dossier "tropicool"
5. `docker compose run --rm vue npm install`
6. `docker compose up`
