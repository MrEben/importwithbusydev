export const COURSE_PRICE_GHS = 420;

export const COURSE_ADD_ONS = [
  { id: "importers-blueprint", name: "Importer's Blueprint Book", priceGhs: 30 },
  { id: "supplier-communication", name: "Supplier Communication Guide", priceGhs: 20 },
];

export const COURSE_PACKAGES = [
  { id: "masterclass", addOnIds: [] },
  { id: "masterclass-blueprint", addOnIds: ["importers-blueprint"] },
  { id: "masterclass-supplier-guide", addOnIds: ["supplier-communication"] },
  {
    id: "masterclass-both-guides",
    addOnIds: ["importers-blueprint", "supplier-communication"],
  },
].map((coursePackage) => ({
  ...coursePackage,
  amountPesewas: getCourseTotalPesewas(coursePackage.addOnIds),
}));

export function getCourseTotalPesewas(addOnIds = []) {
  const selectedIds = new Set(addOnIds);
  const addOnTotal = COURSE_ADD_ONS.reduce(
    (total, addOn) => total + (selectedIds.has(addOn.id) ? addOn.priceGhs : 0),
    0,
  );

  return (COURSE_PRICE_GHS + addOnTotal) * 100;
}

export function getCoursePackage(addOnIds = []) {
  const selectedIds = [...addOnIds].sort();
  return COURSE_PACKAGES.find(
    (coursePackage) =>
      coursePackage.addOnIds.length === selectedIds.length &&
      coursePackage.addOnIds.every((id, index) => id === selectedIds[index]),
  );
}
