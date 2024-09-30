export interface DIDContractMethods {
  getDID({ id }: { id: string }): Promise<DIDDocument | null>;
  getAllDIDs(): Promise<DIDDocument[] | null>;
  createDID(params: {
    publicKey: string;
    serviceEndpoint: string;
  }): Promise<DIDDocument>;
  updateDID(params: {
    publicKey: string;
    serviceEndpoint: string;
  }): Promise<DIDDocument>;
}

export interface DIDDocument {
  id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  publicKey: string;
  phone: string;
  email: string;
  serviceEndpoint: string;
}

export interface NFT {
  token_id: string;
  metadata: NFTMetadata;
  receiver_id: string;
  perpetual_royalties: { [key: string]: number };
}

export type NFTMetadata = {
  title?: string;
  description?: string;
  media?: string;
  media_hash?: string;
  copies?: number;
  issued_at?: string;
  expires_at?: string;
  starts_at?: string;
  updated_at?: string;
  extra?: string;
  reference?: string;
  reference_hash?: string;
};
