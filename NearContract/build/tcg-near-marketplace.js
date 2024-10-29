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
function signerAccountId() {
  env.signer_account_id(0);
  return env.read_register(0);
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
// Standalone only APIs
function currentAccountId() {
  env.current_account_id(0);
  return env.read_register(0);
}
function input() {
  env.input(0);
  return env.read_register(0);
}
function promiseThen(promiseIndex, accountId, methodName, args, amount, gas) {
  return env.promise_then(promiseIndex, accountId, methodName, args, amount, gas);
}
function promiseBatchCreate(accountId) {
  return env.promise_batch_create(accountId);
}
function promiseBatchActionFunctionCall(promiseIndex, methodName, args, amount, gas) {
  env.promise_batch_action_function_call(promiseIndex, methodName, args, amount, gas);
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
function promiseResult(resultIdx) {
  let status = env.promise_result(resultIdx, 0);
  if (status == PromiseResult.Successful) {
    return env.read_register(0);
  } else if (status == PromiseResult.Failed || status == PromiseResult.NotReady) {
    return status;
  } else {
    panic(`Unexpected return code: ${status}`);
  }
}
function promiseReturn(promiseIdx) {
  env.promise_return(promiseIdx);
}
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
function bytes(strOrU8Array) {
  if (typeof strOrU8Array == "string") {
    return checkStringIsBytes(strOrU8Array);
  } else if (strOrU8Array instanceof Uint8Array) {
    return u8ArrayToBytes(strOrU8Array);
  }
  throw new Error("bytes: expected string or Uint8Array");
}
function checkStringIsBytes(str) {
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 255) {
      throw new Error(`string ${str} at index ${i}: ${str[i]} is not a valid byte`);
    }
  }
  return str;
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

class Listing {
  constructor({
    token_id,
    owner_id,
    approval_id,
    company_id,
    sale_price
  }) {
    this.token_id = token_id;
    this.owner_id = owner_id;
    this.approval_id = approval_id;
    this.company_id = company_id;
    this.sale_price = sale_price;
  }
}
const get_listings = ({
  contract
}) => {
  const listings = [];
  let keys = contract.listings.keys;
  for (let key of keys.toArray()) {
    const listing = contract.listings.get(key);
    if (listing) {
      listings.push(listing);
    }
  }
  return listings;
};
const get_listings_by_company = ({
  contract,
  company_id
}) => {
  const listings = Array.from(restoreOwners(contract.byCompanyId.get(company_id)) || []);
  return listings;
};
const get_listings_by_owner = ({
  contract,
  owner_id
}) => {
  const listings = Array.from(restoreOwners(contract.byOwnerId.get(owner_id)) || []);
  return listings;
};

const list_nft = ({
  contract,
  token_id,
  owner_id,
  approval_id,
  company_id,
  sale_price
}) => {
  const signerId = signerAccountId();
  predecessorAccountId();

  //make sure the signer isnt the predecessor
  // assert(
  //   signerId != contractId,
  //   "this function can only be called via a cross-contract call"
  // );
  assert(owner_id == signerId, "Only the owner can approve this transaction");
  let listing = new Listing({
    approval_id,
    company_id,
    owner_id,
    sale_price,
    token_id
  });
  let alreadyExist = contract.listings.get(token_id);
  assert(!alreadyExist, "Token already listed in Marketplace");
  //add the token to the marketplace listing
  contract.listings.set(token_id, listing);

  //add the token to the company listing
  let byCompanyId = restoreOwners(contract.byCompanyId.get(company_id));
  if (!byCompanyId) {
    byCompanyId = new UnorderedSet("byCompanyId" + company_id.toString());
  }
  byCompanyId.set(token_id);
  contract.byCompanyId.set(company_id, byCompanyId);

  //add the token to the owner listing
  let byOwnerId = restoreOwners(contract.byOwnerId.get(owner_id));
  if (!byOwnerId) {
    byOwnerId = new UnorderedSet("byOwnerId" + owner_id.toString());
  }
  byOwnerId.set(token_id);
  contract.byOwnerId.set(owner_id, byOwnerId);
  return {
    success: true
  };
};
function restoreOwners(collection) {
  if (!collection || typeof collection !== "object" || !collection.prefix) {
    return null;
  }
  return UnorderedSet.deserialize(collection);
}

const GAS_FOR_ROYALTIES = 115_000_000_000_000;
const GAS_FOR_NFT_TRANSFER = 15_000_000_000_000;
function internalRemoveListings({
  contract,
  listings
}) {
  let tokens = [];
  for (let key in listings) {
    let tokenId = listings[key];
    let listing = contract.listings.remove(tokenId);
    if (listing == null) panic("No listing");
    let byOwnerId = restoreOwners(contract.byOwnerId.get(listing.owner_id));
    if (byOwnerId == null) panic("No Listing by Owner");
    byOwnerId.remove(tokenId);
    if (byOwnerId.isEmpty()) {
      contract.byOwnerId.remove(listing.owner_id);
    } else {
      contract.byOwnerId.set(listing.owner_id, byOwnerId);
    }
    let byCompanyId = restoreOwners(contract.byCompanyId.get(listing.company_id));
    if (byCompanyId == null) panic("No Listing by Company");
    byCompanyId.remove(listing.token_id);
    if (byCompanyId.isEmpty()) {
      contract.byCompanyId.remove(listing.company_id);
    } else {
      contract.byCompanyId.set(listing.company_id, byCompanyId);
    }
    tokens.push(listing);
  }
  return {
    success: true,
    sales: tokens
  };
}

//place an offer on a specific sale. The sale will go through as long as your deposit is greater than or equal to the list price
function internalOffer({
  contract,
  nftContractId,
  tokenId
}) {
  //get the attached deposit and make sure it's greater than 0
  let deposit = attachedDeposit().valueOf();
  assert(deposit > 0, "deposit must be greater than 0");

  // //get the unique sale ID (contract + DELIMITER + token ID)
  // let contractAndTokenId = `${nftContractId}.${tokenId}`;
  // near.log("contractAndTokenId", contractAndTokenId);
  //get the sale object from the unique sale ID. If the sale doesn't exist, panic.
  let listing = contract.listings.get(tokenId);
  if (listing == null) {
    panic("no sale");
  }

  //get the buyer ID which is the person who called the function and make sure they're not the owner of the sale
  let buyerId = predecessorAccountId();
  assert(buyerId != listing.owner_id, "you can't offer on your own sale");

  //get the u128 price of the token (dot 0 converts from U128 to u128)
  let price = BigInt(listing.sale_price);
  //make sure the deposit is greater than the price
  assert(deposit >= price, "deposit must be greater than or equal to price");

  //process the purchase (which will remove the sale, transfer and get the payout from the nft contract, and then distribute royalties)
  processPurchase({
    contract,
    nftContractId,
    tokenId,
    price: deposit.toString(),
    buyerId
  });
}

//private function used when a sale is purchased.
//this will remove the sale, transfer and get the payout from the nft contract, and then distribute royalties
function processPurchase({
  contract,
  nftContractId,
  tokenId,
  price,
  buyerId
}) {
  //get the sale object by removing the sale
  let {
    sales
  } = internalRemoveListings({
    contract,
    listings: [tokenId]
  });
  let sale = sales[0];

  //initiate a cross contract call to the nft contract. This will transfer the token to the buyer and return
  //a payout object used for the market to distribute funds to the appropriate accounts.
  const promise = promiseBatchCreate(nftContractId);
  promiseBatchActionFunctionCall(promise, "nft_transfer_payout", bytes(JSON.stringify({
    receiver_id: buyerId,
    //purchaser (person to transfer the NFT to)
    token_id: tokenId,
    //token ID to transfer
    approval_id: sale.approval_id,
    //market contract's approval ID in order to transfer the token on behalf of the owner
    memo: "payout from market",
    //memo (to include some context)
    /*
                the price that the token was purchased for. This will be used in conjunction with the royalty percentages
                for the token in order to determine how much money should go to which account. 
            */
    balance: price,
    max_len_payout: 10 //the maximum amount of accounts the market can payout at once (this is limited by GAS)
  })), 1,
  // 1 yoctoNEAR
  GAS_FOR_NFT_TRANSFER);

  //after the transfer payout has been initiated, we resolve the promise by calling our own resolve_purchase function.
  //resolve purchase will take the payout object returned from the nft_transfer_payout and actually pay the accounts
  promiseThen(promise, currentAccountId(), "resolve_purchase", bytes(JSON.stringify({
    buyer_id: buyerId,
    //the buyer and price are passed in incase something goes wrong and we need to refund the buyer
    price: price
  })), 0,
  // no deposit
  GAS_FOR_ROYALTIES);
  return promiseReturn(promise);
}
function internalResolvePurchase({
  buyerId,
  price
}) {
  assert(currentAccountId() === predecessorAccountId(), "Only the contract itself can call this method");

  // checking for payout information returned from the nft_transfer_payout method
  let result = promiseResult(0);
  let payout = null;
  if (typeof result === "string") {
    //if we set the payout_option to None, that means something went wrong and we should refund the buyer

    try {
      let payoutOption = JSON.parse(result);
      if (Object.keys(payoutOption.payout).length > 10 || Object.keys(payoutOption.payout).length < 1) {
        //we'll check if length of the payout object is > 10 or it's empty. In either case, we return None
        throw "Cannot have more than 10 royalties";
        //if the payout object is the correct length, we move forward
      } else {
        //we'll keep track of how much the nft contract wants us to payout. Starting at the full price payed by the buyer
        let remainder = BigInt(price);
        //loop through the payout and subtract the values from the remainder.
        Object.entries(payoutOption.payout).forEach(([key, value], index) => {
          remainder = remainder - BigInt(value);
        });

        //Check to see if the NFT contract sent back a faulty payout that requires us to pay more or too little.
        //The remainder will be 0 if the payout summed to the total price. The remainder will be 1 if the royalties
        //we something like 3333 + 3333 + 3333.
        if (remainder == BigInt(0) || remainder == BigInt(1)) {
          //set the payout because nothing went wrong
          payout = payoutOption.payout;
        } else {
          //if the remainder was anything but 1 or 0, we return None
          throw "Payout is not correct";
        }
      }
    } catch (e) {
      log(`error parsing payout object ${result}`);
      payout = null;
    }
  }

  //if the payout was null, we refund the buyer for the price they payed and return
  if (payout == null) {
    const promise = promiseBatchCreate(buyerId);
    promiseBatchActionTransfer(promise, BigInt(price));
    return price;
  }
  // NEAR payouts
  for (let [key, value] of Object.entries(payout)) {
    const promise = promiseBatchCreate(key);
    promiseBatchActionTransfer(promise, BigInt(value));
  }

  //return the price payout out
  return price;
}

var _class, _class2;

//@ts-ignore
let Contract = NearBindgen(_class = (_class2 = class Contract extends NearContract {
  constructor({
    owner_id
  }) {
    super();
    this.ownerId = owner_id;
    this.listings = new UnorderedMap("listings");
    this.byOwnerId = new LookupMap("byOwnerId");
    this.byCompanyId = new LookupMap("byCompanyId");
    this.storageDeposits = new LookupMap("storageDeposits");
  }
  default() {
    return new Contract({
      owner_id: ""
    });
  }

  //@ts-ignore
  //list the nft for sale in marketPlace
  nft_list({
    token_id,
    owner_id,
    approval_id,
    company_id,
    sale_price
  }) {
    return list_nft({
      contract: this,
      token_id,
      owner_id,
      approval_id,
      company_id,
      sale_price
    });
  }

  //@ts-ignore
  nft_unlist({
    listings
  }) {
    return internalRemoveListings({
      contract: this,
      listings
    });
  }

  //@ts-ignore
  get_all_listings() {
    return get_listings({
      contract: this
    });
  }
  //@ts-ignore
  get_company_listings({
    company_id
  }) {
    return get_listings_by_company({
      contract: this,
      company_id
    });
  }
  //@ts-ignore
  get_owner_listings({
    owner_id
  }) {
    return get_listings_by_owner({
      contract: this,
      owner_id
    });
  }

  //Transfer of NFT
  //@ts-ignore
  //place an offer on a specific sale. The sale will go through as long as your deposit is greater than or equal to the list price
  offer({
    nft_contract_id,
    token_id
  }) {
    return internalOffer({
      contract: this,
      nftContractId: nft_contract_id,
      tokenId: token_id
    });
  }

  //@ts-ignore
  //place an offer on a specific sale. The sale will go through as long as your deposit is greater than or equal to the list price
  resolve_purchase({
    buyer_id,
    price
  }) {
    return internalResolvePurchase({
      buyerId: buyer_id,
      price: price
    });
  }
}, _applyDecoratedDescriptor(_class2.prototype, "nft_list", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "nft_list"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "nft_unlist", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "nft_unlist"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "get_all_listings", [view], Object.getOwnPropertyDescriptor(_class2.prototype, "get_all_listings"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "get_company_listings", [view], Object.getOwnPropertyDescriptor(_class2.prototype, "get_company_listings"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "get_owner_listings", [view], Object.getOwnPropertyDescriptor(_class2.prototype, "get_owner_listings"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "offer", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "offer"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "resolve_purchase", [call], Object.getOwnPropertyDescriptor(_class2.prototype, "resolve_purchase"), _class2.prototype), _class2)) || _class;
function init() {
  Contract._init();
}
function resolve_purchase() {
  let _contract = Contract._get();
  _contract.deserialize();
  let args = _contract.constructor.deserializeArgs();
  let ret = _contract.resolve_purchase(args);
  _contract.serialize();
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function offer() {
  let _contract = Contract._get();
  _contract.deserialize();
  let args = _contract.constructor.deserializeArgs();
  let ret = _contract.offer(args);
  _contract.serialize();
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function get_owner_listings() {
  let _contract = Contract._get();
  _contract.deserialize();
  let args = _contract.constructor.deserializeArgs();
  let ret = _contract.get_owner_listings(args);
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function get_company_listings() {
  let _contract = Contract._get();
  _contract.deserialize();
  let args = _contract.constructor.deserializeArgs();
  let ret = _contract.get_company_listings(args);
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function get_all_listings() {
  let _contract = Contract._get();
  _contract.deserialize();
  let args = _contract.constructor.deserializeArgs();
  let ret = _contract.get_all_listings(args);
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function nft_unlist() {
  let _contract = Contract._get();
  _contract.deserialize();
  let args = _contract.constructor.deserializeArgs();
  let ret = _contract.nft_unlist(args);
  _contract.serialize();
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}
function nft_list() {
  let _contract = Contract._get();
  _contract.deserialize();
  let args = _contract.constructor.deserializeArgs();
  let ret = _contract.nft_list(args);
  _contract.serialize();
  if (ret !== undefined) env.value_return(_contract.constructor.serializeReturn(ret));
}

export { Contract, get_all_listings, get_company_listings, get_owner_listings, init, nft_list, nft_unlist, offer, resolve_purchase };
//# sourceMappingURL=tcg-near-marketplace.js.map
