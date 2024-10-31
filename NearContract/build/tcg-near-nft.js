function _applyDecoratedDescriptor(i, e, r, n, l) {
  var a = {};
  return Object.keys(n).forEach(function (i) {
    a[i] = n[i];
  }), a.enumerable = !!a.enumerable, a.configurable = !!a.configurable, ("value" in a || a.initializer) && (a.writable = !0), a = r.slice().reverse().reduce(function (r, n) {
    return n(i, e, r) || r;
  }, a), l && void 0 !== a.initializer && (a.value = a.initializer ? a.initializer.call(l) : void 0, a.initializer = void 0), void 0 === a.initializer ? (Object.defineProperty(i, e, a), null) : a;
}

function call(target, key, descriptor) {}
function view(target, key, descriptor) {}
function NearBindgen(target) {
  return class extends target {
    static _init() {
      // @ts-ignore
      let args = target.deserializeArgs();
      let ret = new target(args);
      // @ts-ignore
      ret.init();
      // @ts-ignore
      ret.serialize();
      return ret;
    }
    static _get() {
      let ret = Object.create(target.prototype);
      return ret;
    }
  };
}

const U64_MAX = 2n ** 64n - 1n;
const EVICTED_REGISTER = U64_MAX - 1n;
function log(...params) {
  env.log(`${params.map(x => x === undefined ? 'undefined' : x) // Stringify undefined
  .map(x => typeof x === 'object' ? JSON.stringify(x) : x) // Convert Objects to strings
  .join(' ')}` // Convert to string
  );
}
function predecessorAccountId() {
  env.predecessor_account_id(0);
  return env.read_register(0);
}
function attachedDeposit() {
  return env.attached_deposit();
}
function panic(msg) {
  if (msg !== undefined) {
    env.panic(msg);
  } else {
    env.panic();
  }
}
function storageRead(key) {
  let ret = env.storage_read(key, 0);
  if (ret === 1n) {
    return env.read_register(0);
  } else {
    return null;
  }
}
function storageHasKey(key) {
  let ret = env.storage_has_key(key);
  if (ret === 1n) {
    return true;
  } else {
    return false;
  }
}
function storageGetEvicted() {
  return env.read_register(EVICTED_REGISTER);
}
function input() {
  env.input(0);
  return env.read_register(0);
}
function storageUsage() {
  return env.storage_usage();
}
function promiseBatchCreate(accountId) {
  return env.promise_batch_create(accountId);
}
function promiseBatchActionTransfer(promiseIndex, amount) {
  env.promise_batch_action_transfer(promiseIndex, amount);
}
var PromiseResult;
(function (PromiseResult) {
  PromiseResult[PromiseResult["NotReady"] = 0] = "NotReady";
  PromiseResult[PromiseResult["Successful"] = 1] = "Successful";
  PromiseResult[PromiseResult["Failed"] = 2] = "Failed";
})(PromiseResult || (PromiseResult = {}));
function storageWrite(key, value) {
  let exist = env.storage_write(key, value, EVICTED_REGISTER);
  if (exist === 1n) {
    return true;
  }
  return false;
}
function storageRemove(key) {
  let exist = env.storage_remove(key, EVICTED_REGISTER);
  if (exist === 1n) {
    return true;
  }
  return false;
}
function storageByteCost() {
  return 10000000000000000000n;
}

class NearContract {
  deserialize() {
    const rawState = storageRead("STATE");
    if (rawState) {
      const state = JSON.parse(rawState);
      // reconstruction of the contract class object from plain object
      let c = this.default();
      Object.assign(this, state);
      for (const item in c) {
        if (c[item].constructor?.deserialize !== undefined) {
          this[item] = c[item].constructor.deserialize(this[item]);
        }
      }
    } else {
      throw new Error("Contract state is empty");
    }
  }
  serialize() {
    storageWrite("STATE", JSON.stringify(this));
  }
  static deserializeArgs() {
    let args = input();
    return JSON.parse(args || "{}");
  }
  static serializeReturn(ret) {
    return JSON.stringify(ret);
  }
  init() {}
}

class LookupMap {
  constructor(keyPrefix) {
    this.keyPrefix = keyPrefix;
  }
  containsKey(key) {
    let storageKey = this.keyPrefix + JSON.stringify(key);
    return storageHasKey(storageKey);
  }
  get(key) {
    let storageKey = this.keyPrefix + JSON.stringify(key);
    let raw = storageRead(storageKey);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    return null;
  }
  remove(key) {
    let storageKey = this.keyPrefix + JSON.stringify(key);
    if (storageRemove(storageKey)) {
      return JSON.parse(storageGetEvicted());
    }
    return null;
  }
  set(key, value) {
    let storageKey = this.keyPrefix + JSON.stringify(key);
    let storageValue = JSON.stringify(value);
    if (storageWrite(storageKey, storageValue)) {
      return JSON.parse(storageGetEvicted());
    }
    return null;
  }
  extend(objects) {
    for (let kv of objects) {
      this.set(kv[0], kv[1]);
    }
  }
  serialize() {
    return JSON.stringify(this);
  }
  // converting plain object to class object
  static deserialize(data) {
    return new LookupMap(data.keyPrefix);
  }
}

