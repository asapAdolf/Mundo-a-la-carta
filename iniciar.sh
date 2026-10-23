#!/usr/bin/env bash

# ==============================================================================
# Script de arranque para el Sistema de Gestión de Empleados (Mundo a la Carta)
# ==============================================================================

# Colores para la terminal
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # Sin color
BOLD='\033[1m'

# Asegurar que el directorio de trabajo sea la raíz del proyecto
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR" || exit 1

echo -e "${CYAN}================================================================${NC}"
echo -e "${BOLD}${GREEN}  🌐 MUNDO A LA CARTA - SISTEMA DE GESTIÓN DE EMPLEADOS 🌐  ${NC}"
echo -e "${CYAN}================================================================${NC}"
echo ""

PORT=3000
URL="http://localhost:$PORT"

# Función para intentar abrir el navegador automáticamente según el SO
abrir_navegador() {
  sleep 1.2
  echo -e "${YELLOW}Abriendo navegador en: ${URL}${NC}"
  if [[ "$OSTYPE" == "msys"* ]] || [[ "$OSTYPE" == "cygwin"* ]] || [[ -n "$WINDIR" ]]; then
    start "$URL" 2>/dev/null || cmd.exe /c start "$URL" 2>/dev/null
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    open "$URL" 2>/dev/null
  elif command -v xdg-open >/dev/null 2>&1; then
    xdg-open "$URL" 2>/dev/null
  fi
}

# 1. Comprobar si Node.js está disponible
if command -v node >/dev/null 2>&1; then
  echo -e "${GREEN}✓ Node.js detectado ($(node -v))${NC}"
  echo -e "${CYAN}Iniciando servidor local en el puerto ${PORT}...${NC}"
  echo -e "${YELLOW}Presiona Ctrl + C para detener el servidor.${NC}"
  echo ""
  
  # Abrir navegador en segundo plano
  abrir_navegador &

  # Arrancar servidor nativo Node.js sin dependencias
  node server.js

# 2. Alternativa: Si Python 3 está disponible
elif command -v python3 >/dev/null 2>&1; then
  echo -e "${YELLOW}Node.js no encontrado. Usando Python 3 como servidor alternativo...${NC}"
  abrir_navegador &
  python3 -m http.server $PORT

# 3. Alternativa: Si Python está disponible
elif command -v python >/dev/null 2>&1; then
  echo -e "${YELLOW}Node.js no encontrado. Usando Python como servidor alternativo...${NC}"
  abrir_navegador &
  python -m http.server $PORT

# 4. Error: No se encontró ningún entorno de ejecución
else
  echo -e "${RED}❌ Error: No se encontró Node.js ni Python instalado en el sistema.${NC}"
  echo -e "Por favor, instala Node.js desde: https://nodejs.org/"
  exit 1
fi
