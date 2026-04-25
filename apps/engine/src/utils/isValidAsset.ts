import { Asset, ASSETS } from "../priceStore";

export const isValidAsset = (asset: string): asset is Asset  => {
    return ASSETS.some(x => x === asset);
}