function u8ArrayToBytes(array) {
  let ret = "";
  for (let e of array) {
    ret += String.fromCharCode(e);
  }
  return ret;
}
// TODO this function is a bit broken and the type can't be string
// TODO for more info: https://github.com/near/near-sdk-js/issues/78
function bytesToU8Array(bytes) {
  let ret = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    ret[i] = bytes.charCodeAt(i);
  }
  return ret;
}
function assert(b, str) {
  if (b) {
    return;
  } else {
    throw Error("assertion failed: " + str);
  }
}

const ERR_INDEX_OUT_OF_BOUNDS = "Index out of bounds";
const ERR_INCONSISTENT_STATE$2 = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
function indexToKey(prefix, index) {
  let data = new Uint32Array([index]);
  let array = new Uint8Array(data.buffer);
  let key = u8ArrayToBytes(array);
  return prefix + key;
}
/// An iterable implementation of vector that stores its content on the trie.
/// Uses the following map: index -> element
class Vector {
  constructor(prefix) {
    this.length = 0;
    this.prefix = prefix;
  }
  len() {
    return this.length;
  }
  isEmpty() {
    return this.length == 0;
  }
  get(index) {
    if (index >= this.length) {
      return null;
    }
    let storageKey = indexToKey(this.prefix, index);
    return JSON.parse(storageRead(storageKey));
  }
  /// Removes an element from the vector and returns it in serialized form.
  /// The removed element is replaced by the last element of the vector.
  /// Does not preserve ordering, but is `O(1)`.
  swapRemove(index) {
    if (index >= this.length) {
      throw new Error(ERR_INDEX_OUT_OF_BOUNDS);
    } else if (index + 1 == this.length) {
      return this.pop();
    } else {
      let key = indexToKey(this.prefix, index);
      let last = this.pop();
      if (storageWrite(key, JSON.stringify(last))) {
        return JSON.parse(storageGetEvicted());
      } else {
        throw new Error(ERR_INCONSISTENT_STATE$2);
      }
    }
  }
  push(element) {
    let key = indexToKey(this.prefix, this.length);
    this.length += 1;
    storageWrite(key, JSON.stringify(element));
  }
  pop() {
    if (this.isEmpty()) {
      return null;
    } else {
      let lastIndex = this.length - 1;
      let lastKey = indexToKey(this.prefix, lastIndex);
      this.length -= 1;
      if (storageRemove(lastKey)) {
        return JSON.parse(storageGetEvicted());
      } else {
        throw new Error(ERR_INCONSISTENT_STATE$2);
      }
    }
  }
  replace(index, element) {
    if (index >= this.length) {
      throw new Error(ERR_INDEX_OUT_OF_BOUNDS);
    } else {
      let key = indexToKey(this.prefix, index);
      if (storageWrite(key, JSON.stringify(element))) {
        return JSON.parse(storageGetEvicted());
      } else {
        throw new Error(ERR_INCONSISTENT_STATE$2);
      }
    }
  }
  extend(elements) {
    for (let element of elements) {
      this.push(element);
    }
  }
  [Symbol.iterator]() {
    return new VectorIterator(this);
  }
  clear() {
    for (let i = 0; i < this.length; i++) {
      let key = indexToKey(this.prefix, i);
      storageRemove(key);
    }
    this.length = 0;
  }
  toArray() {
    let ret = [];
    for (let v of this) {
      ret.push(v);
    }
    return ret;
  }
  serialize() {
    return JSON.stringify(this);
  }
  // converting plain object to class object
  static deserialize(data) {
    let vector = new Vector(data.prefix);
    vector.length = data.length;
    return vector;
  }
}
class VectorIterator {
  constructor(vector) {
    this.current = 0;
    this.vector = vector;
  }
  next() {
    if (this.current < this.vector.len()) {
      let value = this.vector.get(this.current);
      this.current += 1;
      return {
        value,
        done: false
      };
    }
    return {
      value: null,
      done: true
    };
  }
}

