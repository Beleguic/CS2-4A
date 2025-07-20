@echo off
echo ========================================
echo    Lancement du Projet Tropicool
echo ========================================
echo.

echo [1/3] Arrêt des services existants...
docker compose down

echo [2/3] Démarrage des services...
docker compose up -d

echo [3/3] Attente du démarrage complet...
timeout /t 30 /nobreak > nul

echo.
echo ========================================
echo    Services Disponibles
echo ========================================
echo Frontend: http://localhost:8000
echo Backend:  http://localhost:3000
echo Poste:    http://localhost:3001
echo Adminer:  http://localhost:8080
echo.
echo Pour voir les logs: docker compose logs -f
echo Pour arrêter: docker compose down
echo ========================================

pause 