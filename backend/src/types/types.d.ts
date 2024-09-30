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
  deleteDID({ id }: { id: string }): Promise<DIDDocument | null>;
}

export interface DIDDocument {
  id: string;
  publicKey: string;
  serviceEndpoint: string;
  [key: string]: string;
}