const ERR_INCONSISTENT_STATE$1 = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
class UnorderedMap {
  constructor(prefix) {
    this.length = 0;
    this.prefix = prefix;
    this.keyIndexPrefix = prefix + "i";
    let indexKey = prefix + "k";
    let indexValue = prefix + "v";
    this.keys = new Vector(indexKey);
    this.values = new Vector(indexValue);
  }
  len() {
    let keysLen = this.keys.len();
    let valuesLen = this.values.len();
    if (keysLen != valuesLen) {
      throw new Error(ERR_INCONSISTENT_STATE$1);
    }
    return keysLen;
  }
  isEmpty() {
    let keysIsEmpty = this.keys.isEmpty();
    let valuesIsEmpty = this.values.isEmpty();
    if (keysIsEmpty != valuesIsEmpty) {
      throw new Error(ERR_INCONSISTENT_STATE$1);
    }
    return keysIsEmpty;
  }
  serializeIndex(index) {
    let data = new Uint32Array([index]);
    let array = new Uint8Array(data.buffer);
    return u8ArrayToBytes(array);
  }
  deserializeIndex(rawIndex) {
    let array = bytesToU8Array(rawIndex);
    let data = new Uint32Array(array.buffer);
    return data[0];
  }
  getIndexRaw(key) {
    let indexLookup = this.keyIndexPrefix + JSON.stringify(key);
    let indexRaw = storageRead(indexLookup);
    return indexRaw;
  }
  get(key) {
    let indexRaw = this.getIndexRaw(key);
    if (indexRaw) {
      let index = this.deserializeIndex(indexRaw);
      let value = this.values.get(index);
      if (value) {
        return value;
      } else {
        throw new Error(ERR_INCONSISTENT_STATE$1);
      }
    }
    return null;
  }
  set(key, value) {
    let indexLookup = this.keyIndexPrefix + JSON.stringify(key);
    let indexRaw = storageRead(indexLookup);
    if (indexRaw) {
      let index = this.deserializeIndex(indexRaw);
      return this.values.replace(index, value);
    } else {
      let nextIndex = this.len();
      let nextIndexRaw = this.serializeIndex(nextIndex);
      storageWrite(indexLookup, nextIndexRaw);
      this.keys.push(key);
      this.values.push(value);
      return null;
    }
  }
  remove(key) {
    let indexLookup = this.keyIndexPrefix + JSON.stringify(key);
    let indexRaw = storageRead(indexLookup);
    if (indexRaw) {
      if (this.len() == 1) {
        // If there is only one element then swap remove simply removes it without
        // swapping with the last element.
        storageRemove(indexLookup);
      } else {
        // If there is more than one element then swap remove swaps it with the last
        // element.
        let lastKey = this.keys.get(this.len() - 1);
        if (!lastKey) {
          throw new Error(ERR_INCONSISTENT_STATE$1);
        }
        storageRemove(indexLookup);
        // If the removed element was the last element from keys, then we don't need to
        // reinsert the lookup back.
        if (lastKey != key) {
          let lastLookupKey = this.keyIndexPrefix + JSON.stringify(lastKey);
          storageWrite(lastLookupKey, indexRaw);
        }
      }
      let index = this.deserializeIndex(indexRaw);
      this.keys.swapRemove(index);
      return this.values.swapRemove(index);
    }
    return null;
  }
  clear() {
    for (let key of this.keys) {
      let indexLookup = this.keyIndexPrefix + JSON.stringify(key);
      storageRemove(indexLookup);
    }
    this.keys.clear();
    this.values.clear();
  }
  toArray() {
    let ret = [];
    for (let v of this) {
      ret.push(v);
    }
    return ret;
  }
  [Symbol.iterator]() {
    return new UnorderedMapIterator(this);
  }
  extend(kvs) {
    for (let [k, v] of kvs) {
      this.set(k, v);
    }
  }
  serialize() {
    return JSON.stringify(this);
  }
  // converting plain object to class object
  static deserialize(data) {
    let map = new UnorderedMap(data.prefix);
    // reconstruct UnorderedMap
    map.length = data.length;
    // reconstruct keys Vector
    map.keys = new Vector(data.prefix + "k");
    map.keys.length = data.keys.length;
    // reconstruct values Vector
    map.values = new Vector(data.prefix + "v");
    map.values.length = data.values.length;
    return map;
  }
}
class UnorderedMapIterator {
  constructor(unorderedMap) {
    this.keys = new VectorIterator(unorderedMap.keys);
    this.values = new VectorIterator(unorderedMap.values);
  }
  next() {
    let key = this.keys.next();
    let value = this.values.next();
    if (key.done != value.done) {
      throw new Error(ERR_INCONSISTENT_STATE$1);
    }
    return {
      value: [key.value, value.value],
      done: key.done
    };
  }
}

