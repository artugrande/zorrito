/**
 * Cosmos Wallet (cosmospay.lat) como módulo de Stellar Wallets Kit.
 *
 * La extensión inyecta `window.cosmosWallet`, una interfaz estilo SEP-43:
 * `getAddress`, `getNetwork`, `signTransaction`, `signMessage`. No expone
 * `signAuthEntry`, y Zorrito no lo necesita: firma transacciones enteras.
 *
 * Detalle que importa: la wallet firma con la passphrase de SU red, no con
 * la que le pasa la página. Si el usuario tiene la wallet en testnet y está
 * en el pozo de mainnet, la firma no sirve y la red devolvería tx_bad_auth.
 * Se chequea antes de pedir la firma y se explica en vez de fallar feo.
 *
 * Fuente de la API: CosmosPay/CosmosPay-Wallet, extension-src/inpage.js.
 */

import { ModuleType, type ModuleInterface } from "@creit.tech/stellar-wallets-kit";

type CosmosWallet = {
  isCosmosWallet: true;
  isConnected(): Promise<boolean>;
  getAddress(): Promise<{ address: string }>;
  getNetwork(): Promise<{ network: string; networkPassphrase: string; networkUrl?: string }>;
  signTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }>;
  signMessage(
    message: string,
    opts?: { networkPassphrase?: string; address?: string },
  ): Promise<{ signedMessage: string; signerAddress?: string }>;
};

declare global {
  interface Window {
    cosmosWallet?: CosmosWallet;
  }
}

export const COSMOS_ID = "cosmos";

/** La extensión avisa con un evento cuando terminó de inyectarse; un rato de espera para no marcarla ausente en la carrera. */
function proveedor(esperaMs = 300): Promise<CosmosWallet | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (window.cosmosWallet) return Promise.resolve(window.cosmosWallet);
  return new Promise((resolver) => {
    const listo = () => resolver(window.cosmosWallet ?? null);
    window.addEventListener("cosmosWallet#initialized", listo, { once: true });
    setTimeout(listo, esperaMs);
  });
}

function nombreDeRed(passphrase: string): string {
  if (passphrase.startsWith("Public Global Stellar Network")) return "mainnet";
  if (passphrase.startsWith("Test SDF Network")) return "testnet";
  return "another network";
}

export class CosmosModule implements ModuleInterface {
  moduleType = ModuleType.HOT_WALLET;
  productId = COSMOS_ID;
  productName = "Cosmos Wallet";
  productUrl = "https://cosmospay.lat";
  productIcon = "/assets/cosmos-wallet.png";

  async isAvailable(): Promise<boolean> {
    return (await proveedor()) != null;
  }

  private async exigir(): Promise<CosmosWallet> {
    const w = await proveedor();
    if (!w) throw new Error("Cosmos Wallet is not installed");
    return w;
  }

  async getAddress(): Promise<{ address: string }> {
    const w = await this.exigir();
    const { address } = await w.getAddress();
    if (!address) throw new Error("Cosmos Wallet did not return an address");
    return { address };
  }

  async signTransaction(
    xdr: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedTxXdr: string; signerAddress?: string }> {
    const w = await this.exigir();
    if (opts?.networkPassphrase) {
      const red = await w.getNetwork();
      if (red.networkPassphrase && red.networkPassphrase !== opts.networkPassphrase) {
        throw new Error(
          `Cosmos Wallet is on ${nombreDeRed(red.networkPassphrase)} and this pool is on ${nombreDeRed(opts.networkPassphrase)}. Switch the network in the wallet and try again.`,
        );
      }
    }
    const { signedTxXdr, signerAddress } = await w.signTransaction(xdr, {
      networkPassphrase: opts?.networkPassphrase,
      address: opts?.address,
    });
    return { signedTxXdr, signerAddress };
  }

  async signAuthEntry(): Promise<{ signedAuthEntry: string; signerAddress?: string }> {
    throw new Error("Cosmos Wallet does not sign standalone authorization entries");
  }

  async signMessage(
    message: string,
    opts?: { networkPassphrase?: string; address?: string; path?: string },
  ): Promise<{ signedMessage: string; signerAddress?: string }> {
    const w = await this.exigir();
    const { signedMessage, signerAddress } = await w.signMessage(message, {
      networkPassphrase: opts?.networkPassphrase,
      address: opts?.address,
    });
    return { signedMessage, signerAddress };
  }

  async getNetwork(): Promise<{ network: string; networkPassphrase: string }> {
    const w = await this.exigir();
    const { network, networkPassphrase } = await w.getNetwork();
    return { network, networkPassphrase };
  }
}
