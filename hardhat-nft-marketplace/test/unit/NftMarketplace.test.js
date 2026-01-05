const { expect, assert } = require("chai")
const {
    network,
    deployments,
    ethers,
    getNamedAccounts,
    userConfig,
} = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Nft Marketplace Tests", function () {
          let nftMarketplace, basicNft, deployer, player
          const PRICE = ethers.utils.parseEther("0.1")
          const TOKEN_ID = 0

          beforeEach(async function () {
              const accounts = await ethers.getSigners()
              // deployer = (await getNamedAccounts()).deployer
              // player = (await getNamedAccounts()).player
              deployer = accounts[0]
              player = accounts[1]
              await deployments.fixture(["all"])
              nftMarketplaceContract = await ethers.getContract(
                  "NftMarketplace"
              )
              nftMarketplace = nftMarketplaceContract.connect(deployer)
              basicNftContract = await ethers.getContract("BasicNft")
              basicNft = basicNftContract.connect(deployer)
              await basicNft.mintNft()
              await basicNft.approve(nftMarketplaceContract.address, TOKEN_ID)
          })

          describe("listItem", function () {
              it("emits an event after listing an item", async function () {
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.emit(nftMarketplace, "ItemListed")
              })
              it("exclusively items that haven't been listed", async function () {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  )
                  const error = `AlreadyListed("${basicNft.address}", ${TOKEN_ID})`
                  //   await expect(
                  //       nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  //   ).to.be.revertedWith("AlreadyListed")
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith(error)
              })
              it("exclusively allows owners to list", async function () {
                  nftMarketplace = nftMarketplaceContract.connect(player)
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("NotOwner")
              })
              it("needs approvals to list item", async function () {
                  await basicNft.approve(ethers.constants.AddressZero, TOKEN_ID)
                  await expect(
                      nftMarketplace.listItem(basicNft.address, TOKEN_ID, PRICE)
                  ).to.be.revertedWith("NotApprovedForMarketplace")
              })
              it("lists the item properly with correct price and seller", async function () {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  )
                  const listing = await nftMarketplace.getListing(
                      basicNft.address,
                      TOKEN_ID
                  )
                  assert.equal(listing.price.toString(), PRICE.toString())
                  assert.equal(listing.seller.toString(), deployer.address)
              })
              it("reverts if the price be 0", async function () {
                  const ZERO_PRICE = ethers.utils.parseEther("0")
                  await expect(
                      nftMarketplace.listItem(
                          basicNft.address,
                          TOKEN_ID,
                          ZERO_PRICE
                      )
                  ).to.be.revertedWith("PriceMustBeAboveZero")
              })
          })

          describe("cancelListing", function () {
              it("reverts if there is no listing", async function () {
                  const error = `NotListed("${basicNft.address}", ${TOKEN_ID})`
                  await expect(
                      nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith(error)
              })
              it("reverts if anyone but the owner tries to cancel listing", async function () {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  )
                  nftMarketplace = nftMarketplaceContract.connect(player)
                  await basicNft.approve(player.address, TOKEN_ID)
                  await expect(
                      nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith("NotOwner")
              })
              it("emits event and removes listing", async function () {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  )
                  await expect(
                      nftMarketplace.cancelListing(basicNft.address, TOKEN_ID)
                  ).to.emit(nftMarketplace, "ItemCanceled")
                  const listing = await nftMarketplace.getListing(
                      basicNft.address,
                      TOKEN_ID
                  )
                  assert.equal(listing.price.toString(), "0")
              })
          })

          describe("buyItem", function () {
              it("reverts if the item isn't listed", async function () {
                  await expect(
                      nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith("NotListed")
              })
              it("reverts if the price isn't met", async function () {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  )
                  await expect(
                      nftMarketplace.buyItem(basicNft.address, TOKEN_ID)
                  ).to.be.revertedWith("PriceNotMet")
              })
              it("transfers the NFT to the buyer and updates internal proceeds record", async function () {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  )
                  nftMarketplace = nftMarketplaceContract.connect(player)
                  await expect(
                      nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                          value: PRICE,
                      })
                  ).to.emit(nftMarketplace, "ItemBought")
                  const newOwner = await basicNft.ownerOf(TOKEN_ID)
                  const deployerProceeds = await nftMarketplace.getProceeds(
                      deployer.address
                  )
                  assert.equal(newOwner.toString(), player.address)
                  assert.equal(deployerProceeds.toString(), PRICE.toString())
              })
          })

          describe("updateListing", function () {
              it("must be owner and listed", async function () {
                  await expect(
                      nftMarketplace.updateListing(
                          basicNft.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.be.revertedWith("NotListed")
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  )
                  nftMarketplace = nftMarketplaceContract.connect(player)
                  await expect(
                      nftMarketplace.updateListing(
                          basicNft.address,
                          TOKEN_ID,
                          PRICE
                      )
                  ).to.be.revertedWith("NotOwner")
              })
              it("reverts if the new price is 0", async function () {
                  const updatePrice = ethers.utils.parseEther("0")
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  )
                  await expect(
                      nftMarketplace.updateListing(
                          basicNft.address,
                          TOKEN_ID,
                          updatePrice
                      )
                  ).to.be.revertedWith("NftMarketplace__PriceMustBeAboveZero")
              })
              it("updates the price of the item", async function () {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  )
                  const updatePrice = ethers.utils.parseEther("0.2")
                  await expect(
                      nftMarketplace.updateListing(
                          basicNft.address,
                          TOKEN_ID,
                          updatePrice
                      )
                  ).to.emit(nftMarketplace, "ItemListed")
                  const listing = await nftMarketplace.getListing(
                      basicNft.address,
                      TOKEN_ID
                  )
                  assert.equal(listing.price.toString(), updatePrice.toString())
              })
          })

          describe("withdrawProceeds", function () {
              it("doesn't allow 0 process withdrawls", async function () {
                  await expect(
                      nftMarketplace.withdrawProceeds()
                  ).to.be.revertedWith("NoProceeds")
              })
              it("withdraws proceeds", async function () {
                  await nftMarketplace.listItem(
                      basicNft.address,
                      TOKEN_ID,
                      PRICE
                  )
                  nftMarketplace = nftMarketplaceContract.connect(player)
                  await nftMarketplace.buyItem(basicNft.address, TOKEN_ID, {
                      value: PRICE,
                  })
                  nftMarketplace = nftMarketplaceContract.connect(deployer)

                  const deployerProceedsBefore =
                      await nftMarketplace.getProceeds(deployer.address)
                  const deployerBalanceBefore = await deployer.getBalance()
                  const txResponse = await nftMarketplace.withdrawProceeds()
                  const transactionReceipt = await txResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed * effectiveGasPrice
                  const deployerBalanceAfter = await deployer.getBalance()

                  assert.equal(
                      deployerBalanceAfter.add(gasCost).toString(),
                      deployerProceedsBefore
                          .add(deployerBalanceBefore)
                          .toString()
                  )
                  // Proceeds = $100
                  // Deployer Balance Before = $10
                  // Gas Cost = $2
                  // Deployer Balance After = $10 + $100 - $2 = $108
                  // Deployer Balance After + Gas Cost = $108 + $2 = $110
                  // Proceeds + Deployer Balance Before = $100 + $10 = $110
              })
          })
      })