const ERR_INCONSISTENT_STATE = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
class UnorderedSet {
  constructor(prefix) {
    this.length = 0;
    this.prefix = prefix;
    this.elementIndexPrefix = prefix + "i";
    let elementsPrefix = prefix + "e";
    this.elements = new Vector(elementsPrefix);
  }
  len() {
    return this.elements.len();
  }
  isEmpty() {
    return this.elements.isEmpty();
  }
  serializeIndex(index) {
    let data = new Uint32Array([index]);
    let array = new Uint8Array(data.buffer);
    return u8ArrayToBytes(array);
  }
  deserializeIndex(rawIndex) {
    let array = bytesToU8Array(rawIndex);
    let data = new Uint32Array(array.buffer);
    return data[0];
  }
  contains(element) {
    let indexLookup = this.elementIndexPrefix + JSON.stringify(element);
    return storageHasKey(indexLookup);
  }
  set(element) {
    let indexLookup = this.elementIndexPrefix + JSON.stringify(element);
    if (storageRead(indexLookup)) {
      return false;
    } else {
      let nextIndex = this.len();
      let nextIndexRaw = this.serializeIndex(nextIndex);
      storageWrite(indexLookup, nextIndexRaw);
      this.elements.push(element);
      return true;
    }
  }
  remove(element) {
    let indexLookup = this.elementIndexPrefix + JSON.stringify(element);
    let indexRaw = storageRead(indexLookup);
    if (indexRaw) {
      if (this.len() == 1) {
        // If there is only one element then swap remove simply removes it without
        // swapping with the last element.
        storageRemove(indexLookup);
      } else {
        // If there is more than one element then swap remove swaps it with the last
        // element.
        let lastElement = this.elements.get(this.len() - 1);
        if (!lastElement) {
          throw new Error(ERR_INCONSISTENT_STATE);
        }
        storageRemove(indexLookup);
        // If the removed element was the last element from keys, then we don't need to
        // reinsert the lookup back.
        if (lastElement != element) {
          let lastLookupElement = this.elementIndexPrefix + JSON.stringify(lastElement);
          storageWrite(lastLookupElement, indexRaw);
        }
      }
      let index = this.deserializeIndex(indexRaw);
      this.elements.swapRemove(index);
      return true;
    }
    return false;
  }
  clear() {
    for (let element of this.elements) {
      let indexLookup = this.elementIndexPrefix + JSON.stringify(element);
      storageRemove(indexLookup);
    }
    this.elements.clear();
  }
  toArray() {
    let ret = [];
    for (let v of this) {
      ret.push(v);
    }
    return ret;
  }
  [Symbol.iterator]() {
    return this.elements[Symbol.iterator]();
  }
  extend(elements) {
    for (let element of elements) {
      this.set(element);
    }
  }
  serialize() {
    return JSON.stringify(this);
  }
  // converting plain object to class object
  static deserialize(data) {
    let set = new UnorderedSet(data.prefix);
    // reconstruct UnorderedSet
    set.length = data.length;
    // reconstruct Vector
    let elementsPrefix = data.prefix + "e";
    set.elements = new Vector(elementsPrefix);
    set.elements.length = data.elements.length;
    return set;
  }
}

//defines the payout type we'll be returning as a part of the royalty standards.
class Token {
  constructor({
    ownerId,
    approvedAccountIds,
    nextApprovalId,
    royalty
  }) {
    //owner of the token
    this.owner_id = ownerId,
    //list of approved account IDs that have access to transfer the token. This maps an account ID to an approval ID
    this.approved_account_ids = approvedAccountIds,
    //the next approval ID to give out.
    this.next_approval_id = nextApprovalId,
    //keep track of the royalty percentages for the token in a hash map
    this.royalty = royalty;
  }
}

//The Json token is what will be returned from view calls.
class JsonToken {
  constructor({
    tokenId,
    ownerId,
    metadata,
    approvedAccountIds,
    royalty
  }) {
    //token ID
    this.token_id = tokenId,
    //owner of the token
    this.owner_id = ownerId,
    //token metadata
    this.metadata = metadata,
    //list of approved account IDs that have access to transfer the token. This maps an account ID to an approval ID
    this.approved_account_ids = approvedAccountIds,
    //keep track of the royalty percentages for the token in a hash map
    this.royalty = royalty;
  }
}

function restoreOwners(collection) {
  if (!collection || typeof collection !== "object" || !collection.prefix) {
    return null;
  }
  return UnorderedSet.deserialize(collection);
}

