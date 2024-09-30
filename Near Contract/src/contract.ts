// Find all our documentation at https://docs.near.org
import { NearBindgen, call, view, UnorderedMap } from "near-sdk-js";

@NearBindgen({})
class DIDContract {
  dids: UnorderedMap<DIDDocument>;

  constructor() {
    this.dids = new UnorderedMap<DIDDocument>("dids");
  }

  //to creat a new Decentralized Identity
  @call({})
  createDID({
    id,
    publicKey,
    serviceEndpoint,
    ...otherProps
  }: DIDDocument): DIDDocument {
    if (this.dids.get(id)) {
      throw new Error("Did already Exist.");
    }

    const didDocument = new DIDDocument(
      id,
      publicKey,
      serviceEndpoint,
      otherProps
    );
    this.dids.set(id, didDocument);
    return didDocument;
  }

  //to view a Decentralized Identity
  @view({})
  getDID({ id }: { id: string }): DIDDocument | null {
    return this.dids.get(id);
  }

  //to update a new Decentralized Identity
  @call({})
  updateDID({
    id,
    publicKey,
    serviceEndpoint,
    ...otherProps
  }: DIDDocument): DIDDocument {
    if (!this.dids.get(id)) {
      throw new Error("DID does not exist");
    }
    const didDocument = new DIDDocument(
      id,
      publicKey,
      serviceEndpoint,
      otherProps
    );
    this.dids.set(id, didDocument);
    return didDocument;
  }

  //to get all Decentralized Identities
  @view({})
  getAllDIDs(): DIDDocument[] {
    const allDIDs = this.dids.toArray();
    return allDIDs.map(([id, didDocument]) => didDocument);
  }

  //to delete a Decentralized Identity
  @call({})
  deleteDID({ id }: { id: string }) {
    if (!this.dids.get(id)) {
      throw new Error("DID does not exist");
    }
    return this.dids.remove(id);
  }
}

//create a class for the DID
class DIDDocument {
  id?: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  publicKey: string;
  phone: string;
  email: string;
  serviceEndpoint: string;
  [key: string]: string;

  constructor(
    id: string,
    publicKey: string,
    serviceEndpoint: string,
    otherProps: { [key: string]: string }
  ) {
    this.id = id;
    this.publicKey = publicKey;
    this.serviceEndpoint = serviceEndpoint;
    Object.assign(this, otherProps);
  }
}
