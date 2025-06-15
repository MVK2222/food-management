exports.predictExpiry = (foodItem) => {
  const baseHours = foodItem.type === 'Vegetable' ? 12 : 24;
  const hours = baseHours - Math.floor(Math.random() * 5); // mock ML
  return new Date(Date.now() + hours * 60 * 60 * 1000);
};

exports.recommendNGOs = (location) => {
  // stub: filter by location later
  return ['NGO Hope', 'FoodShare Trust', 'Helping Hands Org'];
};

exports.detectAnomaly = async (type, count) => {
  const THRESHOLDS = {
    donations: 5,
    waste: 10,
  };

  if (type === 'waste' && count > THRESHOLDS.waste) {
    console.warn(`[Anomaly] High waste volume detected: ${count}`);
  }

  return false;
};