// Burn function to remove an NFT from circulation
function internalBurnToken({
  contract,
  token_ids,
  owner_id
}) {
  token_ids.forEach(token_id => {
    // Check if the token exists in tokensById
    const token = contract.tokensById.get(token_id);
    if (!token) {
      throw new Error("Token does not exist.");
    }

    // Ensure that the caller is the token owner or the contract owner
    if (token.owner_id !== owner_id && owner_id !== contract.owner_id) {
      throw new Error("Only the token owner or contract owner can burn contract token.");
    }

    // Remove the token from tokensById
    contract.tokensById.remove(token_id);

    // Remove the token metadata
    contract.tokenMetadataById.remove(token_id);

    // Update the tokensPerOwner map
    let ownerTokens = restoreOwners(contract.tokensPerOwner.get(token.owner_id));
    if (ownerTokens == null) {
      panic("No Tokens found for owner");
    }
    ownerTokens.remove(token_id);
    if (ownerTokens.isEmpty()) {
      contract.tokensPerOwner.remove(owner_id);
    } else {
      contract.tokensPerOwner.set(token.owner_id, ownerTokens);
    }
    // Log the burn event (optional)
    log(`Token ${token_id} burned by owner ${owner_id}`);
  });
}
function internalAddTokenToOwner(contract, accountId, tokenId) {
  // Ensure consistency in how you create new UnorderedSets
  let tokenSet = restoreOwners(contract.tokensPerOwner.get(accountId));
  // if (tokenSet) {
  //   const updatedTokens = tokenSet.concat(tokenId);
  //   contract.tokensPerOwner.set(accountId, updatedTokens);
  // }

  if (!tokenSet) {
    tokenSet = new UnorderedSet("tokensPerOwner" + accountId.toString());
  }

  // Insert the token ID into the set
  tokenSet.set(tokenId);

  // Save the set back to the contract storage
  contract.tokensPerOwner.set(accountId, tokenSet);
}

//remove a token from an owner (internal method and can't be called directly via CLI).
function internalRemoveTokenFromOwner(contract, accountId, tokenId) {
  //we get the set of tokens that the owner has
  let tokenSet = restoreOwners(contract.tokensPerOwner.get(accountId));
  //if there is no set of tokens for the owner, we panic with the following message:
  if (tokenSet == null) {
    panic("Token should be owned by the sender");
  }

  //we remove the the token_id from the set of tokens
  tokenSet.remove(tokenId);

  //if the token set is now empty, we remove the owner from the tokens_per_owner collection
  if (tokenSet.isEmpty()) {
    contract.tokensPerOwner.remove(accountId);
  } else {
    //if the token set is not empty, we simply insert it back for the account ID.
    contract.tokensPerOwner.set(accountId, tokenSet);
  }
}

//transfers the NFT to the receiver_id (internal method and can't be called directly via CLI).
function internalTransfer(contract, senderId, receiverId, tokenId, approvalId, memo) {
  //get the token object by passing in the token_id
  let token = contract.tokensById.get(tokenId);
  if (token == null) {
    panic("no token found");
  }

  //if the sender doesn't equal the owner, we check if the sender is in the approval list
  if (senderId != token.owner_id) {
    //if the token's approved account IDs doesn't contain the sender, we panic
    if (!token.approved_account_ids.hasOwnProperty(senderId)) {
      panic(`Unauthorized for ${senderId}`);
    }

    // If they included an approval_id, check if the sender's actual approval_id is the same as the one included
    if (approvalId != null) {
      //get the actual approval ID
      let actualApprovalId = token.approved_account_ids[senderId];
      //if the sender isn't in the map, we panic
      if (actualApprovalId == null) {
        panic("Sender is not approved account");
      }

      //make sure that the actual approval ID is the same as the one provided
      assert(actualApprovalId == approvalId, `The actual approval_id ${actualApprovalId} is different from the given approval_id ${approvalId}`);
    }
  }

  //we make sure that the sender isn't sending the token to themselves
  assert(token.owner_id != receiverId, "The token owner and the receiver should be different");

  //we remove the token from it's current owner's set
  internalRemoveTokenFromOwner(contract, token.owner_id, tokenId);
  //we then add the token to the receiver_id's set
  internalAddTokenToOwner(contract, receiverId, tokenId);

  //we create a new token struct
  let newToken = new Token({
    ownerId: receiverId,
    //reset the approval account IDs
    approvedAccountIds: {
      "marketplace.yusufdimari.testnet": 1
    },
    nextApprovalId: token.next_approval_id,
    //we copy over the royalties from the previous token
    royalty: token.royalty
  });

  //insert that new token into the tokens_by_id, replacing the old entry
  contract.tokensById.set(tokenId, newToken);

  //if there was some memo attached, we log it.
  if (memo != null) {
    log(`Memo: ${memo}`);
  }

  // Default the authorized ID to be None for the logs.
  let authorizedId;

  //if the approval ID was provided, set the authorized ID equal to the sender
  if (approvalId != null) {
    authorizedId = senderId;
  }

  // Construct the transfer log as per the events standard.
  let nftTransferLog = {
    // Standard name ("nep171").
    standard: NFT_STANDARD_NAME,
    // Version of the standard ("nft-1.0.0").
    version: NFT_METADATA_SPEC,
    // The data related with the event stored in a vector.
    event: "nft_transfer",
    data: [{
      // The optional authorized account ID to transfer the token on behalf of the old owner.
      authorized_id: authorizedId,
      // The old owner's account ID.
      old_owner_id: token.owner_id,
      // The account ID of the new owner of the token.
      new_owner_id: receiverId,
      // A vector containing the token IDs as strings.
      token_ids: [tokenId],
      // An optional memo to include.
      memo
    }]
  };

  // Log the serialized json.
  log(JSON.stringify(nftTransferLog));

  //return the previous token object that was transferred.
  return token;
}

