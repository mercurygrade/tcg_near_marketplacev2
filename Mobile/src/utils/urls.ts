export default Object.freeze({
  auth: {
    new: "auth/create-account",
  },
  app: {
    profile: {
      url: "/profile?uid=",
    },
    wallet: {
      create: "/wallet?uid={{userId}}&username={{username}}",
    },
    nft: {
      url: "/nft?id=",
      mint: "/nft/mint",
    },
  },
});
