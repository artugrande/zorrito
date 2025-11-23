# Contratos de Verificación de Edad - Zorrito Finance

Este directorio contiene los contratos inteligentes para la verificación de edad usando Self Protocol.

## 📋 Requisitos Previos

- [Foundry](https://book.getfoundry.sh/getting-started/installation) instalado
- Node.js 20+
- Wallet con fondos en Celo (CELO tokens) para desplegar
- [Self Mobile App](https://self.xyz) para probar la verificación

## 🚀 Configuración Inicial

### 1. Instalar Dependencias

```bash
# Instalar dependencias de npm
npm install

# Instalar dependencias de Foundry
forge install foundry-rs/forge-std
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en esta carpeta basándote en el siguiente ejemplo:

```env
# Private key para despliegue (con prefijo 0x)
PRIVATE_KEY=0xyour_private_key_here

# Selección de red: "celo-mainnet" o "celo-sepolia"
NETWORK=celo-mainnet

# Scope seed - DEBE coincidir con NEXT_PUBLIC_SELF_SCOPE_SEED en frontend .env
SCOPE_SEED="zorrito-finance"

# Dirección del Hub de Verificación de Identidad
# Para Celo Mainnet: 0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF
# Para Celo Sepolia: 0x16ECBA51e18a4a7e61fdC417f0d47AFEeDfbed74
IDENTITY_VERIFICATION_HUB_ADDRESS=0xe57F4773bd9c9d8b6Cd70431117d353298B9f5BF

# Opcional: API key de Celoscan para verificación de contrato (solo mainnet)
CELOSCAN_API_KEY=your_celoscan_api_key_here
```

## 📝 Desplegar el Contrato

### Opción 1: Usando Forge Script (Recomendado)

```bash
# Para mainnet (Celo) - PRODUCCIÓN
forge script script/DeployProofOfHuman.s.sol:DeployProofOfHuman \
  --rpc-url celo \
  --broadcast \
  --verify

# Para testnet (Celo Sepolia) - SOLO DESARROLLO
forge script script/DeployProofOfHuman.s.sol:DeployProofOfHuman \
  --rpc-url celo-sepolia \
  --broadcast \
  --verify
```

### Opción 2: Script Automatizado (Linux/Mac)

```bash
chmod +x script/deploy-proof-of-human.sh
./script/deploy-proof-of-human.sh
```

## 🔧 Configuración del Contrato

El contrato está configurado para verificar:
- **Edad mínima**: 13 años (debe coincidir con el frontend)
- **Países prohibidos**: Ninguno (todos los países permitidos)
- **OFAC**: Deshabilitado

Estos valores están definidos en `script/DeployProofOfHuman.s.sol` y **DEBEN coincidir** con la configuración en `components/age-verification.tsx`.

## 📱 Configurar el Frontend

Después de desplegar el contrato, actualiza el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SELF_APP_NAME="Zorrito Finance"
NEXT_PUBLIC_SELF_SCOPE_SEED="zorrito-finance"
NEXT_PUBLIC_SELF_ENDPOINT=0x... # Dirección del contrato desplegado (en minúsculas)
NEXT_PUBLIC_SELF_ENDPOINT_TYPE="celo" # "celo" para mainnet, "staging_celo" para testnet
```

**IMPORTANTE**: 
- La dirección del contrato debe estar en **minúsculas**
- El `SCOPE_SEED` debe ser **exactamente igual** en ambos archivos `.env`

## 🧪 Probar la Verificación

1. Despliega el contrato en mainnet
2. Configura las variables de entorno en el frontend
3. Inicia el servidor de desarrollo: `npm run dev`
4. Conecta tu wallet
5. Escanea el QR con la app Self Protocol
6. Verifica que la verificación sea exitosa

## 📚 Estructura del Proyecto

```
contracts/
├── src/
│   └── ProofOfHuman.sol          # Contrato principal de verificación
├── script/
│   ├── Base.s.sol                 # Script base para despliegue
│   └── DeployProofOfHuman.s.sol   # Script de despliegue
├── foundry.toml                   # Configuración de Foundry
├── remappings.txt                 # Mapeo de imports
└── package.json                  # Dependencias npm
```

## 🔍 Verificar el Contrato en el Block Explorer

Después del despliegue, el contrato se verificará automáticamente. También puedes verificarlo manualmente:

- **Celo Sepolia**: https://celo-sepolia.blockscout.com
- **Celo Mainnet**: https://celoscan.io

## 📖 Recursos Adicionales

- [Documentación de Self Protocol](https://docs.self.xyz/)
- [Foundry Book](https://book.getfoundry.sh/)
- [Self Mobile App](https://self.xyz)

## ⚠️ Notas Importantes

1. **Seguridad**: Nunca compartas tu `PRIVATE_KEY`. Úsala solo localmente.
2. **Scope Seed**: Debe ser idéntico en el contrato y el frontend.
3. **Dirección del Contrato**: Siempre usa minúsculas en el frontend.
4. **Mainnet**: Este proyecto está configurado para producción en Celo Mainnet.