//transfers the token to the receiver ID and returns the payout object that should be payed given the passed in balance.
function internalNftTransferPayout({
  contract,
  receiverId,
  tokenId,
  approvalId,
  memo,
  balance,
  maxLenPayout
}) {
  //assert that the user attached 1 yocto NEAR for security reasons
  assertOneYocto();
  //get the sender ID
  let senderId = predecessorAccountId();
  //transfer the token to the passed in receiver and get the previous token object back
  let previousToken = internalTransfer(contract, senderId, receiverId, tokenId, approvalId, memo);

  //refund the previous token owner for the storage used up by the previous approved account IDs
  refundApprovedAccountIds(previousToken.owner_id, previousToken.approved_account_ids);

  //get the owner of the token
  let ownerId = previousToken.owner_id;
  //keep track of the total perpetual royalties
  let totalPerpetual = 0;
  //keep track of the payout object to send back
  let payoutObj = {};
  //get the royalty object from token
  let royalty = previousToken.royalty;

  //make sure we're not paying out to too many people (GAS limits this)
  assert(Object.keys(royalty).length <= maxLenPayout, "Market cannot payout to that many receivers");

  //go through each key and value in the royalty object
  Object.entries(royalty).forEach(([key, value], index) => {
    //only insert into the payout if the key isn't the token owner (we add their payout at the end)
    if (key != ownerId) {
      payoutObj[key] = royaltyToPayout(value, balance);
      totalPerpetual += value;
    }
  });

  // payout to previous owner who gets 100% - total perpetual royalties
  payoutObj[ownerId] = royaltyToPayout(10000 - totalPerpetual, balance);

  //return the payout object
  return {
    payout: payoutObj
  };
}
function assertOneYocto() {
  assert(attachedDeposit().toString() === "1", "Requires attached deposit of exactly 1 yoctoNEAR");
}

//convert the royalty percentage and amount to pay into a payout (U128)
function royaltyToPayout(royaltyPercentage, amountToPay) {
  return (BigInt(royaltyPercentage) * BigInt(amountToPay) / BigInt(10000)).toString();
}

//refund the storage taken up by passed in approved account IDs and send the funds to the passed in account ID.
function refundApprovedAccountIdsIter(accountId, approvedAccountIds) {
  //get the storage total by going through and summing all the bytes for each approved account IDs
  let storageReleased = approvedAccountIds.map(e => bytesForApprovedAccountId(e)).reduce((partialSum, a) => partialSum + a, 0);
  let amountToTransfer = BigInt(storageReleased) * storageByteCost().valueOf();

  // Send the money to the beneficiary (TODO: don't use batch actions)
  const promise = promiseBatchCreate(accountId);
  promiseBatchActionTransfer(promise, amountToTransfer);
}

//refund a map of approved account IDs and send the funds to the passed in account ID
function refundApprovedAccountIds(accountId, approvedAccountIds) {
  //call the refundApprovedAccountIdsIter with the approved account IDs as keys
  refundApprovedAccountIdsIter(accountId, Object.keys(approvedAccountIds));
}

//calculate how many bytes the account ID is taking up
function bytesForApprovedAccountId(accountId) {
  // The extra 4 bytes are coming from Borsh serialization to store the length of the string.
  return accountId.length + 4 + 8;
}
function refundDeposit(storageUsed) {
  //get how much it would cost to store the information
  let requiredCost = storageUsed * storageByteCost().valueOf();
  //get the attached deposit
  let attachedDeposit$1 = attachedDeposit().valueOf();

  //make sure that the attached deposit is greater than or equal to the required cost
  assert(requiredCost <= attachedDeposit$1, `Must attach ${requiredCost} yoctoNEAR to cover storage`);

  //get the refund amount from the attached deposit - required cost
  let refund = attachedDeposit$1 - requiredCost;
  log(`Refunding ${refund} yoctoNEAR`);

  //if the refund is greater than 1 yocto NEAR, we refund the predecessor that amount
  if (refund > 1) {
    // Send the money to the beneficiary (TODO: don't use batch actions)
    const promise = promiseBatchCreate(predecessorAccountId());
    promiseBatchActionTransfer(promise, refund);
  }
}

