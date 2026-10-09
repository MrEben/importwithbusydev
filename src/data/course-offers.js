export const COURSE_PRICE_GHS = 420;

export const COURSE_ADD_ONS = [
  { id: "importers-blueprint", name: "Importer's Blueprint Book", priceGhs: 30 },
  { id: "supplier-communication", name: "Supplier Communication Guide", priceGhs: 20 },
];

export function getCourseTotalPesewas(addOnIds = []) {
  const selectedIds = new Set(addOnIds);
  const addOnTotal = COURSE_ADD_ONS.reduce(
    (total, addOn) => total + (selectedIds.has(addOn.id) ? addOn.priceGhs : 0),
    0,
  );

  return (COURSE_PRICE_GHS + addOnTotal) * 100;
}
