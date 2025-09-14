import { shopifyApi, LATEST_API_VERSION } from "@shopify/shopify-api";
import "@shopify/shopify-api/adapters/node";

const getShopifyClient = (tenant) => {
  const shopify = shopifyApi({
    apiKey: tenant.apiKey,
    apiSecretKey: tenant.apiSecret,
    hostName: tenant.shopDomain,
    apiVersion: LATEST_API_VERSION,
  });

  return new shopify.clients.Rest({
    session: {
      shop: tenant.shopDomain,
      accessToken: tenant.accessToken,
    },
  });
};

export default getShopifyClient;
