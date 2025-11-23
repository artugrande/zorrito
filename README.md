# Zorrito Finance 🦊

Gamified DeFi savings platform on Celo blockchain with age verification using Self Protocol.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/artugrandes-projects/v0-nano-banana-pro-playground-uy)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/dw5WAuVTXk4)

## 🎮 Overview

Zorrito Finance es una plataforma de ahorros gamificada que combina:
- **Gaming**: Mantén tu zorro virtual vivo alimentándolo regularmente
- **DeFi**: Ahorra con cUSD y genera yield automáticamente
- **Lottery sin pérdidas**: Participa en sorteos mensuales (solo se usa el yield, tu capital está seguro)
- **Conservación**: 2% de cada premio se dona a Rewilding Argentina para proteger la fauna patagónica

## 🔐 Verificación de Edad

El proyecto incluye verificación de edad usando Self Protocol para asegurar que solo usuarios mayores de 13 años puedan acceder.

### Componentes de Verificación

- **Frontend**: Componente QR en `components/age-verification.tsx`
- **Smart Contract**: Contrato `ProofOfHuman.sol` en `contracts/src/`
- **Flujo**: Conectar wallet → Disclaimer → **Verificación de Edad** → Crear Zorro → Jugar

## 🚀 Configuración Inicial

### 1. Instalar Dependencias del Frontend

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Self Protocol Configuration
NEXT_PUBLIC_SELF_APP_NAME="Zorrito Finance"
NEXT_PUBLIC_SELF_SCOPE_SEED="zorrito-finance"
NEXT_PUBLIC_SELF_ENDPOINT=0x... # Dirección del contrato desplegado
NEXT_PUBLIC_SELF_ENDPOINT_TYPE="celo" # "celo" para mainnet (producción)
```

### 3. Desplegar el Contrato de Verificación

Ver instrucciones detalladas en [`contracts/README.md`](./contracts/README.md)

```bash
cd contracts
npm install
forge install foundry-rs/forge-std
# Configurar .env con PRIVATE_KEY, NETWORK, etc.
forge script script/DeployProofOfHuman.s.sol:DeployProofOfHuman --rpc-url celo --broadcast
```

## 📁 Estructura del Proyecto

```
zorrito/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Flujo principal de la aplicación
│   └── api/               # API routes
├── components/
│   ├── age-verification.tsx  # Componente de verificación de edad con QR
│   ├── connect-wallet.tsx
│   ├── create-fox.tsx
│   └── fox-home.tsx
├── contracts/              # Smart contracts (Foundry)
│   ├── src/
│   │   └── ProofOfHuman.sol
│   ├── script/
│   │   └── DeployProofOfHuman.s.sol
│   └── README.md
└── public/                # Assets estáticos
```

## 🛠️ Desarrollo

```bash
# Iniciar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start
```

## 📚 Documentación

- [Contratos de Verificación](./contracts/README.md) - Guía completa para desplegar contratos
- [Self Protocol Docs](https://docs.self.xyz/) - Documentación de Self Protocol
- [Foundry Book](https://book.getfoundry.sh/) - Documentación de Foundry

## 🔗 Enlaces

- **App**: [Zorrito Finance](https://zorrito.vercel.app)
- **Self Protocol**: [self.xyz](https://self.xyz)
- **Rewilding Argentina**: [rewildingargentina.org](https://www.rewildingargentina.org)

## ⚠️ Notas Importantes

1. **Scope Seed**: Debe ser idéntico en el contrato (`contracts/.env`) y el frontend (`.env.local`)
2. **Dirección del Contrato**: Siempre usa minúsculas en `NEXT_PUBLIC_SELF_ENDPOINT`
3. **Mainnet**: Este proyecto está configurado para producción en Celo Mainnet
4. **Seguridad**: Nunca compartas tu `PRIVATE_KEY` públicamente