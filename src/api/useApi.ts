import { useMbWallet } from "@mintbase-js/react";
import { useState } from "react";

export default function useApi() {
  const res = useMbWallet();

  const [isLoading, setIsLoading] = useState(false);
  return { ...res, isLoading, setIsLoading };
}
