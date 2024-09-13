import { useMbWallet } from "@mintbase-js/react";

export default function useApi() {
  const { connect, isConnected, accounts, activeAccountId, disconnect } =
    useMbWallet();
  return {
    connect,
    isConnected,
    disconnect,
  };
}
