import { useEffect, useState } from "react"
import { useWeb3Contract, useMoralis } from "react-moralis"
import nftMarketplaceAbi from "../constants/nftMarketplace.json"
import nftAbi from "../constants/BasicNft.json"
import Image from "next/image"
import { Card, useNotification, Button } from "web3uikit"
import { ethers } from "ethers"
import UpdateListingModal from "./UpdateListingModal"

const truncateStr = (fullStr, strLen) => {
    if (fullStr.length <= strLen) return fullStr

    const separator = "..."
    let seperatorLength = separator.length
    const charsToShow = strLen - seperatorLength
    const frontChars = Math.ceil(charsToShow / 2)
    const backChars = Math.floor(charsToShow / 2)
    return (
        fullStr.substring(0, frontChars) +
        separator +
        fullStr.substring(fullStr.length - backChars)
    )
}

export default function NFTBox({ price, nftAddress, tokenId, marketplaceAddress, seller }) {
    const { isWeb3Enabled, account } = useMoralis()
    const [imageURI, setImageURI] = useState("")
    const [tokenName, setTokenName] = useState("")
    const [tokenDescription, setTokenDescription] = useState("")
    const [showModal, setShowModal] = useState(false)
    const hideModal = () => setShowModal(false)
    const dispatch = useNotification()
    const { runContractFunction } = useWeb3Contract()

    // TO SOLVE THE DELAY BETWEEN THE UPDATE AND THE UI UPDATE
    const [isPriceUpdating, setIsPriceUpdating] = useState(false)

    useEffect(() => {
        if (isPriceUpdating) {
            setIsPriceUpdating(false)
        }
    }, [price])

    const handleUpdateSuccess = () => {
        setIsPriceUpdating(true)
        hideModal()
    }

    // TO CANCEL LISTING AFTER NFT HAVE LISTED IN MARKETPLACE
    const handleCancelListing = async () => {
        const cancelOptions = {
            abi: nftMarketplaceAbi,
            contractAddress: marketplaceAddress,
            functionName: "cancelListing",
            params: {
                nftAddress: nftAddress,
                tokenId: tokenId,
            },
        }

        await runContractFunction({
            params: cancelOptions,
            onSuccess: (tx) => handleCancelSuccess(tx),
            onError: (error) => console.log(error),
        })
    }

    async function handleCancelSuccess(tx) {
        await tx.wait(1)
        dispatch({
            type: "success",
            message: "Listing canceled successfully",
            title: "Listing Canceled",
            position: "topR",
        })
        onClose && onClose()
    }

    const handleCancelClick = (e) => {
        e.stopPropagation()
        handleCancelListing()
    }

    const { runContractFunction: getTokenURI } = useWeb3Contract({
        abi: [
            {
                inputs: [
                    {
                        internalType: "uint256",
                        name: "tokenId",
                        type: "uint256",
                    },
                ],
                name: "tokenURI",
                outputs: [
                    {
                        internalType: "string",
                        name: "",
                        type: "string",
                    },
                ],
                stateMutability: "view",
                type: "function",
            },
        ],
        contractAddress: nftAddress,
        functionName: "tokenURI",
        params: {
            tokenId: tokenId,
        },
        onError: (error) => console.log("error"),
    })

    const { runContractFunction: buyItem } = useWeb3Contract({
        abi: nftMarketplaceAbi,
        contractAddress: marketplaceAddress,
        functionName: "buyItem",
        msgValue: price,
        params: {
            nftAddress: nftAddress,
            tokenId: tokenId,
        },
    })

    async function updateUI() {
        const tokenURI = await getTokenURI()
        // console.log(`The TokenURI is ${tokenURI}`)
        // We are going to cheat a little here...
        if (tokenURI) {
            // IPFS Gateway: A Server that will return IPFS files from a "normal" URL.
            const requestURL = tokenURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            const tokenURIResponse = await (await fetch(requestURL)).json()
            const imageURI = tokenURIResponse.image
            const imageURIURL = imageURI.replace("ipfs://", "https://ipfs.io/ipfs/")
            setImageURI(imageURIURL)
            setTokenName(tokenURIResponse.name)
            setTokenDescription(tokenURIResponse.description)
        }
        // get the tokenURI
        // using the image tag from the tokenURI, get the image
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const isOwnedByUser = seller === account || seller === undefined
    const formattedSellerAddress = isOwnedByUser ? "you" : truncateStr(seller || "", 15)

    // GIVE ANNOUNCEMENT IF INSUFFICIENT FUNDS
    const handleBuyError = (error) => {
        console.log("Error Info:", error)

        if (JSON.stringify(error).toLowerCase().includes("insufficient funds")) {
            dispatch({
                type: "error",
                title: "Insufficient funds",
                position: "topR",
            })
        } else {
            dispatch({
                type: "error",
                title: "Transaction Failed",
                message: "Please Try Again",
                position: "topR",
            })
        }
    }

    const handleCardClick = () => {
        isOwnedByUser
            ? setShowModal(true)
            : buyItem({
                  onError: handleBuyError,
                  onSuccess: () => handleBuyItemSuccess(),
              })
    }

    const handleBuyItemSuccess = () => {
        dispatch({
            type: "success",
            message: "Item bought!",
            title: "Item Bought",
            position: "topR",
        })
    }

    return (
        <div>
            <div>
                {imageURI ? (
                    <div>
                        <UpdateListingModal
                            isVisible={showModal}
                            tokenId={tokenId}
                            marketplaceAddress={marketplaceAddress}
                            nftAddress={nftAddress}
                            onClose={hideModal}
                            onUpdateSuccess={handleUpdateSuccess}
                        />
                        <Card
                            title={tokenName}
                            description={tokenDescription}
                            onClick={handleCardClick}
                        >
                            <div className="p-2">
                                <div className="flex flex-col items-end gap-2">
                                    <div>#{tokenId}</div>
                                    <div className="italic text-sm">
                                        Owned by: {formattedSellerAddress}
                                    </div>
                                    <Image
                                        loader={() => imageURI}
                                        src={imageURI}
                                        height="200"
                                        width="200"
                                        unoptimized={true}
                                        priority={true}
                                        alt="NFT Image"
                                    />
                                    {isPriceUpdating ? (
                                        <div className="font-bold text-sm text-blue-500 animate-pulse">
                                            Processing Price Update...
                                        </div>
                                    ) : (
                                        <div className="font-bold text-sm">
                                            {ethers.utils.formatUnits(price, "ether")} ETH
                                        </div>
                                    )}

                                    {/* BUTTON CANCEL LISTING */}
                                    {isOwnedByUser && (
                                        <div className="mt-2">
                                            <Button
                                                text="Cancel Listing"
                                                theme="colored"
                                                color="red"
                                                type="button"
                                                onClick={handleCancelClick}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                ) : (
                    <div>Loading...</div>
                )}
            </div>
        </div>
    )
}
