import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  ItemBought as ItemBoughtEvent,
  ItemCanceled as ItemCanceledEvent,
  ItemListed as ItemListedEvent,
} from "../generated/NftMarketplace/NftMarketplace";
import {
  ItemBought,
  ItemCanceled,
  ItemListed,
  ActiveItem,
} from "../generated/schema";

export function handleItemListed(event: ItemListedEvent): void {
  // Create Unique ID Manually
  // let itemListed = ItemListed.load(getIdFromEventParams(event.params.tokenId, event.params.nftAddress));
  let itemListedId =
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let itemListed = ItemListed.load(itemListedId);

  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );

  if (!itemListed) {
    itemListed = new ItemListed(itemListedId);
  }

  if (!activeItem) {
    activeItem = new ActiveItem(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }

  itemListed.seller = event.params.seller;
  activeItem.seller = event.params.seller;

  itemListed.nftAddress = event.params.nftAddress;
  activeItem.nftAddress = event.params.nftAddress;

  itemListed.tokenId = event.params.tokenId;
  activeItem.tokenId = event.params.tokenId;

  itemListed.price = event.params.price;
  activeItem.price = event.params.price;

  activeItem.buyer = Address.fromString(
    "0x0000000000000000000000000000000000000000"
  );

  itemListed.save();
  activeItem.save();
}

export function handleItemBought(event: ItemBoughtEvent): void {
  // Save that event in our graph
  // update our active items

  // get or create a itemListed object
  // each item needs a unique Id

  // ItemBoughtEvent: Just the raw Event
  // ItemBoughtObject: what we save in the graph
  let itemBoughtId =
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let itemBought = ItemBought.load(itemBoughtId);
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!itemBought) {
    itemBought = new ItemBought(itemBoughtId);
  }
  itemBought.buyer = event.params.buyer;
  itemBought.nftAddress = event.params.nftAddress;
  itemBought.tokenId = event.params.tokenId;
  activeItem!.buyer = event.params.buyer;

  itemBought.save();
  activeItem!.save();
}

export function handleItemCanceled(event: ItemCanceledEvent): void {
  let itemCanceledId = event.transaction.hash.toHexString() + "-" + event.logIndex.toString();
  let itemCanceled = ItemCanceled.load(itemCanceledId);
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!itemCanceled) {
    itemCanceled = new ItemCanceled(itemCanceledId);
  }

  itemCanceled.seller = event.params.seller;
  itemCanceled.nftAddress = event.params.nftAddress;
  itemCanceled.tokenId = event.params.tokenId;
  activeItem!.buyer = Address.fromString(
    "0x000000000000000000000000000000000000dEaD"
  );

  itemCanceled.save();
  activeItem!.save();
}

function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  return tokenId.toHexString() + nftAddress.toHexString();
}
