import { BigNumberInBase, BigNumberInWei } from "@injectivelabs/utils";

import { ChainOperator } from "../../../core/chainOperator/chainoperator";
import { isNativeAsset } from "../../../core/types/base/asset";
import { Order, Orderbook } from "../../../core/types/base/orderbook";

/**
 *
 */
export async function getOrderbookState(chainOperator: ChainOperator, orderbooks: Array<Orderbook>) {
	await Promise.all(
		orderbooks.map(async (orderbook) => {
			const ob = await chainOperator.queryOrderbook(orderbook.marketId);
			if (!ob) {
				console.log("cannot fetch orderbook: ", orderbook.marketId);
				return;
			}
			orderbook.sells = [];
			orderbook.buys = [];
			let quantityDecimals: number;
			let priceDecimals: number;
			if (isNativeAsset(orderbook.baseAssetInfo) && orderbook.baseAssetInfo.native_token.denom === "inj") {
				quantityDecimals = 12;
				priceDecimals = 12;
			} else {
				quantityDecimals = 0;
				priceDecimals = 0;
			}
			ob.buys.map((buy) => {
				const quantity = new BigNumberInWei(buy.quantity).toBase(quantityDecimals);
				const price = new BigNumberInBase(buy.price).toWei(priceDecimals);
				const buyOrder: Order = {
					quantity: +quantity.toFixed(),
					price: +price.toFixed(),
					type: "buy",
				};
				orderbook.buys.push(buyOrder);
				ob.sells.map((sell) => {
					const quantity = new BigNumberInWei(sell.quantity).toBase(quantityDecimals);
					const price = new BigNumberInBase(sell.price).toWei(priceDecimals);
					const sellOrder: Order = {
						quantity: +quantity.toFixed(),
						price: +price.toFixed(),
						type: "sell",
					};
					orderbook.sells.push(sellOrder);
				});
			});
		}),
	);
}
