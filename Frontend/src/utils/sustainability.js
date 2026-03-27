const round = (value) => Math.round(value * 100) / 100;

export const getEmissionBand = (emission = 0) => {
  if (emission <= 0.5) return { label: "Ultra Low", tone: "excellent", score: 92 };
  if (emission <= 1) return { label: "Low Impact", tone: "strong", score: 78 };
  if (emission <= 1.8) return { label: "Balanced", tone: "moderate", score: 61 };
  return { label: "Heavy Impact", tone: "high", score: 38 };
};

export const getBreakdownRows = (product) => {
  const breakdown = product?.carbonData?.breakdown || {};
  return [
    { key: "manufacturing", label: "Manufacturing", value: Number(breakdown.manufacturing || 0) },
    { key: "packaging", label: "Packaging", value: Number(breakdown.packaging || 0) },
    { key: "transport", label: "Transport", value: Number(breakdown.transport || 0) },
    { key: "handling", label: "Handling", value: Number(breakdown.handling || 0) },
  ];
};

export const getLeadingCarbonStage = (rows = []) => {
  if (!rows.length) return null;
  return [...rows].sort((a, b) => b.value - a.value)[0];
};

export const buildLifecycleNarrative = (product) => {
  const rows = getBreakdownRows(product);
  const leader = getLeadingCarbonStage(rows);
  const material = product?.carbonData?.material || "standard materials";

  if (!leader || leader.value <= 0) {
    return `This listing does not yet have a detailed lifecycle story, but it is currently tracked against ${material}.`;
  }

  return `${leader.label} is the largest share of this product's footprint, which suggests the biggest sustainability gains would come from improving ${leader.label.toLowerCase()} efficiency for ${material}.`;
};

export const enrichRecommendation = (item, currentEmission = 0) => {
  const candidateEmission = Number(item?.carbonFootprint || 0);
  const savings = round(Math.max(currentEmission - candidateEmission, 0));
  const band = getEmissionBand(candidateEmission);

  let reason = "Balanced alternative with a solid eco profile.";
  if (savings >= 1) reason = "Strong downgrade in carbon intensity compared with the current pick.";
  else if (savings > 0) reason = "Slightly cleaner footprint with a safer sustainability profile.";
  else if (item?.ecoScore >= 1) reason = "Eco-friendly substitute worth considering for material or sourcing reasons.";

  return {
    ...item,
    savings,
    band,
    reason,
  };
};

export const buildCartSwitchSuggestion = (cartItems = [], products = []) => {
  if (!cartItems.length || !products.length) return null;

  const sortedCartItems = [...cartItems].sort((a, b) => Number(b.emission || 0) - Number(a.emission || 0));

  for (const cartItem of sortedCartItems) {
    const alternatives = products
      .filter((product) => {
        const sameCategory = (product.category || "").toLowerCase() === (cartItem.category || "").toLowerCase();
        const differentProduct = String(product.id) !== String(cartItem.productId);
        const visibleStatus = !product.status || product.status === "Approved";
        return sameCategory && differentProduct && visibleStatus;
      })
      .sort((a, b) => Number(a.emission || 0) - Number(b.emission || 0));

    const betterOption = alternatives.find((product) => Number(product.emission || 0) < Number(cartItem.emission || 0));
    if (!betterOption) continue;

    const currentEmission = Number(cartItem.emission || 0);
    const alternativeEmission = Number(betterOption.emission || 0);
    const savings = round(currentEmission - alternativeEmission);
    const currentTotal = cartItems.reduce((sum, item) => sum + Number(item.emission || 0), 0);

    return {
      source: cartItem,
      alternative: betterOption,
      savings,
      currentTotal: round(currentTotal),
      projectedTotal: round(currentTotal - savings),
      alternativeBand: getEmissionBand(alternativeEmission),
    };
  }

  return null;
};
