import useApi from "@/api/useApi";

export default function useWallet() {
  const { connect, isLoading, setIsLoading, modal, ...props } = useApi();

  const connectToWallet = async () => {
    setIsLoading(true);
    await connect();
    modal.on("onHide", (e) => setIsLoading(false));
  };

  return {
    connectToWallet,
    isLoading,
    ...props,
  };
}