const NFT_METADATA_SPEC = "nft-1.0.0";

/// This is the name of the NFT standard we're using
const NFT_STANDARD_NAME = "nep171";
function mintNFT({
  contract,
  receiverId,
  tokenId,
  metadata,
  perpetual_royalties
}) {
  let initialStorageUsage = storageUsage();
  let royalty = {};
  if (perpetual_royalties != null) {
    assert(Object.keys(perpetual_royalties).length < 7, "Cannot add more than 6 perpetual royalty amounts");
    Object.entries(perpetual_royalties).forEach(([account, amount], index) => {
      royalty[account] = amount;
    });
  }
  let token = new Token({
    ownerId: receiverId,
    royalty,
    nextApprovalId: 0,
    approvedAccountIds: {
      "marketplace.yusufdimari.testnet": 1
    }
  });
  assert(!contract.tokensById.containsKey(tokenId), "Token already exist");
  contract.tokensById.set(tokenId, token);
  contract.tokenMetadataById.set(tokenId, metadata);
  internalAddTokenToOwner(contract, receiverId, tokenId);
  let nftMintLog = {
    // Standard name ("nep171").
    standard: NFT_STANDARD_NAME,
    // Version of the standard ("nft-1.0.0").
    version: NFT_METADATA_SPEC,
    // The data related with the event stored in a vector.
    event: "nft_mint",
    data: [{
      // Owner of the token.
      owner_id: token.owner_id,
      // Vector of token IDs that were minted.
      token_ids: [tokenId]
    }]
  };
  log(`EVENT_JSON:${JSON.stringify(nftMintLog)}`);

  //calculate the required storage which was the used - initial TODO
  let requiredStorageInBytes = storageUsage().valueOf() - initialStorageUsage.valueOf();

  //refund any excess storage if the user attached too much. Panic if they didn't attach enough to cover the required.
  refundDeposit(requiredStorageInBytes);
}
function getToken({
  contract,
  tokenId
}) {
  let token = contract.tokensById.get(tokenId);
  if (token == null) return null;
  let metadata = contract.tokenMetadataById.get(tokenId);
  let jsToken = new JsonToken({
    metadata: metadata,
    ownerId: token.owner_id,
    approvedAccountIds: token.approved_account_ids,
    royalty: token.royalty,
    tokenId: tokenId
  });
  return jsToken;
}
function getOwnerTokens({
  contract,
  accountId,
  fromIndex,
  limit
}) {
  let tokenSet = restoreOwners(contract.tokensPerOwner.get(accountId));
  if (tokenSet == null) {
    return [];
  }
  let start = fromIndex ? parseInt(fromIndex) : 0;
  let max = limit ? parseInt(limit) : 50;
  let keys = tokenSet.toArray();
  let tokens = [];
  for (let i = start; i < max; i++) {
    if (i >= keys.length) {
      break;
    }
    let token = getToken({
      contract,
      tokenId: keys[i]
    });
    tokens.push(token);
  }
  return tokens;
}
function getTokens({
  contract,
  fromIndex,
  limit
}) {
  let tokens = [];
  let start = fromIndex ? parseInt(fromIndex) : 0;
  //take the first "limit" elements in the array. If we didn't specify a limit, use 50
  let max = limit ? limit : 50;
  let keys = contract.tokenMetadataById.toArray();
  for (let i = start; i < keys.length && i < start + max; i++) {
    let jsonToken = getToken({
      contract,
      tokenId: keys[i][0]
    });
    tokens.push(jsonToken);
  }
  return tokens;
}
function getTokenBatch({
  contract,
  token_ids,
  fromIndex,
  limit
}) {
  let tokens = [];
  let start = fromIndex ? parseInt(fromIndex) : 0;
  let max = limit ? limit : 50;
  if (start < 0 || start >= token_ids.length) {
    return []; // Return empty array if start is out of bounds
  }
  // Limit the tokenIds to the maximum allowed
  const end = Math.min(start + max, token_ids.length);
  const tokensToFetch = token_ids.slice(start, end);
  for (let tokenId of tokensToFetch) {
    const token = getToken({
      contract,
      tokenId
    });
    if (token) {
      tokens.push(token);
    }
  }
  return tokens;
}

var _class, _class2;

