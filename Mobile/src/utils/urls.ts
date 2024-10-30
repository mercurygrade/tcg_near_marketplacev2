export default Object.freeze({
  auth: {
    new: "/auth/create-account",
    login: "/auth/login",
  },
  app: {
    profile: {
      url: "/profile",
    },
    wallet: {
      create: "/wallet?uid={{userId}}&username={{username}}",
      signIn: "/wallet/request-siginurl",
    },
    nft: {
      generateImage: "/generate",
      url: "/near/nft/nft-tokens-for-owner",
      mint: "/near/nft/mint",
    },
  },
});