//@ts-ignore
let Contract = NearBindgen(_class = (_class2 = class Contract extends NearContract {
  constructor({
    owner_id,
    metadata = {
      spec: "nft-1.0.0",
      name: "NFT Tutorial Contract",
      symbol: "GOTEAM"
    }
  }) {
    super();
    this.metadata = metadata;
    this.owner_id = owner_id;
    this.tokensPerOwner = new LookupMap("tokensPerOwner");
    this.tokensById = new LookupMap("tokensById");
    this.tokenMetadataById = new UnorderedMap("tokensMetadataById");
  }
  default() {
    return new Contract({
      owner_id: ""
    });
  }
  //@ts-ignore
  nft_mint({
    token_id,
    metadata,
    receiver_id,
    perpetual_royalties
  }) {
    return mintNFT({
      contract: this,
      receiverId: receiver_id,
      tokenId: token_id,
      metadata,
      perpetual_royalties
    });
  }

  //@ts-ignore
  nft_burn({
    owner_id,
    token_ids
  }) {
    return internalBurnToken({
      contract: this,
      owner_id,
      token_ids
    });
  }

  //@ts-ignore
  nft_tokens_for_owner({
    account_id,
    from_index,
    limit
  }) {
    try {
      return getOwnerTokens({
        contract: this,
        accountId: account_id,
        fromIndex: from_index,
        limit
      });
    } catch (error) {
      log(`Error occurred: ${error.message}`);
      return [];
    }
  }

  //@ts-ignore
  nft_tokens({
    from_index,
    limit
  }) {
    try {
      return getTokens({
        contract: this,
        fromIndex: from_index,
        limit
      });
    } catch (error) {
      log(`Contract Error occurred: ${error.message}`);
      return [];
    }
  }

  //@ts-ignore
  get_token_batch({
    token_ids,
    from_index,
    limit
  }) {
    try {
      return getTokenBatch({
        contract: this,
        limit,
        token_ids,
        fromIndex: from_index
      });
    } catch (error) {
      log(`Contract Error occurred: ${error.message}`);
      return [];
    }
  }

  //for Transfer of Tokens
  //@ts-ignore
  //transfers the token to the receiver ID and returns the payout object that should be payed given the passed in balance.
  nft_transfer_payout({
    receiver_id,
    token_id,
    approval_id,
    memo,
    balance,
    max_len_payout
  }) {
    return internalNftTransferPayout({
      contract: this,
      receiverId: receiver_id,
      tokenId: token_id,
      approvalId: approval_id,
      memo: memo,
      balance: balance,
      maxLenPayout: max_len_payout
    });
  }
}, _applyDecoratedDescriptor(_class2.prototype, "nft_mint", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "nft_mint"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "nft_burn", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "nft_burn"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "nft_tokens_for_owner", [view], Object.getOwnPropertyDescriptor(_class2.prototype, "nft_tokens_for_owner"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "nft_tokens", [view], Object.getOwnPropertyDescriptor(_class2.prototype, "nft_tokens"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "get_token_batch", [view], Object.getOwnPropertyDescriptor(_class2.prototype, "get_token_batch"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "nft_transfer_payout", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "nft_transfer_payout"), _class2.prototype), _class2)) || _class;
function init() {
  Contract._init();
}
function nft_transfer_payout() {
  let _contract = Contract._get();
  _contract.deserialize();
  let args = _contract.constructor.deserializeArgs();
  let ret = _contract.nft_transfer_payout(args);
  _contract.serialize();
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function get_token_batch() {
  let _contract = Contract._get();
  _contract.deserialize();
  let args = _contract.constructor.deserializeArgs();
  let ret = _contract.get_token_batch(args);
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function nft_tokens() {
  let _contract = Contract._get();
  _contract.deserialize();
  let args = _contract.constructor.deserializeArgs();
  let ret = _contract.nft_tokens(args);
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function nft_tokens_for_owner() {
  let _contract = Contract._get();
  _contract.deserialize();
  let args = _contract.constructor.deserializeArgs();
  let ret = _contract.nft_tokens_for_owner(args);
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function nft_burn() {
  let _contract = Contract._get();
  _contract.deserialize();
  let args = _contract.constructor.deserializeArgs();
  let ret = _contract.nft_burn(args);
  _contract.serialize();
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function nft_mint() {
  let _contract = Contract._get();
  _contract.deserialize();
  let args = _contract.constructor.deserializeArgs();
  let ret = _contract.nft_mint(args);
  _contract.serialize();
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}

export { Contract, get_token_batch, init, nft_burn, nft_mint, nft_tokens, nft_tokens_for_owner, nft_transfer_payout };
//# sourceMappingURL=tcg-near-nft.js.map
